---
title: "When PostgreSQL JIT Backfires"
date: 2026-11-15
tags:
  - postgresql
  - performance
  - jit
draft: false
---

I started with what I thought was a straightforward database performance question:

"Do the right indexes exist for this query?"

I noticed users were sometimes waiting a little too long when using Photo Search to find their photos on [Retreev](https://retreev.app).

A gallery search operates over photos in Google Drive folders, including nested folders. Before finding matches, the database needs to determine which photos are eligible. We'll call this the scope.

That means following the target folders' hierarchy, keeping only active folders and associated files, excluding deleted records, and mapping the files to photo records.

Across a Room, a collection of related galleries, the scope grows wider and many more root folders are involved. This is where the wait could potentially become uncomfortably long.

The query uses a recursive common table expression (CTE) and a lateral subquery. Naturally, I wanted to know whether PostgreSQL was actually using the indexes I expected.

It apparently was, and the surprise was somewhere else.

The scope-building query has roughly this structure:

```sql
WITH RECURSIVE folder_tree(id) AS (
    -- Find the target root folders for the search.
    ...

    UNION

    -- Find eligible descendant folders.
    ...
), eligible_photos AS (
    SELECT DISTINCT ...
    FROM folder_tree folder
    CROSS JOIN LATERAL (
        -- Find eligible photos in this folder.
        ...
    ) folder_photos
)
SELECT * FROM eligible_photos;
```

I ran it with the following to examine the plan:

```sql
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
```

The plan confirmed that the important membership lookup used the index:

```text
Index Scan using googledrive_folder_files_pkey
  Index Cond: (membership.folder_id = folder.id)
```

Other important resources were also indexed.

The query took about **2.23 seconds** to return **11,861 eligible photos from 351 folders**.

Let's go to the bottom of the plan:

```text
JIT:
  Timing:
    Generation      8.168 ms
    Inlining      223.793 ms
    Optimization  796.509 ms
    Emission      522.898 ms
    Total        1551.368 ms

Execution Time: 2234.295 ms
```

You see what I'm seeing? About **1.55 seconds** went into JIT compilation. That's roughly 69% of the reported execution time.

But why compile a query?

You see, PostgreSQL can use just-in-time compilation to turn parts of a query's execution work into machine code. It pays an upfront cost to achieve faster execution, especially for repeated work.

What's really important here is that PostgreSQL has to make this decision **before it knows how much work the query will actually do**. The planner's estimated cost influences this decision.

In this case, PostgreSQL overestimated how much work the query would do, so it spent more time compiling the query than it saved in execution:

```text
Estimated folders: 17,213
Actual folders:       351
```

Further down the plan:
```text
Estimated rows: 1,583,596
Actual rows:       11,861
```

It turns out that recursive traversal is difficult to estimate due to hierarchical complexities. PostgreSQL employs a heuristic approach to handle this, but we see that it is way off here and triggers JIT compilation.

Let's disable JIT this time:

```sql
BEGIN READ ONLY;

SET LOCAL statement_timeout = '30s';
-- disable JIT compilation
SET LOCAL jit = off;

EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
WITH RECURSIVE ...
SELECT * FROM eligible_photos;

ROLLBACK;
```

We see that the execution time dropped:

| Setting | Execution time |
|---|---:|
| JIT enabled | 2,234 ms |
| JIT disabled | 433 ms |

While this isn't a rigorous benchmark, as other factors like cache state and system load can affect individual runs, the compilation time explicitly measured in the plan and the large difference in execution time were enough reason to investigate further.

The scope query from earlier is only one part of Photo Search—it determines the photos to consider. Other parts contribute to finding matches from the pool of eligible photos.

The full search query is built by composing queries, including the scope query, but I also wanted to test it without having to write it all. So I wrote a Go integration test that called the same full search query builder as the application. The test ran the statement under `EXPLAIN ANALYZE` and collected the plan.

With JIT alternately off and on:

| Run | Execution time | JIT compilation |
|---|---:|---:|
| Off | 14.3 ms | — |
| On | 885.5 ms | 858.2 ms |
| Off | 10.5 ms | — |
| On | 902.6 ms | 893.6 ms |

We see that compilation time dominated execution time. And so I applied a transaction-local setting to turn off JIT before executing the statement in the application:

```sql
SET LOCAL jit = off;
```

And performance improved without adding a new index, rewriting the matching algorithm, or changing the global database configuration. This is particularly noticeable when searching through multiple galleries at once. Remember, each gallery could also contain one or more Google Drive folders, and those folders could contain nested folders.

Now, this doesn't mean JIT compilation is bad or that disabling it makes every query faster. It is on by default because, above a certain estimated cost threshold, it can be a good price to pay to improve execution time. In this case involving `WITH RECURSIVE`, it was overly optimistic and counterproductive.


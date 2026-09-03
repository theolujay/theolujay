# Publishing

Every piece lives in its own folder:

```text
content/
  notes/a-small-thought/index.md
  posts/a-personal-story/index.md
  articles/a-technical-deep-dive/index.md
```

Create a draft with:

```bash
pnpm content:new note "A small thought"
pnpm content:new post "A personal story"
pnpm content:new article "A technical deep dive"
```

Each `index.md` begins with YAML frontmatter:

```yaml
---
title: A small thought
date: 2026-09-03
summary: One sentence for indexes, feeds, and search previews.
tags:
  - go
  - networking
draft: false
cover: ./cover.jpg
---
```

Only `title` and `date` are required. A summary is generated from the body when
it is omitted. Drafts appear locally but are excluded from production.

Images belong beside `index.md` and use ordinary Markdown with descriptive alt
text:

```markdown
![Packet flow across the services](./packet-flow.png)
```

Supported image formats are AVIF, GIF, JPEG, PNG, SVG, and WebP.

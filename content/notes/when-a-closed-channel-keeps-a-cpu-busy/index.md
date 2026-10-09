---
title: "When a Closed Channel Keeps a CPU Busy"
date: 2026-10-09
summary: A closed channel keeps a Go select case ready, so a loop can spin instead of blocking. Setting the channel to nil disables that case.
tags:
  - go
  - concurrency
  - channels
draft: false
---

I recently worked on a [`cloudflared` issue](https://github.com/cloudflare/cloudflared/issues/1753) involving unexpectedly high CPU usage during graceful tunnel shutdown.

The culprit was a Go `select` statement inside a `for` loop, listening on a channel that had already been closed. In Go, **receiving from a closed channel never blocks**; the receive completes immediately.

```go
func main() {
	shutdown := make(chan struct{})
	go func() {
		time.Sleep(time.Second)
		fmt.Println("closing shutdown channel")
		close(shutdown)
	}()

	stop := time.NewTimer(2 * time.Second)
	defer stop.Stop()

	var receives uint64
	for {
		select {
		case <-shutdown:
			receives++
		case <-stop.C:
			fmt.Println("receives from closed channel:", receives)
			return
		}
	}
}
```

In this example, the `select` case remains ready after the shutdown channel is closed. The loop can keep executing, repeatedly receiving from the closed channel instead of blocking while it waits for useful work.

```shell
$ go run .
closing shutdown channel
receives from closed channel: 15707475
```

The loop is **busy-waiting**, or *spinning*: in this run, it received from the closed channel more than 15 million times in about one second. The exact count varies between runs.

One way to stop the repeated receives -- while keeping the loop available to handle other cases -- is to set a local copy of the shutdown channel to `nil` after receiving from it:

```go
func main() {
	// ...
	shutdownCh := shutdown
	for {
		select {
		case <-shutdownCh:
			receives++
			shutdownCh = nil // Disable this select case after shutdown.
		case <-stop.C:
			fmt.Println("receives from closed channel:", receives)
			return
		}
	}
	// ...
}
```

**Note:** We could set `shutdown` itself to `nil`, but using a separate `shutdownCh` variable makes it clear that we're disabling this `select` case, not changing the original channel.

```shell
$ go run .
closing shutdown channel
receives from closed channel: 1
```

A receive from a `nil` channel blocks forever. In a `select`, that means the case is disabled, allowing the other cases to run normally.

But something else got me thinking:

**What happens when a goroutine actually blocks?**

As I understand it, Go's runtime parks a blocked goroutine, allowing other goroutines to use the available execution resources. But a goroutine that repeatedly executes a ready `select` case can keep consuming CPU cycles without making meaningful progress.

This distinction between *blocking* and *spinning* led me to a much bigger subject: operating-system scheduling.

How does the Go runtime schedule goroutines? How does the OS schedule threads? What happens to a goroutine's execution context when it stops running?

These are questions I intend to explore while reading *Operating Systems: Three Easy Pieces*.

For now, one lesson stands out: **code can execute continuously without actually making progress.**

---

P.S. I made a pull request to fix the [`cloudflared` issue](https://github.com/cloudflare/cloudflared/pull/1760).

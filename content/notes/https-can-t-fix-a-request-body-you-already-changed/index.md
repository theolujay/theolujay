---
title: "HTTPS Can't Fix a Request Body You Already Changed"
date: 2026-10-07
summary: A Go HTTP transport can still be reading a request body after returning a response. Reusing that body’s memory too soon can send mixed data, and TLS will encrypt it faithfully.
tags:
  - go
  - http
  - security
draft: false
---

I read about an [explanation of a Go HTTP race](https://victoriametrics.com/blog/http-race-condition/) by VictoriaMetrics and a certain question popped up in my head: If a request body can mix old and new data in this case, wouldn’t HTTPS keep the old data unreadable? This was influenced by a statement from vadimalekseev:

> It is a major security risk for proxies that use http.Client like this.

I wondered what security risk this could be.

The straight-up answer is no. HTTPS protects the connection between the client and server, but not a request body from changes made by the client before the body is sent.

## Where the mix happens

Calling `http.Post` might look something like, "send this body, give me the response." What really happens under the hood is that there are two Go routines spawned to fulfil that request, `writeLoop` to send the request body and `readLoop` waiting for the response. The server could respond using the request line and the headers alone and the call can return before the body is completely sent.

```go
// Source: https://github.com/golang/go/issues/81445
func main() {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// without this, http.Server reads request body before sending the response
		_ = http.NewResponseController(w).EnableFullDuplex()
		w.WriteHeader(http.StatusOK)
		w.(http.Flusher).Flush() // send response to client
		// read request body in "background"
		body, _ := io.ReadAll(r.Body)
		// an array to record what's been seen in the body
		stats := [256]int{}
		for _, v := range body {
			stats[v]++
		}
		// now let's check what we found
		for c, count := range stats {
			if count == 0 {
				continue
			}
			fmt.Printf("server: got %s %d times\n", string(c), count)
		}
	}))
	defer srv.Close()
	buf := bytes.Repeat([]byte("A"), 16*1024*1024)
	resp, err := http.Post(srv.URL, "application/octet-stream", bytes.NewReader(buf))
	if err != nil {
		panic(err)
	}
	_ = resp.Body.Close()
	fmt.Println("client: got response", resp.Status)
	// <reuse buf for the next request>
	// note, the backing-array is what io.ReadAll will continue read
	// even after http.Post has returned (from the 200 OK)
	copy(buf, bytes.Repeat([]byte("B"), len(buf)))
}
```
<!--Attribute the source to the GitHub issuee-->

From the example above, the body is a reader over `buf`, a byte slice filled with `A`s. Because the server had already responded (with `200 OK`), `readLoop` for that returns, but `writeLoop` isn't aware of this and keeps sending. In the middle of all that, we change `buf` from `A`s to `B`s. Because `writeLoop` is sending in chunks, by the time this switcheroo is done, it just continues from where it knows it stopped with the `B`s. Now we have a jumble of old and new bytes.

The bytes TLS encrypts are the bytes the transport (from client to server) managed to read. The server decrypts them normally, and may receive a body like `AAAA…BBBB`. So we see, TLS did its job. Nothing on the network has altered the encrypted traffic. The inconsistency happened earlier, at the client, inside `buf` in our example.

## When does it matter?

If a server or proxy is not going to act on the body, say in the case of a `401 Unauthorized` situation, then the malformed body may not matter if not used. It would matter if it reads and acts on the body; a retried request migh reach a backend with a payload assembled from two attempts. This can mean a rejected upload, bad data, or an unintended action if the mixed body is still valid and changes some operation.

This race condition is what they discovered at VictoriaMetrics with Go race detector. It warns about the unsynchronized [memory] access, but it does not on its own prove an exploitable bug. The path the bytes take after the race matters.

The [write-up](https://victoriametrics.com/blog/http-race-condition/) goes way deeper into the detail and also shows two outcomes: a race they considered harmless because the leftover body was ignored, and a proxy case where a shared reader’s state could affect a retry sent to a backend. There are discussions under [the Go issue](https://github.com/golang/go/issues/81445) about the asynchronous request-body close and the difficulty of knowing when it is safe to reuse that memory.

## The practical rule

Something I'm keeping in mind is: *keep the memory behind a request body unchanged until the transport has finished reading it. If there's a need to retry, give each request its own reader, and avoid mutating or pooling the underlying bytes while an earlier request may still use them.*

One small gotcha in my reproduction: I wrote the method value without calling it:

```go
_ = http.NewResponseController(w).EnableFullDuplex
```

On HTTP/1.x, the server normally consumes the unread request body before sending the response. Calling `EnableFullDuplex()` lets the handler write the response while it is still reading the body. HTTP/2 allows concurrent reads and writes by default, so the setting has no effect there. This only affects the server side and does not prevent the client from reusing the body’s memory too early.

```go
_ = http.NewResponseController(w).EnableFullDuplex()
```

---

My takeaway: HTTPS protects bytes in transit. It cannot make a changing buffer consistent before those bytes enter the encrypted connection.

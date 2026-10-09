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

I read [an explanation of a Go HTTP race](https://victoriametrics.com/blog/http-race-condition/) by VictoriaMetrics, and a question popped into my head: If a request body can mix old and new data in this situation, wouldn’t HTTPS keep the old data unreadable? The question was prompted by a statement from [vadimalekseev](https://github.com/golang/go/issues/81445#issuecomment-5872055368):

> It is a major security risk for proxies that use http.Client like this.

I wondered what security risk this could be.

The short answer is no. HTTPS protects the connection between the client and server, but it cannot protect a request body from changes made by the client before the body is sent.

## Where the mix happens

Calling `http.Post` might seem like a simple instruction: “Send this body and give me the response.” Under the hood, two goroutines handle the request: `writeLoop` sends the request body, while `readLoop` waits for the response. The server can respond using only the request line and headers, so `http.Post` may return before the body has been completely sent.

```go
// Source: https://github.com/golang/go/issues/81445
func main() {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Without this, http.Server reads the request body before sending the response.
		_ = http.NewResponseController(w).EnableFullDuplex()
		w.WriteHeader(http.StatusOK)
		w.(http.Flusher).Flush() // send response to client
		// Read the request body after sending the response.
		body, _ := io.ReadAll(r.Body)
		// Record how many times each byte value appears in the body.
		stats := [256]int{}
		for _, v := range body {
			stats[v]++
		}
		// Print the byte values that appeared in the body.
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
	// The request reader still references buf's backing array, so the
	// transport may continue reading it after http.Post returns the response.
	copy(buf, bytes.Repeat([]byte("B"), len(buf)))
}
```
In this example, the request body is a reader over `buf`, a byte slice filled with `A`s. Once the server responds with `200 OK`, the client's `readLoop` can return while the `writeLoop` is still sending the request body. If we change `buf` from `A`s to `B`s during that time, the transport may read some bytes before the change and others after it. The result can be a mixture of old and new data.

TLS encrypts the bytes the client transport reads from the request body. The server decrypts them normally and may receive a body like `AAAA…BBBB`. TLS did its job: nothing on the network altered the encrypted traffic. The inconsistency happened earlier, at the client, in `buf`.

## When does it matter?

If a server or proxy does not act on the body -- for example, when returning `401 Unauthorized` -- the malformed body may not matter if it is ignored. The risk is greater if the body is read and acted on. For example, a retry might reach a backend with a payload assembled from two attempts. That could result in a rejected upload, corrupted data, or an unintended action if the mixed body is still valid and changes the requested operation.

The Go race detector uncovered this race during VictoriaMetrics' investigation. It reports unsynchronized memory access, but that alone does not prove there is an exploitable bug. The path the bytes take after the race matters.

The [write-up](https://victoriametrics.com/blog/http-race-condition/) goes into much more detail and describes two outcomes: a race considered harmless because the leftover body was ignored, and a proxy case where a shared reader's state could affect a retry sent to a backend. The [Go issue](https://github.com/golang/go/issues/81445) also discusses the asynchronous request-body close and the difficulty of knowing when it is safe to reuse that memory.

## The practical rule

*Keep the memory backing a request body unchanged until the transport has finished reading it. If you need to retry, give each request its own reader, and avoid mutating or pooling the underlying bytes while an earlier request may still be using them.*

One small gotcha in my reproduction: I initially wrote the method value without calling it:

```go
_ = http.NewResponseController(w).EnableFullDuplex
```

On HTTP/1.x, the server normally consumes the unread request body before sending the response. Calling `EnableFullDuplex()` lets the handler write the response while it is still reading the body. HTTP/2 allows concurrent reads and writes by default, so the setting has no effect there. This only affects the server side and does not prevent the client from reusing the body’s memory too early.

```go
_ = http.NewResponseController(w).EnableFullDuplex()
```

---

My takeaway: HTTPS protects bytes in transit. It cannot make a changing buffer consistent before those bytes enter the encrypted connection.

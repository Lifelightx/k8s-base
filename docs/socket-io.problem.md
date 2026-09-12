
## classic socket.io + Kubernetes problem:
```
Socket.io's polling transport needs multiple HTTP requests to the same server instance (handshake → poll → poll → upgrade)
With 2 backend replicas and no session affinity, request 1 goes to pod A (creates session), request 2 goes to pod B (session unknown → 400 error)
Socket.io retries → hits pod A → works → next poll hits pod B → 400 → retry loop = flood of requests
```
```
Socket.io retries → hits pod A → works → next poll hits pod B → 400 → retry loop = flood of requests
```
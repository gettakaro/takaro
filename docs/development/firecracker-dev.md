---
sidebar_position: 10
---

### Required

- Firecracker installed
- Rustup installed

```sh
apt install musl build-essential musl-tools

rustup target add x86_64-unknown-linux-musl

./scripts/dev-vm.sh
```

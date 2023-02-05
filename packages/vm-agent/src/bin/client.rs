use std::{io::Write, os::fd::AsRawFd};

use vsock::{VsockAddr, VsockStream};

fn main() {
    let stream = VsockStream::connect(&VsockAddr::new(1, 8000)).expect("connection failed");
    let fd = stream.as_raw_fd();

    let data = "function fibonacci(num) {
  if (num == 1) return 0;
  if (num == 2) return 1;
  return fibonacci(num - 1) + fibonacci(num - 2);
};

console.log(fibonacci(7));";
    let buf = data.as_bytes();
    let len: u64 = buf.len().try_into().unwrap();

    vm_agent::send_u64(fd, len);
    vm_agent::send_loop(fd, &buf.to_vec(), len).unwrap();

    println!("I'm the client");
}

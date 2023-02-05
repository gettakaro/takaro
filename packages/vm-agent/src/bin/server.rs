use std::{
    io::{Read, Write},
    net::Shutdown,
    os::fd::AsRawFd,
    process::{Command, Stdio},
    thread,
};

use byteorder::{ByteOrder, NetworkEndian};
use vsock::{VsockAddr, VsockListener};

type Result<T> = std::result::Result<T, ServerError>;

enum ServerError {
    ConnectionError,
    IOError(std::io::Error),
}

struct Server {
    vsock: VsockListener,
}

const HEADER_SIZE_BYTES: u64 = std::mem::size_of::<u64>() as u64;

// By default, the VSOCK exporter should talk "out" to the host where the
// forwarder is running.
const DEFAULT_CID: u32 = libc::VMADDR_CID_HOST;

// The VSOCK port the forwarders listens on by default
const DEFAULT_PORT: u32 = 10240;

impl Server {
    pub fn new(host: u32, port: u32) -> Result<Self> {
        let vsock =
            VsockListener::bind(&VsockAddr::new(host, port)).map_err(ServerError::IOError)?;

        println!("Server listening for connections on port {}", port);

        Ok(Self { vsock })
    }

    pub fn handle_requests(self) -> Result<()> {
        for stream in self.vsock.incoming() {
            match stream {
                Ok(mut stream) => {
                    println!(
                        "New connection: {}",
                        stream.peer_addr().expect("unable to get peer address")
                    );
                    thread::spawn(move || {
                        let mut header_buf = [0u8; HEADER_SIZE_BYTES as usize];
                        stream.read_exact(&mut header_buf);

                        let length = NetworkEndian::read_u64(&mut header_buf);

                        let mut payload_buf = vec![];
                        payload_buf.resize(length as usize, 0);

                        stream.read_exact(&mut header_buf);
                    });
                }
                Err(e) => {
                    println!("Error: {}", e);
                }
            }
        }
        Ok(())
    }
}

fn execute_code(code: String) -> String {
    println!("{}", code.as_bytes().len());

    let output = Command::new("node")
        .arg("-e")
        .arg(code.trim_end())
        .output()
        .unwrap();

    let out = String::from_utf8(output.stdout).unwrap();

    out
}

fn main() {
    println!("I'm the server");

    const BUF_MAX_LEN: usize = 8192;

    let listen_port = 8000;
    let listener =
        VsockListener::bind(&VsockAddr::new(1, listen_port)).expect("bind and listen failed");

    for stream in listener.incoming() {
        match stream {
            Ok(mut stream) => {
                println!(
                    "New connection: {}",
                    stream.peer_addr().expect("unable to get peer address")
                );
                let fd = stream.as_raw_fd();

                let len: u64 = vm_agent::recv_u64(fd).unwrap();
                let mut buf: Vec<u8> = vec![];
                buf.resize(len.try_into().unwrap(), 0);

                vm_agent::recv_loop(fd, &mut buf, len).unwrap();

                let received = String::from_utf8(buf.to_vec()).unwrap();

                println!("received: {}", received);

                println!("output: {}", execute_code(received));

                stream.shutdown(Shutdown::Both).expect("shutdown failed");
            }
            Err(e) => {
                println!("Error: {}", e);
            }
        }
    }
}

#[cfg(test)]
mod tests {

    #[test]
    fn test_listen_for_open_connections() {
        assert_eq!(true, true)
    }
}

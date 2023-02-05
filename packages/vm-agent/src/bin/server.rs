use std::{net::Shutdown, os::fd::AsRawFd, process::Command};

use vm_agent::common::{Header, Payload};
use vsock::{VsockAddr, VsockListener};

type Result<T> = std::result::Result<T, ServerError>;

#[derive(Debug)]
enum ServerError {
    ConnectionError,
    IOError(std::io::Error),
}

struct Server {
    vsock: VsockListener,
}

const HEADER_SIZE_BYTES: u64 = std::mem::size_of::<Header>() as u64;

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
                Ok(stream) => {
                    println!(
                        "New connection: {}",
                        stream.peer_addr().expect("unable to get peer address")
                    );

                    let fd = stream.as_raw_fd();
                    let mut header_buf = [0 as u8; HEADER_SIZE_BYTES as usize].to_vec();

                    vm_agent::recv_loop(fd, &mut header_buf, 9).expect("could not read header");

                    let header: Header =
                        bincode::deserialize(&header_buf).expect("could not deserialize header");

                    println!("{:?}", header);

                    let mut payload_buf: Vec<u8> = vec![];
                    payload_buf.resize(header.payload_length as usize, 0);

                    vm_agent::recv_loop(fd, &mut payload_buf, header.payload_length)
                        .expect("could not read payload");

                    let payload: Payload =
                        bincode::deserialize(&payload_buf).expect("could not deserialize payload");

                    println!("payload: {:?}", payload);

                    let output = execute_code(payload.code);

                    println!("output: {}", output);

                    stream.shutdown(Shutdown::Both).expect("shutdown failed");
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
    let output = Command::new("node")
        .arg("-e")
        .arg(code.trim_end())
        .output()
        .unwrap();

    String::from_utf8(output.stdout).unwrap()
}

fn main() -> std::io::Result<()> {
    println!("I'm the server");

    let server = Server::new(libc::VMADDR_CID_LOCAL, 8000).unwrap();

    server.handle_requests().unwrap();

    Ok(())
}

#[cfg(test)]
mod tests {

    #[test]
    fn test_listen_for_open_connections() {
        assert_eq!(true, true)
    }
}

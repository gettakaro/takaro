use std::io::Read;
use std::io::Write;
use std::net::Shutdown;
use std::thread;
use vsock::{VsockAddr, VsockListener};

const BLOCK_SIZE: usize = 16384;

fn main() {
    let listen_port = 8000;
    let host = libc::VMADDR_CID_ANY;

    println!("kaka op {} en pipi in {}", host, listen_port);

    let listener =
        VsockListener::bind(&VsockAddr::new(host, listen_port)).expect("bind and listen failed");

    println!("Server listening for connections on port {}", listen_port);
    for stream in listener.incoming() {
        match stream {
            Ok(mut stream) => {
                println!(
                    "New connection: {}",
                    stream.peer_addr().expect("unable to get peer address")
                );
                thread::spawn(move || {
                    let mut buf = vec![];
                    buf.resize(BLOCK_SIZE, 0);
                    loop {
                        let read_bytes = match stream.read(&mut buf) {
                            Ok(0) => break,
                            Ok(read_bytes) => read_bytes,
                            Err(e) => panic!("read failed {}", e),
                        };

                        let mut total_written = 0;
                        while total_written < read_bytes {
                            let written_bytes = match stream.write(&buf[total_written..read_bytes])
                            {
                                Ok(0) => break,
                                Ok(written_bytes) => written_bytes,
                                Err(e) => panic!("write failed {}", e),
                            };
                            total_written += written_bytes;
                        }
                    }

                    stream.shutdown(Shutdown::Both).expect("shutdown failed");
                });
            }
            Err(e) => {
                println!("Error: {}", e);
            }
        }
    }
}

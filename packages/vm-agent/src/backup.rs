use std::{
    io::{Read, Write},
    net::Shutdown,
    thread, time,
};

use serde::Deserialize;
use vsock::{VsockAddr, VsockListener};

// #[derive(Deserialize)]
// struct FunctionRequest {
//     config: Option<String>,
//     code: String,
// }

// fn handle_client(stream: &mut UnixStream) -> io::Result<()> {
//     println!("Sending response");
//
//     stream.write(b"OK\n")?;
//
//     Ok(())
// }

// fn socket_server() -> io::Result<()> {
//     let socket = Path::new("/tmp/example.socket");
//
//     if socket.exists() {
//         fs::remove_file(&socket)?;
//     }
//
//     let listener = UnixListener::bind(&socket)?;
//
//     println!("Server listening on {:?}", socket);
//
//     for stream in listener.incoming() {
//         match stream {
//             Ok(mut stream) => {
//                 thread::spawn(move || handle_client(&mut stream));
//             }
//             Err(_err) => {
//                 break;
//             }
//         }
//     }
//     Ok(())
// }

fn echo_server() {
    const BLOCK_SIZE: usize = 1024;

    let listen_port = 8000;
    let listener =
        VsockListener::bind(&VsockAddr::new(1, listen_port)).expect("bind and listen failed");

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

                        stream.write(b"processing request\n").unwrap();

                        thread::sleep(time::Duration::from_secs(5));

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

// fn new_socket() -> io::Result<RawFd> {
//     Ok(socket(
//         AddressFamily::Vsock,
//         SockType::Stream,
//         SockFlag::SOCK_CLOEXEC,
//         None,
//     )?)
// }
//
// fn micro_http() {
//     unsafe {
//         let fd = new_socket().expect("could not create socket");
//         let socket_path = Path::new("/tmp/example.socket");
//
//         if socket_path.exists() {
//             fs::remove_file(&socket_path).unwrap();
//         }
//
//         let listen_port = 8000;
//         let vsock_addr = VsockAddr::new(1, listen_port);
//
//         let listener = UnixListener::bind(socket_path).unwrap();
//
//         bind(fd, &vsock_addr).expect("bind failed");
//
//         let mut server = HttpServer::new_from_fd(fd).expect("could not create server from fd");
//         server.start_server().expect("could not start server");
//
//         // Server loop processing requests.
//         loop {
//             for request in server.requests().unwrap() {
//                 let response = request.process(|request| {
//                     // Your code here.
//                     Response::new(request.http_version(), StatusCode::NoContent)
//                 });
//                 server.respond(response);
//             }
//             // Break this example loop.
//             break;
//         }
//     }
// }

fn main() {
    echo_server();
}

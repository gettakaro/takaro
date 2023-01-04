use micro_http::{
    Body, HttpServer, Response, ServerError, ServerRequest, ServerResponse, StatusCode,
};
use nix::sys::socket::VsockAddr;
use nix::sys::socket::{self, AddressFamily, SockFlag, SockType};
use serde::Deserialize;
use std::fs::File;
use std::io::prelude::*;
use std::os::unix::io::AsRawFd;
use std::path::Path;
use std::{fs, process::Command};
use std::{
    io::{Read, Write},
    net::Shutdown,
    thread,
};
// use vsock::{VsockAddr, VsockListener};

#[derive(Deserialize)]
struct FunctionRequest {
    config: String,
    code: String,
}

fn handle_request(request: ServerRequest) -> ServerResponse {
    println!("handling request");

    request.process(|request| {
        let function: Option<FunctionRequest> = match &request.body {
            Some(body) => serde_json::from_slice(body.raw()).unwrap(),
            _ => None,
        };

        // let output = if let Some(function) = function {
        //     fs::write("/tmp/function.js", function.code).expect("Unable to write file");
        //
        //     Some(
        //         Command::new("/usr/bin/node")
        //             .arg("/tmp/function.js")
        //             .output()
        //             .unwrap(),
        //     )
        // } else {
        //     None
        // };

        // dbg!(&output);

        println!("responding..");

        let mut response = Response::new(request.http_version(), StatusCode::OK);

        // if let Some(output) = output {
        //     let body = Body {
        //         body: output.stdout,
        //     };
        //     response.set_body(body);
        // }

        response
    })
}

// fn echo_server() {
//     const PORT: u32 = 8000;
//     const HOST_CID: u32 = 3;
//     const BLOCK_SIZE: usize = 16384;
//
//     println!("Creating vsock address with HOST_CID: {HOST_CID} & PORT: {PORT}");
//
//     let vsock_addr = VsockAddr::new(HOST_CID, PORT);
//
//     let listener = VsockListener::bind(&vsock_addr).expect("bind and listen failed");
//
//     println!("Server listening for connections on port {}", PORT);
//
//     for stream in listener.incoming() {
//         match stream {
//             Ok(mut stream) => {
//                 println!(
//                     "New connection: {}",
//                     stream.peer_addr().expect("unable to get peer address")
//                 );
//                 thread::spawn(move || {
//                     let mut buf = vec![];
//                     buf.resize(BLOCK_SIZE, 0);
//                     loop {
//                         let read_bytes = match stream.read(&mut buf) {
//                             Ok(0) => break,
//                             Ok(read_bytes) => read_bytes,
//                             Err(e) => panic!("read failed {}", e),
//                         };
//
//                         let mut total_written = 0;
//                         while total_written < read_bytes {
//                             let written_bytes = match stream.write(&buf[total_written..read_bytes])
//                             {
//                                 Ok(0) => break,
//                                 Ok(written_bytes) => written_bytes,
//                                 Err(e) => panic!("write failed {}", e),
//                             };
//                             total_written += written_bytes;
//                         }
//                     }
//
//                     stream.shutdown(Shutdown::Both).expect("shutdown failed");
//                 });
//             }
//             Err(e) => {
//                 println!("Error: {}", e);
//             }
//         }
//     }
// }

fn run_server() -> Result<(), ServerError> {
    let listenfd = socket::socket(
        AddressFamily::Vsock,
        SockType::Stream,
        SockFlag::SOCK_CLOEXEC,
        None,
    )
    .expect("test");

    let addr = VsockAddr::new(libc::VMADDR_CID_LOCAL, 8000);

    socket::bind(listenfd, &addr).expect("failed");
    socket::listen(listenfd, 1).expect("listen failed");

    // Start the server.
    let mut server = HttpServer::new_from_fd(listenfd).expect("failed");
    server.start_server().expect("failed to start");

    println!("server started");

    // Server loop processing requests.
    loop {
        for request in server.requests()? {
            println!("requestje");

            let response = handle_request(request);

            server.respond(response)?;
        }
    }

    Ok(())
}

fn main() {
    // echo_server();
    run_server();
}

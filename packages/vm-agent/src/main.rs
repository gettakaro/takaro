use micro_http::{HttpServer, ServerError, ServerRequest};
use serde::Deserialize;

use std::fs::File;
use std::io::prelude::*;
use std::process::Command;

#[derive(Deserialize)]
struct FunctionRequest {
    config: String,
    code: String,
}

fn handle_request(request: ServerRequest) {
    let function: Option<FunctionRequest> = match request.request.body {
        Some(body) => serde_json::from_slice(body.raw()).unwrap(),
        _ => None,
    };

    if let Some(function) = function {
        let mut file = File::create("function.js").unwrap();
        file.write_all(function.code.as_bytes());

        let output = Command::new("/usr/bin/node")
            .arg("./function.js")
            .output()
            .unwrap();

        dbg!(output);
    }
}

fn run_server() -> Result<(), ServerError> {
    let path_to_socket = "/tmp/agent.socket";
    std::fs::remove_file(path_to_socket).unwrap_or_default();

    // Start the server.
    let mut server = HttpServer::new(path_to_socket)?;
    server.start_server()?;

    // Connect a client to the server so it doesn't block in our example.
    let _socket = std::os::unix::net::UnixStream::connect(path_to_socket).unwrap();

    // Server loop processing requests.
    loop {
        for request in server.requests()? {
            handle_request(request);
        }
    }

    Ok(())
}

fn main() -> Result<(), ServerError> {
    run_server()?;

    Ok(())
}

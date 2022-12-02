use micro_http::{
    Body, HttpServer, Response, ServerError, ServerRequest, ServerResponse, StatusCode,
};
use serde::Deserialize;

use std::{fs, process::Command};

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

        let output = if let Some(function) = function {
            fs::write("/tmp/function.js", function.code).expect("Unable to write file");

            Some(
                Command::new("/usr/bin/node")
                    .arg("/tmp/function.js")
                    .output()
                    .unwrap(),
            )
        } else {
            None
        };

        dbg!(&output);

        println!("responding..");

        let mut response = Response::new(request.http_version(), StatusCode::OK);

        if let Some(output) = output {
            let body = Body {
                body: output.stdout,
            };
            response.set_body(body);
        }

        response
    })
}

fn run_server() -> Result<(), ServerError> {
    let path_to_socket = "/tmp/agent.sock_52";
    std::fs::remove_file(path_to_socket).unwrap_or_default();

    // Start the server.
    let mut server = HttpServer::new(path_to_socket)?;
    server.start_server()?;

    // Connect a client to the server so it doesn't block in our example.
    let _socket = std::os::unix::net::UnixStream::connect(path_to_socket).unwrap();

    // Server loop processing requests.
    loop {
        for request in server.requests()? {
            let response = handle_request(request);

            server.respond(response)?;
        }
    }

    Ok(())
}

fn main() -> Result<(), ServerError> {
    run_server()?;

    Ok(())
}

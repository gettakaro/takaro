use micro_http::{
    Body, HttpServer, Response, ServerError, ServerRequest, ServerResponse, StatusCode,
};
use serde::Deserialize;
use std::os::fd::{AsRawFd, RawFd};
use vsock::{VsockAddr, VsockListener};

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

fn run_server() -> Result<(), ServerError> {
    unsafe {
        let addr = VsockAddr::new(2, 55);

        println!("vscock address created");

        let raw_fd = VsockListener::bind(&addr)
            .expect("bind and listen failed")
            .as_raw_fd();

        println!("vsock listener bound");

        // Start the server.
        let mut server = HttpServer::new_from_fd(raw_fd)?;
        server.start_server()?;

        println!("server started");

        // Server loop processing requests.
        loop {
            for request in server.requests()? {
                let response = handle_request(request);

                server.respond(response)?;
            }
        }
    };

    Ok(())
}

fn main() -> Result<(), ServerError> {
    run_server()?;

    Ok(())
}

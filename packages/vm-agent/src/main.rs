use micro_http::{HttpServer, Response, StatusCode};

fn run_server() {
    let path_to_socket = "/tmp/agent.socket";
    std::fs::remove_file(path_to_socket).unwrap_or_default();

    // Start the server.
    let mut server = HttpServer::new(path_to_socket).unwrap();
    server.start_server().unwrap();

    // Connect a client to the server so it doesn't block in our example.
    let mut socket = std::os::unix::net::UnixStream::connect(path_to_socket).unwrap();

    // Server loop processing requests.
    loop {
        for request in server.requests().unwrap() {
            let response = request.process(|request| {
                // Your code here.
                Response::new(request.http_version(), StatusCode::NoContent)
            });
            server.respond(response);
        }
    }
}

fn main() {
    run_server();
}

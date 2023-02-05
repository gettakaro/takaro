use std::{env, error::Error, io::Write};

use vm_agent::common::Request;
use vsock::{VsockAddr, VsockStream};

fn main() -> Result<(), Box<dyn Error>> {
    println!("I'm the client");

    let args: Vec<String> = env::args().collect();

    let code = if args.len() > 1 {
        &args[1]
    } else {
        "console.log('Hello world!);"
    };

    let request = Request::new(1, code.to_string(), None)?;

    let mut stream = VsockStream::connect(&VsockAddr::new(1, 8000)).expect("connection failed");

    let encoded_header: Vec<u8> = bincode::serialize(&request.header)?;
    let encoded_payload: Vec<u8> = bincode::serialize(&request.payload)?;

    stream
        .write_all(&encoded_header)
        .expect("failed to write header");

    stream
        .write_all(&encoded_payload)
        .expect("failed to write paylod");

    Ok(())
}

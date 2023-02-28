use std::{collections::HashMap, sync::Arc};
use tokio::sync::Mutex;
use tokio_vsock::VsockListener;

const HOST: u32 = libc::VMADDR_CID_ANY;
const PORT: u32 = 8000;

#[derive(Debug)]
enum InitError {}

#[tokio::main]
async fn main() -> Result<(), InitError> {
    // env vars
    let envs = HashMap::new();

    // TODO: add error in case vsock device is not present
    let listener = VsockListener::bind(HOST, PORT).expect("bind failed");

    println!("listining on {}:{}", HOST, PORT);

    let waitpid_mutex = Arc::new(Mutex::new(()));

    let (api_server, tx, mut rx_sig) = vm_agent::api::server(envs, waitpid_mutex.clone(), listener);

    tokio::spawn(api_server);

    loop {}

    Ok(())
}

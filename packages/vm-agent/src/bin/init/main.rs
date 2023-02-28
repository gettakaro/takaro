use std::{collections::HashMap, sync::Arc};
use tokio::sync::Mutex;
use tokio_vsock::VsockListener;

#[derive(Debug)]
enum InitError {}

#[tokio::main]
async fn main() -> Result<(), InitError> {
    // env vars
    let envs = HashMap::new();

    // TODO: add error in case vsock device is not present
    let listener = VsockListener::bind(3, 8000).unwrap();
    let waitpid_mutex = Arc::new(Mutex::new(()));

    let (api_server, tx, mut rx_sig) = vm_agent::api::server(envs, waitpid_mutex.clone(), listener);
    tokio::spawn(api_server);

    Ok(())
}

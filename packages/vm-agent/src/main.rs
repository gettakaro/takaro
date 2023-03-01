use tokio_vsock::VsockListener;

const HOST: u32 = libc::VMADDR_CID_ANY;
const PORT: u32 = 8000;

#[derive(Debug)]
enum InitError {}

#[tokio::main]
async fn main() -> Result<(), InitError> {
    tracing_subscriber::fmt().init();

    let listener = VsockListener::bind(HOST, PORT).expect("bind failed");

    tracing::info!("listening on {HOST}:{PORT}");

    vm_agent::api::server(listener).await.unwrap();

    Ok(())
}

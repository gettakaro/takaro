use anyhow::Error;
use futures::TryStreamExt;
use std::{env, io, net::Ipv4Addr};
use tokio_vsock::VsockListener;

const HOST: u32 = libc::VMADDR_CID_ANY;
const PORT: u32 = 8000;

#[derive(Debug, thiserror::Error)]
enum InitError {
    #[error("an unhandled IO error occurred: {}", 0)]
    IoError(#[from] io::Error),

    #[error("an unhandled netlink error occurred: {}", 0)]
    NetlinkError(#[from] rtnetlink::Error),

    #[error("an unhandled error occurred: {}", 0)]
    Error(#[from] Error),
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt().init();

    if let Err(e) = env::set_current_dir("/app") {
        tracing::error!("failed to change directory: {}", e);
    }

    if let Ok(current_dir) = env::current_dir() {
        tracing::info!("current working directory: {}", current_dir.display());
    } else {
        tracing::error!("cailed to get current working directory");
    }

    let listener = VsockListener::bind(HOST, PORT).expect("bind failed");

    tracing::info!("listening on {HOST}:{PORT}");

    vm_agent::api::server(listener).await?;

    Ok(())
}

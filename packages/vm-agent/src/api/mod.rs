use std::{
    pin::Pin,
    task::{ready, Context, Poll},
};

use axum::{
    routing::{get, post},
    Router,
};
use hyper::server::accept::Accept;
use tokio_vsock::{VsockListener, VsockStream};
use tower::BoxError;
use tower_http::trace::TraceLayer;

mod handlers;

const VSOCK_HOST: u32 = libc::VMADDR_CID_ANY;
const VSOCK_PORT: u32 = 8000;

pub struct ServerAccept {
    vsl: VsockListener,
}

impl Accept for ServerAccept {
    type Conn = VsockStream;
    type Error = BoxError;

    fn poll_accept(
        mut self: Pin<&mut Self>,
        cx: &mut Context<'_>,
    ) -> Poll<Option<Result<Self::Conn, Self::Error>>> {
        let (stream, _addr) = ready!(self.vsl.poll_accept(cx))?;
        Poll::Ready(Some(Ok(stream)))
    }
}

pub fn app() -> Router {
    Router::new()
        .route("/health", get(handlers::health))
        .route("/exec", post(handlers::exec_cmd))
        .layer(TraceLayer::new_for_http())
}

pub async fn server() -> Result<(), anyhow::Error> {
    let mode = std::env::var("MODE").unwrap_or_default();

    if mode == "http" {
        let addr = "127.0.0.1:8000".parse().unwrap();

        tracing::info!("starting http server on {}", addr);

        axum::Server::bind(&addr)
            .serve(app().into_make_service())
            .await?;
    } else {
        let listener = VsockListener::bind(VSOCK_HOST, VSOCK_PORT).expect("bind failed");

        tracing::info!("starting vsock server on {VSOCK_HOST}:{VSOCK_PORT}");

        axum::Server::builder(ServerAccept { vsl: listener })
            .serve(app().into_make_service())
            .await?;
    }

    Ok(())
}

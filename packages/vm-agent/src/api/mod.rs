use std::{
    pin::Pin,
    task::{ready, Context, Poll},
};

use axum::{
    routing::{get, post, IntoMakeService},
    Router,
};
use hyper::server::accept::Accept;
use tokio_vsock::{VsockListener, VsockStream};
use tower::BoxError;
use tower_http::trace::TraceLayer;

mod handlers;

const HOST: u32 = libc::VMADDR_CID_ANY;
const PORT: u32 = 8000;

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
        .route("/health", get(|| async { "OK" }))
        .route("/exec", post(handlers::exec_cmd))
        .layer(TraceLayer::new_for_http())
}

pub fn server() -> axum::Server<ServerAccept, IntoMakeService<Router>> {
    let listener = VsockListener::bind(HOST, PORT).expect("bind failed");

    tracing::info!("listening on {HOST}:{PORT}");

    axum::Server::builder(ServerAccept { vsl: listener }).serve(app().into_make_service())
}

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

pub fn server(listener: VsockListener) -> axum::Server<ServerAccept, IntoMakeService<Router>> {
    axum::Server::builder(ServerAccept { vsl: listener }).serve(app().into_make_service())
}

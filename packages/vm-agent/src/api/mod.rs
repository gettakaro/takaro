use std::sync::Arc;
use std::task::{ready, Context, Poll};
use std::{collections::HashMap, pin::Pin};

use axum::{
    routing::{get, post},
    Router,
};
use futures::Future;
use hyper::server::accept::Accept;
use nix::sys::signal::Signal;
use tokio::sync::mpsc;
use tokio::sync::{oneshot, Mutex};
use tokio_vsock::{VsockListener, VsockStream};
use tower::BoxError;
use tower_http::trace::TraceLayer;

struct ServerAccept {
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

/*
pub mod exec;
pub mod signals;
pub mod sys;
*/

pub fn server(
    envs: HashMap<String, String>,
    waitpid_mutex: Arc<Mutex<()>>,
    listener: VsockListener,
) -> (
    impl Future<Output = hyper::Result<()>>,
    oneshot::Sender<(i32, bool)>,
    mpsc::Receiver<Signal>,
) {
    let app = Router::new()
        .layer(TraceLayer::new_for_http())
        .route("/hello", get(hello))
        .route("/status", get(status))
        .route("/sysinfo", get(sysinfo))
        .route("/signals/RANDOM", get(signals))
        .route("/exitcode", get(exitcode))
        .route("/exec", post(exec));

    let (tx, rx) = oneshot::channel();
    let (tx_sig, rx_sig) = mpsc::channel(1);

    (
        // TODO: use into_make_service_connection_info()
        axum::Server::builder(ServerAccept { vsl: listener }).serve(app.into_make_service()),
        tx,
        rx_sig,
    )
}

// Handlers
async fn hello() {
    todo!()
}
async fn status() {
    todo!()
}
async fn sysinfo() {
    todo!()
}
async fn signals() {
    todo!()
}
async fn exitcode() {
    todo!()
}
async fn exec() {
    todo!()
}

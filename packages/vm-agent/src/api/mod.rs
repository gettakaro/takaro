use std::{
    pin::Pin,
    task::{ready, Context, Poll},
};

use axum::{response::IntoResponse, routing::post, Router};
use hyper::server::accept::Accept;
use tokio_vsock::{VsockListener, VsockStream};
use tower::BoxError;
use tower_http::trace::TraceLayer;

use std::os::unix::process::ExitStatusExt;

use axum::Json;
use hyper::StatusCode;
use serde_derive::Serialize;
use tokio::process::Command;
use tracing::debug;

mod exec;

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

pub fn server(listener: VsockListener) {
    let app = Router::new()
        .layer(TraceLayer::new_for_http())
        .route("/exec", post(exec_cmd));

    axum::Server::builder(ServerAccept { vsl: listener }).serve(app.into_make_service());
}

// Handlers
async fn exec() -> impl IntoResponse {
    todo!()
}

#[derive(Debug, Serialize)]
struct ExecResponse {
    exit_code: Option<i32>,
    exit_signal: Option<i32>,
    stdout: Vec<u8>,
    stderr: Vec<u8>,
}

#[derive(Debug, Serialize)]
pub struct ExecRequest {
    cmd: Vec<String>,
}

pub async fn exec_cmd(Json(mut payload): Json<ExecRequest>) -> impl IntoResponse {
    let full_cmd = payload.cmd.join(" ");

    debug!("exec_cmd: {}", full_cmd);

    let mut command = Command::new(payload.cmd.swap_remove(0));
    for arg in payload.cmd.into_iter() {
        command.arg(arg);
    }

    let output = command.output().await.unwrap();

    let status = output.status;

    debug!(
        "command '{}' exited with code: {}",
        full_cmd,
        status
            .code()
            .map(|i| i.to_string())
            .unwrap_or_else(|| "unknown".to_string())
    );

    (
        StatusCode::OK,
        Json(ExecResponse {
            exit_code: status.code(),
            exit_signal: status.signal(),
            stderr: output.stderr,
            stdout: output.stdout,
        }),
    )
}

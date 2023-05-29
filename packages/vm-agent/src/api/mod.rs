use std::{
    pin::Pin,
    task::{ready, Context, Poll},
};

use axum::{
    routing::{get, post},
    Router,
};
use axum_tracing_opentelemetry::{opentelemetry_tracing_layer, response_with_trace_layer};
use hyper::server::accept::Accept;
use tokio_vsock::{VsockListener, VsockStream};
use tower::BoxError;

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
        // include trace context as header into the response
        .layer(response_with_trace_layer())
        // opentelemetry_tracing_layer setup `TraceLayer`,
        // that is provided by tower-http so you have to add that as a dependency.
        .layer(opentelemetry_tracing_layer())
}

pub async fn server() -> Result<(), anyhow::Error> {
    let mode = std::env::var("MODE").unwrap_or_default();

    if mode == "http" {
        let addr = "127.0.0.1:8000".parse().unwrap();

        tracing::info!("starting http server on {}", addr);

        axum::Server::bind(&addr)
            .serve(app().into_make_service())
            .with_graceful_shutdown(shutdown_signal())
            .await?;
    } else {
        let listener = VsockListener::bind(VSOCK_HOST, VSOCK_PORT).expect("bind failed");

        tracing::info!("starting vsock server on {VSOCK_HOST}:{VSOCK_PORT}");

        axum::Server::builder(ServerAccept { vsl: listener })
            .serve(app().into_make_service())
            .with_graceful_shutdown(shutdown_signal())
            .await?;
    }

    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }

    tracing::warn!("signal received, starting graceful shutdown");
    opentelemetry::global::shutdown_tracer_provider();
}

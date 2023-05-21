use opentelemetry::sdk::{trace, Resource};
use opentelemetry_otlp::WithExportConfig;
use opentelemetry_semantic_conventions as semconv;
use std::env;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod api;

fn setup_tracing() -> anyhow::Result<()> {
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(opentelemetry_otlp::new_exporter().tonic().with_endpoint(
            env::var("TRACING_ENDPOINT").unwrap_or("http://172.21.0.3:4317".to_string()),
        ))
        .with_trace_config(trace::config().with_resource(Resource::new(vec![
            semconv::resource::SERVICE_NAME.string("vm-agent"),
        ])))
        .install_simple()?;

    let opentelemetry = tracing_opentelemetry::layer().with_tracer(tracer);

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "vm-agent=trace,tower_http=trace,axum::rejection=trace".into()),
        )
        .with(opentelemetry)
        .with(tracing_subscriber::fmt::layer())
        .init();

    Ok(())
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    setup_tracing()?;

    if let Err(e) = env::set_current_dir("/app") {
        tracing::error!("failed to change directory: {}", e);
    }

    if let Ok(current_dir) = env::current_dir() {
        tracing::info!("current working directory: {}", current_dir.display());
    } else {
        tracing::error!("cailed to get current working directory");
    }

    api::server().await?;

    Ok(())
}

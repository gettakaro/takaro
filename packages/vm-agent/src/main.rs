use opentelemetry::{
    global, runtime,
    sdk::{propagation::TraceContextPropagator, trace as sdktrace, Resource},
    trace::TraceError,
    KeyValue,
};
use opentelemetry_otlp::WithExportConfig;
use std::env;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter, Registry};

mod api;

fn setup_tracing() -> Result<(), TraceError> {
    global::set_text_map_propagator(TraceContextPropagator::new());

    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(opentelemetry_otlp::new_exporter().tonic().with_endpoint(
            env::var("TRACING_ENDPOINT").unwrap_or("http://172.16.238.254:4317".to_string()),
        ))
        .with_trace_config(
            sdktrace::config().with_resource(Resource::new(vec![KeyValue::new(
                opentelemetry_semantic_conventions::resource::SERVICE_NAME,
                "vm-agent",
            )])),
        )
        .install_batch(runtime::Tokio)?;

    Registry::default()
        .with(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "vm_agent=trace,tower_http=trace,axum::rejection=trace".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .with(tracing_opentelemetry::layer().with_tracer(tracer))
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

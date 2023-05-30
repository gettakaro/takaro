use axum::Json;
use hyper::HeaderMap;
use opentelemetry::{
    global,
    trace::{Span, Tracer},
    KeyValue,
};
use opentelemetry_http::HeaderExtractor;
use serde_derive::{Deserialize, Serialize};
use std::{env, os::unix::process::ExitStatusExt};
use tokio::process::Command;
use tracing::instrument;

use crate::DEFAULT_TRACING_ENDPOINT;

#[derive(Debug, Serialize)]
pub struct ExecResponse {
    exit_code: Option<i32>,
    exit_signal: Option<i32>,
    stdout: String,
    stderr: String,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct NodeEnv {
    data: serde_json::value::Value,
}

impl NodeEnv {
    pub fn load(&self) {
        env::set_var(
            "DATA",
            serde_json::to_string(&self.data).unwrap_or("".to_owned()),
        );
        env::set_var("TRACING_ENDPOINT", DEFAULT_TRACING_ENDPOINT.to_string());
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecRequest {
    cmd: Vec<String>,
    env: NodeEnv,
}

pub async fn health() -> &'static str {
    tracing::info!("inside health request");

    "OK"
}

#[instrument]
pub async fn exec_cmd(
    headers: HeaderMap,
    Json(mut payload): Json<ExecRequest>,
) -> Json<ExecResponse> {
    let parent_cx = global::get_text_map_propagator(|propagator| {
        propagator.extract(&HeaderExtractor(&headers))
    });

    let tracer = global::tracer("vm-agent");

    let mut span = tracer.start_with_context("exec_cmd", &parent_cx);

    span.add_event("loading environment variables", vec![]);
    payload.env.load();

    let full_cmd = payload.cmd.join(" ");

    let mut command = Command::new(payload.cmd.remove(0));

    for arg in payload.cmd.into_iter() {
        command.arg(arg);
    }

    span.add_event("executing command", vec![KeyValue::new("cmd", full_cmd)]);

    let output = command.output().await.expect("failed to execute command");
    let status = output.status;

    span.add_event(
        "done executing",
        vec![KeyValue::new(
            "exit_code",
            status.code().unwrap_or_else(|| 1) as i64,
        )],
    );

    // manually end span before returning so we can export the trace
    span.end();

    Json(ExecResponse {
        exit_code: status.code(),
        exit_signal: status.signal(),
        stderr: String::from_utf8(output.stderr).unwrap(),
        stdout: String::from_utf8(output.stdout).unwrap(),
    })
}

#[cfg(test)]
#[allow(unused_must_use)]
mod tests {
    use super::*;
    use std::env;

    #[tokio::test]
    async fn test_exec_cmd_hello_world() {
        let request = ExecRequest {
            cmd: vec![
                "node".to_owned(),
                "-e".to_owned(),
                "console.log(\"Hello, world!\");".to_owned(),
            ],
            env: NodeEnv::default(),
        };

        let response = exec_cmd(HeaderMap::new(), Json(request)).await;

        assert_eq!(response.exit_code, Some(0));
        assert_eq!(response.stdout, "Hello, world!\n".to_owned());
    }

    #[tokio::test]
    async fn test_exec_cmd_loads_env() {
        let mock_env = NodeEnv {
            data: serde_json::json!(
                "{\"player\": {}, url: \"http://localhost/\", token: \"very_secure_token\"}"
            ),
        };

        let request = ExecRequest {
            cmd: vec![
                "node".to_owned(),
                "-e".to_owned(),
                "console.log(\"Hello, world!\");".to_owned(),
            ],
            env: mock_env.clone(),
        };

        exec_cmd(HeaderMap::new(), Json(request)).await;

        assert_eq!(
            env::var("DATA").unwrap_or("".to_owned()),
            serde_json::to_string(&mock_env.data).unwrap_or("".to_owned())
        );
    }
}

use std::os::unix::process::ExitStatusExt;

use axum::Json;
use hyper::StatusCode;
use serde_derive::Serialize;
use tokio::process::Command;
use tracing::debug;

#[derive(Debug, Serialize)]
struct ExecResponse {
    exit_code: Option<i32>,
    exit_signal: Option<i32>,
    stdout: Vec<u8>,
    stderr: Vec<u8>,
}

pub async fn exec_cmd(cmd: &mut Vec<String>) -> (StatusCode, Json<ExecResponse>) {
    let full_cmd = cmd.join(" ");

    debug!("exec_cmd: {}", full_cmd);

    let mut command = Command::new(cmd.swap_remove(0));
    for arg in cmd.into_iter() {
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

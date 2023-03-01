use std::os::unix::process::ExitStatusExt;

use axum::{debug_handler, Json};
use serde_derive::{Deserialize, Serialize};
use tokio::process::Command;

#[derive(Debug, Serialize)]
pub struct ExecResponse {
    exit_code: Option<i32>,
    exit_signal: Option<i32>,
    stdout: Vec<u8>,
    stderr: Vec<u8>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecRequest {
    cmd: Vec<String>,
}

#[debug_handler]
pub async fn exec_cmd(Json(mut payload): Json<ExecRequest>) -> Json<ExecResponse> {
    let full_cmd = payload.cmd.join(" ");

    tracing::debug!("exec_cmd: {}", full_cmd);

    let mut command = Command::new(payload.cmd.swap_remove(0));
    for arg in payload.cmd.into_iter() {
        command.arg(arg);
    }

    let output = command.output().await.unwrap();
    let status = output.status;

    tracing::debug!(
        "command '{}' exited with code: {}",
        full_cmd,
        status
            .code()
            .map(|i| i.to_string())
            .unwrap_or_else(|| "unknown".to_string())
    );

    Json(ExecResponse {
        exit_code: status.code(),
        exit_signal: status.signal(),
        stderr: output.stderr,
        stdout: output.stdout,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_exec_cmd_hello_world() {
        let request = ExecRequest {
            cmd: vec![
                "node".to_owned(),
                "console.log(\"Hello, world!\");".to_owned(),
                "-e".to_owned(),
            ],
        };

        let response = exec_cmd(Json(request)).await;

        assert_eq!(response.exit_code, Some(0));
        assert_eq!(response.stdout, b"Hello, world!\n");
    }
}

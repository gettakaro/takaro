use std::os::unix::process::ExitStatusExt;

use axum::{debug_handler, Json};
use serde_derive::{Deserialize, Serialize};
use tokio::process::Command;

#[derive(Debug, Serialize)]
pub struct ExecResponse {
    exit_code: Option<i32>,
    exit_signal: Option<i32>,
    stdout: String,
    stderr: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecRequest {
    cmd: Vec<String>,
}

#[debug_handler]
pub async fn exec_cmd(Json(mut payload): Json<ExecRequest>) -> Json<ExecResponse> {
    let full_cmd = payload.cmd.join(" ");

    dbg!(&payload.cmd);

    let mut command = Command::new(payload.cmd.remove(0));

    dbg!(&payload.cmd);

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
        stderr: String::from_utf8(output.stderr).unwrap(),
        stdout: String::from_utf8(output.stdout).unwrap(),
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
                "-e".to_owned(),
                "console.log(\"Hello, world!\");".to_owned(),
            ],
        };

        let response = exec_cmd(Json(request)).await;

        assert_eq!(response.exit_code, Some(0));
        assert_eq!(response.stdout, "Hello, world!\n".to_owned());
    }
}

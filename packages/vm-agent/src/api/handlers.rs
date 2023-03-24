use axum::{debug_handler, Json};
use serde_derive::{Deserialize, Serialize};
use std::env;
use std::os::unix::process::ExitStatusExt;
use tokio::process::Command;

#[derive(Debug, Serialize)]
pub struct ExecResponse {
    exit_code: Option<i32>,
    exit_signal: Option<i32>,
    stdout: String,
    stderr: String,
}

#[derive(Debug, Serialize, Deserialize, Default, Clone)]
pub struct NodeEnv {
    api_url: String,
    api_token: String,
    data: serde_json::value::Value,
}

impl NodeEnv {
    pub fn load(&self) {
        env::set_var("API_URL", &self.api_url);
        env::set_var("API_TOKEN", &self.api_token);
        env::set_var(
            "DATA",
            serde_json::to_string(&self.data).unwrap_or("".to_owned()),
        );
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecRequest {
    cmd: Vec<String>,
    env: NodeEnv,
}

#[debug_handler]
pub async fn exec_cmd(Json(mut payload): Json<ExecRequest>) -> Json<ExecResponse> {
    payload.env.load();

    let full_cmd = payload.cmd.join(" ");

    let mut command = Command::new(payload.cmd.remove(0));

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

        let response = exec_cmd(Json(request)).await;

        assert_eq!(response.exit_code, Some(0));
        assert_eq!(response.stdout, "Hello, world!\n".to_owned());
    }

    #[tokio::test]
    async fn test_exec_cmd_loads_env() {
        let mock_env = NodeEnv {
            api_url: "http://localhost/".to_owned(),
            api_token: "very_secure_token".to_owned(),
            data: serde_json::json!("{\"player\": {}}"),
        };

        let request = ExecRequest {
            cmd: vec![
                "node".to_owned(),
                "-e".to_owned(),
                "console.log(\"Hello, world!\");".to_owned(),
            ],
            env: mock_env.clone(),
        };

        exec_cmd(Json(request)).await;

        assert_eq!(
            env::var("API_URL").unwrap_or("".to_owned()),
            mock_env.api_url
        );
        assert_eq!(
            env::var("API_TOKEN").unwrap_or("".to_owned()),
            mock_env.api_token
        );
        assert_eq!(
            env::var("DATA").unwrap_or("".to_owned()),
            serde_json::to_string(&mock_env.data).unwrap_or("".to_owned())
        );
    }
}

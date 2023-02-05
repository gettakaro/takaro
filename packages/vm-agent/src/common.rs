use std::error::Error;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Header {
    pub request_type: u8,
    pub payload_length: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Payload {
    pub code: String,
    pub config: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Request {
    pub header: Header,
    pub payload: Payload,
}

impl Request {
    pub fn new(
        request_type: u8,
        code: String,
        config: Option<String>,
    ) -> Result<Self, Box<dyn Error>> {
        let payload = Payload { code, config };
        let payload_length: u64 = bincode::serialize(&payload)?.len() as u64;

        Ok(Self {
            header: Header {
                request_type,
                payload_length,
            },
            payload,
        })
    }
}

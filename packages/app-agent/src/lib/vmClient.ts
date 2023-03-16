import net from 'node:net';
import http from 'node:http';
import fetch from 'node-fetch';
import { logger, sleep } from '@takaro/util';

class HttpAgent extends http.Agent {
  log = logger('VmClient:HttpAgent');

  constructor(private socketPath: string, private port: number) {
    super();
  }

  createConnection(_: unknown, callback: CallableFunction) {
    this.getSocket()
      .then((socket) => {
        callback(null, socket);
      })
      .catch((err) => {
        callback(err);
      });
  }

  private getSocket() {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection({
        path: this.socketPath,
      });

      socket.on('data', (data) => {
        this.log.debug(`received data: ${data}`);
        resolve(socket);
      });
      socket.on('ready', () => {
        this.log.silly(`ready: connecting to ${this.port}`);
        socket.write(`CONNECT ${this.port}\n`);
      });
      socket.on('close', () => {
        this.log.silly('socket closed');
        reject(new Error());
      });
      socket.on('error', (err) => {
        this.log.error(err);
        reject(err);
      });
    });
  }
}

export class VmClient {
  customAgent: http.Agent;
  log: ReturnType<typeof logger>;

  constructor(socketPath: string, port: number) {
    this.log = logger('VmClient', {
      socketPath,
      port,
    });
    this.customAgent = new HttpAgent(socketPath, port);
  }

  async waitUntilHealthy() {
    let response;
    while (!response) {
      try {
        response = await this.getHealth();
        await sleep(1);
      } catch {}
    }
  }

  public async getHealth() {
    this.log.silly('GET /health request');

    const res = await fetch('http://localhost/health', {
      agent: this.customAgent,
    });

    if (res.status !== 200) {
      const errorMessage = 'Received invalid status code';

      this.log.error(errorMessage, res);

      throw Error(errorMessage);
    }

    return await res.text();
  }

  public async exec(fn: string, data: Record<string, unknown>, token: string) {
    this.log.info('POST /exec request', { fn });

    const env = [
      `DATA='${JSON.stringify(data)}'`,
      `API_TOKEN='${token}'`,
      'API_URL="http://192.168.0.103"',
    ];

    const cmd = [...env, 'node', '--input-type=module', '-e', fn];

    this.log.debug('cmd', cmd);

    const res = await fetch('http://localhost/exec', {
      agent: this.customAgent,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd,
        // cmd: ['node', '-v'],
        // cmd: ['tree'],
      }),
    });

    if (res.status !== 200) {
      const errorMessage = 'Received invalid status code';

      this.log.error(errorMessage, res);

      throw Error(errorMessage);
    }

    return await res.text();
  }
}

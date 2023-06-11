import net from 'node:net';
import http from 'node:http';
import fetch from 'node-fetch';
import { logger, sleep } from '@takaro/util';
import { networkInterfaces } from 'os';
import { config } from '../config.js';

interface ExecOutput {
  exit_code: number;
  exit_signal: string | null;
  stdout: string | null;
  stderr: string | null;
}

class HttpAgent extends http.Agent {
  private log = logger('VmClient:HttpAgent');

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
        this.log.silly(`received data: ${data}`);
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
        this.log.silly(err);
        reject(err);
      });
    });
  }
}

export class VmClient {
  private customAgent: http.Agent;
  private takaroURL: string;
  private log;

  constructor(socketPath: string, port: number) {
    this.log = logger('VmClient', {
      socketPath,
      port,
    });
    this.customAgent = new HttpAgent(socketPath, port);

    // TODO: find a better solution than a hardcoded IP
    this.takaroURL =
      config.get('mode') === 'development'
        ? 'http://172.16.238.253:3000'
        : config.get('takaro.url');
  }

  private getHostAddress() {
    const interfaceName = 'eth0';
    const defaultInterface = networkInterfaces()[interfaceName]?.[0];

    if (!defaultInterface) {
      throw Error(`no ${interfaceName} interface found on host container`);
    }

    if (!defaultInterface.address) {
      throw Error(`no address found on ${interfaceName}`);
    }

    return defaultInterface.address;
  }

  async waitUntilHealthy(maxRetry = 2500) {
    let response;
    let tries = 0;

    while (!response && tries !== maxRetry) {
      try {
        await sleep(1);
        response = await this.getHealth();
      } catch {
      } finally {
        tries += 1;
      }
    }

    if (tries === maxRetry) {
      this.log.warn(`reached max retries (${tries})`);
    }
  }

  public async getHealth() {
    this.log.silly('GET /health request');

    const res = await fetch('http://localhost/health', {
      agent: this.customAgent,
    });

    return await res.text();
  }

  public async exec(fn: string, data: Record<string, unknown>, token: string) {
    const env = {
      data: {
        ...data,
        token: token,
        url: this.takaroURL,
      },
    };

    this.log.info('POST /exec request', {
      fn,
      env: JSON.stringify({
        ...env,
        // don't log the actual token
        token: token ? 'valid' : 'invalid',
      }),
    });

    const cmd = ['node', '--input-type=module', '-e', fn];

    const response = await fetch('http://localhost/exec', {
      agent: this.customAgent,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd,
        env,
      }),
    });

    const output = (await response.json()) as unknown as ExecOutput;

    if (output.exit_code === 1) {
      this.log.error('Function returned an error', {
        ...(this.log.isDebugEnabled()
          ? { stderr: output.stderr, stdout: output.stdout }
          : {}),
      });
    }
  }
}

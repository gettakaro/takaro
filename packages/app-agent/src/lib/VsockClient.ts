import net from 'node:net';
import http from 'node:http';
import fetch from 'node-fetch';
import { logger } from '@takaro/util';

const log = logger('vsockclient');

class HttpAgent extends http.Agent {
  constructor(private socketPath: string) {
    super();
  }

  createConnection(options: unknown, callback: CallableFunction) {
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
      socket.on('connect', () => {});

      socket.on('data', (data) => {
        log.debug(`on data: ${data}`);
        resolve(socket);
      });

      socket.on('ready', () => {
        log.debug('ready: connecting to port 8000');
        socket.write('CONNECT 8000\n');
      });

      socket.on('close', () => {
        log.debug('socket closed');
      });

      socket.on('error', (err) => {
        log.error(err);
        reject(err);
      });
    });
  }
}

export class VsockClient {
  customAgent: http.Agent;

  constructor(agentSocket: string) {
    this.customAgent = new HttpAgent(agentSocket);
  }

  public async getHealth() {
    log.debug('sending health request');
    const res = await fetch('http://localhost/health', {
      agent: this.customAgent,
    });
    log.debug(res);
    return await res.text();
  }

  public async exec(cmd: string) {
    const res = await fetch('http://localhost/exec', {
      agent: this.customAgent,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cmd: ['node', '-e', cmd],
      }),
    });

    log.debug('received response');

    return await res.text();
  }
}

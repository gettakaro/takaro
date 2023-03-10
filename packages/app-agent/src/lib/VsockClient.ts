import net from 'node:net';
import http from 'node:http';
import fetch from 'node-fetch';
import { config } from '../config.js';

class HttpAgent extends http.Agent {
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
        path: config.get('firecracker.agentSocket'),
      });
      socket.on('connect', () => {
        socket.write('CONNECT 8000\n');
      });

      socket.on('data', () => {
        resolve(socket);
      });

      socket.on('error', (err) => {
        console.log('ERROR: ', err);
        reject(err);
      });
    });
  }
}

export class VsockClient {
  private customAgent = new HttpAgent();

  public async getHealth() {
    const res = await fetch('http://localhost/health', {
      agent: this.customAgent,
    });
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
    return await res.text();
  }
}

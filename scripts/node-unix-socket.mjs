#!/bin/node

import net from 'node:net';
import http from 'node:http';
import fetch from 'node-fetch';

const customAgent = new http.Agent({});

customAgent.createConnection = (_, callback) => {
  getSocket()
    .then((socket) => {
      callback(null, socket);
    })
    .catch((err) => {
      callback(err);
    });
};

fetch('http://localhost/health', { agent: customAgent })
  .then((res) => res.text())
  .then((data) => console.log(data));

fetch('http://localhost/exec', {
  agent: customAgent,
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cmd: ['node', '-e', 'console.log("Hello, world!");'],
  }),
})
  .then((res) => res.text())
  .then((data) => console.log(data));

function getSocket() {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ path: '/tmp/takaro/agent.socket' });
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

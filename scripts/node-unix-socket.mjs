import net from 'node:net';
import http from 'node:http';
import fetch from 'node-fetch';

const customAgent = new http.Agent({});

customAgent.createConnection = (options, callback) => {
  getSocket()
    .then((socket) => {
      callback(null, socket);
    })
    .catch((err) => {
      callback(err);
    });
};

fetch('http://localhost/hello', { agent: customAgent })
  .then((res) => res.text())
  .then((data) => console.log(data));

function getSocket() {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ path: '/tmp/takaro/agent.socket' });
    socket.on('connect', () => {
      socket.write('CONNECT 8000\n');
    });

    socket.on('data', (data) => {
      console.log('DATA: ', data.toString());
      resolve(socket);
    });

    socket.on('error', (err) => {
      console.log('ERROR: ', err);
      reject(err);
    });
  });
}

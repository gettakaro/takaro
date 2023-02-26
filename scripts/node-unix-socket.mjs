import net from 'node:net';

const client = net.createConnection({ path: '/tmp/takaro/firecracker.socket' });
client.on('connect', () => {
  client.write('CONNECT 8000\n');

  //
  client.write('GET / HTTP/1.1\r\n');
});

client.on('data', (data) => {
  console.log('DATA: ', data.toString());
});

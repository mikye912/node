const net = require('net');
const common = require('$Common/common');

module.exports = {
    getConnection(connName, connInfo){
        let client = net.connect(connInfo);
        client.on('connect', () => {
            common.logger('info', `${connName} Connected`);
            common.logger('info', `   local = ${client.localAddress} ${client.localPort}`);
            common.logger('info', `   remote = ${client.remoteAddress} ${client.remotePort}`);
        })
        client.setTimeout(5000);
        client.setEncoding('utf8');
        client.on('data', (data) => {
            common.logger('info', `${connName} From Server: ${data.toString()}`);
            client.end();
        });
        client.on('end', () => {
            common.logger('info', `${connName} Client disconnected`);
        });
        client.on('error', (err) => {
            common.logger('error', `Socket Error: ${JSON.stringify(err)}`);
        });
        client.on('timeout', () => {
            common.logger('info', `Socket Timed Out`);
        });
        client.on('close', () => {
            common.logger('info', `Socket Closed`);
        });
        return client;
      },
      writeData(socket, data){
        common.logger('info', `Send To Server: ${data}`);
        let success = !socket.write(data);
        if (!success){
          ((socket, data) => {
            socket.once('drain', () => {
              writeData(socket, data);
            });
          })(socket, data);
        }
      }
};
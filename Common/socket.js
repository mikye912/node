const net = require('net');

module.exports = {
    getConnection(connName, connInfo){
        let client = net.connect(connInfo);
        client.on('connect', () => {
            console.log(connName + ' Connected: ');
            console.log('   local = %s:%s', client.localAddress, client.localPort);
            console.log('   remote = %s:%s', client.remoteAddress, client.remotePort);
        })
        client.setTimeout(5000);
        client.setEncoding('utf8');
        client.on('data', (data) => {
            console.log(connName + " From Server: " + data.toString());
            client.end();
        });
        client.on('end', () => {
            console.log(connName + ' Client disconnected');
        });
        client.on('error', (err) => {
            console.log('Socket Error: ', JSON.stringify(err));
        });
        client.on('timeout', () => {
            console.log('Socket Timed Out');
        });
        client.on('close', () => {
            console.log('Socket Closed');
        });
        return client;
      },
      writeData(socket, data){
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
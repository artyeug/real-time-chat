// Express server:

import http from 'http';
import express from 'express';
import Router from 'express';
import path from 'path';

let router = Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

let app = express();

app.use('/', router);
app.use(express.static(__dirname + '/'));

let server = http.createServer(app);

server.listen(process.env.PORT);


// WebSockets:

import { server as WebSocketServer } from 'websocket';

const APPEND_TO_MAKE_UNIQUE = 1;
let connectionArray = [];
let nextID = Date.now();

function getRandomUserImageSrc() {
  let imageNumber = Math.floor(Math.random() * 20) + 1;

  return `images/avatars/${imageNumber}.jpg`;
}

let wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wsServer.on('request', request => {
  let status = '';

  if (originIsAllowed(request.origin)) {
    request.accept('', request.origin);
    status = 'accepted';
  }
  else {
    request.reject();
    status = 'rejected';
  }

  console.log(`${(new Date())} Connection from origin ${request.origin} ${status}.`);
});

wsServer.on('connect', connection => {
  connectionArray.push(connection);

  connection.clientID = nextID++;

  let message = {
    type: "ID",
    id: connection.clientID
  };

  connection.sendUTF(JSON.stringify(message));

  connection.on('message', message => {
    if (message.type !== 'utf8')
      return;

    console.log(`${(new Date())} Received message: ${message.utf8Data}`);

    let parsedMessage = JSON.parse(message.utf8Data);
    let connect = getConnectionForID(parsedMessage.id);

    if (connect === null) {
      console.warn(`${(new Date())} Couldn't find connection for ID ${parsedMessage.id}.`);
      return;
    }

    switch (parsedMessage.type) {
      case "USERDATA":
        let loginChanged = false;
        let originalLogin = parsedMessage.login;
        let appender = APPEND_TO_MAKE_UNIQUE;

        while (!isClientLoginUnique(parsedMessage.login)) {
          parsedMessage.login = originalLogin + '_' + appender++;
          loginChanged = true;
        }

        if (loginChanged) {
          // There is no need to pass a sign or smth other,
          // because only login is used just for a notification
          // about changed login (due to a non-unique original login)
          let changeMessage = {
            id: parsedMessage.id,
            type: "REJECT_USERDATA",
            login: parsedMessage.login
          };

          connect.sendUTF(JSON.stringify(changeMessage));
        }

        connect.clientLogin = parsedMessage.login;
        connect.clientSign = parsedMessage.sign;
        connect.clientImage = getRandomUserImageSrc();
        sendUserListToAll();
        break;
      case "MESSAGE":
        parsedMessage.login = connect.clientLogin;
        parsedMessage.image = connect.clientImage;
        break;
    }

    let messageString = JSON.stringify(parsedMessage);
    sendToAllConnections(messageString);
  });

  connection.on('close', (reasonCode, descr) => {
    connectionArray = connectionArray.filter(connection => connection.connected);

    sendUserListToAll();

    console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
  });
});

function originIsAllowed(origin) {
  // This is where should ensure the connection should be accepted.
  // Return false if it should not be.
  return true;
}

function isClientLoginUnique(name) {
  return !connectionArray.some(connection => connection.clientLogin === name);
}

function getConnectionForID(id) {
  let result = connectionArray.find(c => c.clientID === id);

  return result === undefined ? null : result;
}

function makeUserListMessage() {
  let userListMessage = {
    type: 'USERLIST',
    users: []
  };

  connectionArray.forEach(connection => {
    userListMessage.users.push({
      login: connection.clientLogin,
      sign: connection.clientSign,
      image: connection.clientImage
    });
  });

  return userListMessage;
}

function sendUserListToAll() {
  let userListMessage = makeUserListMessage();
  let userListMessageString = JSON.stringify(userListMessage);

  sendToAllConnections(userListMessageString);
}

function sendToAllConnections(stringifiedData) {
  connectionArray.forEach(connection => {
    connection.sendUTF(stringifiedData);
  });
}

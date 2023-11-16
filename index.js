'use strict';

const bodyParser = require('body-parser');
const browserify = require('browserify-middleware');
const express = require('express');
const { readdirSync, statSync, readFileSync } = require('fs');
const { join } = require('path');

const { mount } = require('./lib/server/rest/connectionsapi');
const WebRtcConnectionManager = require('./lib/server/connections/webrtcconnectionmanager');

const https = require('https');
const http = require('http');

const app = express();
const dotenv = require('dotenv');
dotenv.config();

const port = process.env.PORT;

app.use(bodyParser.json());

const examplesDirectory = join(__dirname, 'examples');

const examples = readdirSync(examplesDirectory).filter(path =>
  statSync(join(examplesDirectory, path)).isDirectory());

function setupExample(example) {
  const path = join(examplesDirectory, example);
  const clientPath = join(path, 'client.js');
  const serverPath = join(path, 'server.js');

  app.use(`/${example}/index.js`, browserify(clientPath));
  app.get(`/${example}/index.html`, (req, res) => {
    res.sendFile(join(__dirname, 'html', 'index.html'));
  });

  const options = require(serverPath);
  const connectionManager = WebRtcConnectionManager.create(options);
  mount(app, connectionManager, `/${example}`);

  return connectionManager;
}

app.get('/', (req, res) => {
  res.redirect(`${examples[0]}/index.html`);
  console.log("Incoming request for: " + req.url)
});

const connectionManagers = examples.reduce((connectionManagers, example) => {
  const connectionManager = setupExample(example);
  return connectionManagers.set(example, connectionManager);
}, new Map());

const privkey = '/etc/letsencrypt/live/030fd55b.nip.io/privkey.pem'
const certif = '/etc/letsencrypt/live/030fd55b.nip.io/fullchain.pem'

const options = {
  key: readFileSync(process.env.PRIVATE_KEY_PATH),
  cert: readFileSync(process.env.CERTIFICATE_PATH),
};

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`https://localhost:${port}\n`);

  server.once('close', () => {
    connectionManagers.forEach(connectionManager => connectionManager.close());
  });
});

//redirect server
const redirServer = http.createServer((req, res) => {
  console.log('Redirecting...');
  //res.statusCode = 301; // status for permanent redir
  res.writeHead(301, {
    'Location': `https://${req.headers.host}${req.url}`,
  });
  res.end();
});

redirServer.listen(80, () => {
  console.log(`Server running at http://localhost:80/`);
});


/*
const server = app.listen(port, () => {
  const address = server.address();
  console.log(`http://localhost:${address.port}\n`);

  server.once('close', () => {
    connectionManagers.forEach(connectionManager => connectionManager.close());
  });
});
*/
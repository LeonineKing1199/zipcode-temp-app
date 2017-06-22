const express = require('express');
const http    = require('http');

const addRoutes = require('./routes');

const makeServer = () => new Promise((resolve, reject) => {

  const port = 3000;
  const app  = express();

  app.set('port', port);

  addRoutes(app);

  http
    .createServer(app)
    .listen(port, (err) => {
        if (err) { return reject(err); }
        resolve(app);
    });
});

makeServer()
  .then((app) => {
    console.log(`http server listening at ${app.get('port')}`);
  })
  .catch((err) => {
    console.error(err.message);
    console.error(err.stack);
    process.exit(1);
  });

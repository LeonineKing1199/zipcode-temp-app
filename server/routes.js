const express    = require('express');
const bodyParser = require('body-parser'); 

const apiRoutes = require('./api/router');

const addRoutes = (app) => {
  app.use(bodyParser.json());

  app.use('/api', apiRoutes);
  app.use(express.static(`${__dirname}/../static_content`));

  app.use((err, req, res, next) => {
    return (
      res
        .status(500)
        .json({ error: err.message || err }));
  });
};

module.exports = addRoutes;
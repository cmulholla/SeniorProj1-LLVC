'use strict';

function mount(app, connectionManager, prefix = '') {
  app.get(`${prefix}/connections`, (req, res) => {
    res.send(connectionManager.getConnections());
    console.log(app.id + " connection sent (1)");
  });

  app.post(`${prefix}/connections`, async (req, res) => {
    try {
      const connection = await connectionManager.createConnection();
      res.send(connection);
      console.log(app.id + " connection post sent (2)");
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  app.delete(`${prefix}/connections/:id`, (req, res) => {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      res.sendStatus(404);
      console.log("404 error (3)");
      return;
    }
    connection.close();
    res.send(connection);
  });

  app.get(`${prefix}/connections/:id`, (req, res) => {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      res.sendStatus(404);
      return;
    }
    console.log("Sending connection (4)");
    res.send(connection);
  });

  app.get(`${prefix}/connections/:id/local-description`, (req, res) => {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      res.sendStatus(404);
      return;
    }
    console.log("send json description? (5)");
    res.send(connection.toJSON().localDescription);
  });

  app.get(`${prefix}/connections/:id/remote-description`, (req, res) => {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      res.sendStatus(404);
      return;
    }
    console.log("send json description? (6)");
    res.send(connection.toJSON().remoteDescription);
  });

  app.post(`${prefix}/connections/:id/remote-description`, async (req, res) => {
    const { id } = req.params;
    const connection = connectionManager.getConnection(id);
    if (!connection) {
      res.sendStatus(404);
      return;
    }
    try {
      await connection.applyAnswer(req.body);
      res.send(connection.toJSON().remoteDescription);
    } catch (error) {
      res.sendStatus(400);
    }
  });
}

function connectionsApi(app, connectionManager) {
  mount(app, connectionManager, '/v1');
}

module.exports = connectionsApi;
module.exports.mount = mount;

const jsonServer = require('json-server');

const server = jsonServer.create();
const path = require('path');

const dbPath = path.resolve(__dirname, 'src/database/db.json');
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(router);

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

server.listen(port, () => {
  console.log(`JSON server is running port ${port}`);
});

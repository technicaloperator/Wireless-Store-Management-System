import path from 'path';
process.env.SQLITE_PATH = path.resolve('backend/data/wsms.db');
import app from './app.js';

console.log('app type:', typeof app);
console.log('has _router:', !!app._router);
console.log('has router:', !!app.router);
console.log('router keys:', app._router ? Object.keys(app._router) : 'none');
if (app._router) {
  app._router.stack.forEach((layer, index) => {
    console.log(index, layer.name, layer.regexp && layer.regexp.toString(), layer.route && { path: layer.route.path, methods: layer.route.methods });
  });
}

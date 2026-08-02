import app from './app.js';

console.log('app type:', typeof app);
console.log('app keys:', Object.getOwnPropertyNames(app));
console.log('has _router:', !!app._router);
console.log('has use:', typeof app.use);
console.log('has route:', typeof app.route);
if (app._router) {
  console.log('routes:');
  app._router.stack.forEach((layer) => {
    if (layer.route) {
      console.log(layer.route.path, layer.route.methods);
    } else if (layer.name === 'router') {
      console.log('router layer', layer.regexp);
    }
  });
}

process.env.IP_CHECKER_DEBUG = 'true';

var express = require('express')
  , app     = express()
  , EventEmitter = require('events')

var emitter = new EventEmitter();

app.use(require('./index.js')({
  default: 'x',
  allow: ['127.0.0.1'],
  emitter: emitter
}));

var disable = true;
setInterval(function() {
  disable = !disable;
  console.log('disable switch to ' + disable);
  emitter.emit('disable', disable);
}, 5000);

app.listen(3000)
console.log('express listen on 3000.')

/*
curl -H 'x-forwarded-for: 127.0.0.2' -i  http://localhost:3000/
curl -H 'x-forwarded-for: 127.0.0.1' -i  http://localhost:3000/
*/

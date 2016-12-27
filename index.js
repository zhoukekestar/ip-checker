var config = {}
  , DEBUG = process.env.IP_CHECKER_DEBUG === 'true' ? true : false;

var errorHTML = `
<html>
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no">
  </head>
  <body>
    <p style="margin: 50px auto;text-align: center;">您的IP地址未得到管理员授权</p>
  </body>
</html>`;

var checker = {

  'x-forwarded-for': function() {

    var ips;

    if (config.mode === 'express') {

      var req = arguments[0], res = arguments[1];
      ips = req.headers['x-forwarded-for'];
      DEBUG && console.log('express headers: ' + JSON.stringify(arguments[0].headers));

    } else {

      ips = arguments[0].request.headers['x-forwarded-for'];
      DEBUG && console.log('koa headers: ' + JSON.stringify(arguments[0].request.headers));
    }

    var i = 0;
    for (i = 0; i < config.allow.length; i++) {
      var reg = new RegExp(config.allow[i].replace(/\./g, '\\.'));
      if (reg.test(ips)) {
        return 'allow';
      }
    }

    for (i = 0; i < config.block.length; i++) {
      var reg = new RegExp(config.block[i].replace(/\./g, '\\.'));
      if (reg.test(ips)) {
        config.mode === 'express' ? arguments[1].set('X-IP-CHECKER', ips) : arguments[0].set('X-IP-CHECKER', ips);
        return 'block';
      }
    }

    if (config.default === 'x') {
      config.mode === 'express' ? arguments[1].set('X-IP-CHECKER', ips) : arguments[0].set('X-IP-CHECKER', ips);
    }
    return '';
  }
}

module.exports = function(c) {

  config = c;

  config.default  = config.default || '*';
  config.checker  = config.checker || 'x-forwarded-for';
  config.disable  = typeof config.disable === undefined ? false : config.disable;
  config.allow    = config.allow || [];
  config.block    = config.block || [];
  config.mode     = config.mode || 'express';

  DEBUG && console.log('ip-checker-config:' + JSON.stringify(config));

  if (config.mode === 'express') {

    return function(req, res, next) {

      if (config.disable === true) {
        return next();
      }

      var action = '';

      if (typeof config.checker === 'string') {
        action = checker[config.checker](req, res);
      } else {
        action = config.checker(req, res);
      }

      if (action === 'allow') {

        next()

      } else if (action === 'block') {

        res.set('Content-Type', 'text/html; charset=utf-8');
        res.end(errorHTML)

      } else {

        if (config.default === 'x') {

          res.set('Content-Type', 'text/html; charset=utf-8');
          res.end(errorHTML);

        } else {

          next();

        }
      }
    }

  } else {

    return function* (next) {

      if (config.disable === true) {
        yield next;
      }

      var action = '';

      if (typeof config.checker === 'string') {
        action = checker[config.checker](this);
      } else {
        action = config.checker(this);
      }

      if (action === 'allow') {

        yield next

      } else if (action === 'block') {

        this.set('Content-Type', 'text/html; charset=utf-8');
        this.body = errorHTML;

      } else {

        if (config.default === 'x') {

          this.set('Content-Type', 'text/html; charset=utf-8');
          this.body = errorHTML;

        } else {

          yield next

        }
      }
    }
  }

}

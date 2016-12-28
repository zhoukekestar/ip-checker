# ip-checker
Check client ip for koa & express.

# Quick Start
* `npm install ip-checker` to install `ip-checker`;
* express

```js

var express = require('express')
  , app     = express();
app.use(require('ip-checker')({
  default: '*',
  allow: ['127.0.0.1']
}));
app.listen(3000)

```
* koa

```js
var app = require('koa')()
app.use(require('ip-checker')({
  default: '*',
  allow: ['127.0.0.1'],
  mode: 'koa'
}))
app.listen(3000)
```
* test

```bash
curl -H 'x-forwarded-for: 127.0.0.2' -i  http://localhost:3000/
curl -H 'x-forwarded-for: 127.0.0.1' -i  http://localhost:3000/
```

# Config
| Name | Description | Default value |
| --- | --- | --- |
| default | Action for unknown ip. `*` for allow all unknown ips, `x` for block all unknown ips. | `*` |
| checker | A string or function to check request ip. Return `allow` string to allow request, `block` string to block request, empty string to tell ip-checker it's an unknown request | `x-forwarded-for` |
| disable | Disable ip-checker or not. | `false` |
| allow | A string array that means request is allowed if client ip is in this set. | `[]` |
| block | A string array that means request is blocked if client ip is in this set. | `[]` |
| mode | `express` or `koa` mode. | `express` |
| emitter | You can emit a `disable` event with a bool value to switch disable value. | ` ` |
| process.env.IP_CHECKER_DEBUG | Set this value to `true` to show debug log | ` ` |


// 'use strict';
import handler from './utils/handler-lib'
const validate = require('./schema')

exports.node = handler(async (event) => {
  throw {
    code: 'HELLO_ERROR',
    message: "hello error"
  }
}, validate);
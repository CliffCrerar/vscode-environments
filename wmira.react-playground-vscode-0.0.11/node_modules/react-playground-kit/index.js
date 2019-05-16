'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Playground = exports.createEntry = undefined;

var _Playground = require('./Playground');

var _Playground2 = _interopRequireDefault(_Playground);

var _playgroundSetup = require('./playgroundSetup');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.createEntry = _playgroundSetup.createEntry;
exports.Playground = _Playground2.default;
exports.default = _Playground2.default;
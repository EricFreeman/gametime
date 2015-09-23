/* */ 
"format cjs";
"use strict";
exports.__esModule = true;
exports["default"] = build;
function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
          newObj[key] = obj[key];
      }
    }
    newObj["default"] = obj;
    return newObj;
  }
}
var _types = require("../../types/index");
var t = _interopRequireWildcard(_types);
function build(node, buildBody) {
  var self = node.blocks.shift();
  if (!self)
    return;
  var child = build(node, buildBody);
  if (!child) {
    child = buildBody();
    if (node.filter) {
      child = t.ifStatement(node.filter, t.blockStatement([child]));
    }
  }
  return t.forOfStatement(t.variableDeclaration("let", [t.variableDeclarator(self.left)]), self.right, t.blockStatement([child]));
}
module.exports = exports["default"];

/* */ 
"format cjs";
"use strict";
exports.__esModule = true;
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
var _types = require("../../../types/index");
var t = _interopRequireWildcard(_types);
var metadata = {group: "builtin-trailing"};
exports.metadata = metadata;
var visitor = {MemberExpression: {exit: function exit(node) {
      var prop = node.property;
      if (!node.computed && t.isIdentifier(prop) && !t.isValidIdentifier(prop.name)) {
        node.property = t.literal(prop.name);
        node.computed = true;
      }
    }}};
exports.visitor = visitor;

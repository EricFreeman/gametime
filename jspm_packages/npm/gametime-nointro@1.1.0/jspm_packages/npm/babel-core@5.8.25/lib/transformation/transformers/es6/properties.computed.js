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
function loose(node, body, objId) {
  var _arr = node.properties;
  for (var _i = 0; _i < _arr.length; _i++) {
    var prop = _arr[_i];
    body.push(t.expressionStatement(t.assignmentExpression("=", t.memberExpression(objId, prop.key, prop.computed || t.isLiteral(prop.key)), prop.value)));
  }
}
function spec(node, body, objId, initProps, file) {
  var _arr2 = node.properties;
  for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
    var prop = _arr2[_i2];
    if (t.isLiteral(t.toComputedKey(prop), {value: "__proto__"})) {
      initProps.push(prop);
      continue;
    }
    var key = prop.key;
    if (t.isIdentifier(key) && !prop.computed) {
      key = t.literal(key.name);
    }
    var bodyNode = t.callExpression(file.addHelper("define-property"), [objId, key, prop.value]);
    body.push(t.expressionStatement(bodyNode));
  }
  if (body.length === 1) {
    var first = body[0].expression;
    if (t.isCallExpression(first)) {
      first.arguments[0] = t.objectExpression(initProps);
      return first;
    }
  }
}
var visitor = {ObjectExpression: {exit: function exit(node, parent, scope, file) {
      var hasComputed = false;
      var _arr3 = node.properties;
      for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
        var prop = _arr3[_i3];
        hasComputed = t.isProperty(prop, {
          computed: true,
          kind: "init"
        });
        if (hasComputed)
          break;
      }
      if (!hasComputed)
        return;
      var initProps = [];
      var stopInits = false;
      node.properties = node.properties.filter(function(prop) {
        if (prop.computed) {
          stopInits = true;
        }
        if (prop.kind !== "init" || !stopInits) {
          initProps.push(prop);
          return false;
        } else {
          return true;
        }
      });
      var objId = scope.generateUidIdentifierBasedOnNode(parent);
      var body = [];
      var callback = spec;
      if (file.isLoose("es6.properties.computed"))
        callback = loose;
      var result = callback(node, body, objId, initProps, file);
      if (result)
        return result;
      body.unshift(t.variableDeclaration("var", [t.variableDeclarator(objId, t.objectExpression(initProps))]));
      body.push(t.expressionStatement(objId));
      return body;
    }}};
exports.visitor = visitor;
/* */ 
"format cjs";
"use strict";
exports.__esModule = true;
var _createClass = (function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps)
      defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();
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
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {"default": obj};
}
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var _transformer = require("../transformer");
var _transformer2 = _interopRequireDefault(_transformer);
var _plugin = require("../plugin");
var _plugin2 = _interopRequireDefault(_plugin);
var _types = require("../../types/index");
var types = _interopRequireWildcard(_types);
var _messages = require("../../messages");
var messages = _interopRequireWildcard(_messages);
var _tryResolve = require("try-resolve");
var _tryResolve2 = _interopRequireDefault(_tryResolve);
var _traversal = require("../../traversal/index");
var _traversal2 = _interopRequireDefault(_traversal);
var _helpersParse = require("../../helpers/parse");
var _helpersParse2 = _interopRequireDefault(_helpersParse);
var context = {
  messages: messages,
  Transformer: _transformer2["default"],
  Plugin: _plugin2["default"],
  types: types,
  parse: _helpersParse2["default"],
  traverse: _traversal2["default"]
};
var PluginManager = (function() {
  PluginManager.memoisePluginContainer = function memoisePluginContainer(fn) {
    for (var i = 0; i < PluginManager.memoisedPlugins.length; i++) {
      var plugin = PluginManager.memoisedPlugins[i];
      if (plugin.container === fn)
        return plugin.transformer;
    }
    var transformer = fn(context);
    PluginManager.memoisedPlugins.push({
      container: fn,
      transformer: transformer
    });
    return transformer;
  };
  _createClass(PluginManager, null, [{
    key: "memoisedPlugins",
    value: [],
    enumerable: true
  }, {
    key: "positions",
    value: ["before", "after"],
    enumerable: true
  }]);
  function PluginManager() {
    var _ref = arguments.length <= 0 || arguments[0] === undefined ? {
      transformers: {},
      before: [],
      after: []
    } : arguments[0];
    var file = _ref.file;
    var transformers = _ref.transformers;
    var before = _ref.before;
    var after = _ref.after;
    _classCallCheck(this, PluginManager);
    this.transformers = transformers;
    this.file = file;
    this.before = before;
    this.after = after;
  }
  PluginManager.prototype.subnormaliseString = function subnormaliseString(name, position) {
    var match = name.match(/^(.*?):(after|before)$/);
    if (match) {
      ;
      name = match[1];
      position = match[2];
    }
    var loc = _tryResolve2["default"].relative("babel-plugin-" + name) || _tryResolve2["default"].relative(name);
    if (loc) {
      var plugin = require(loc);
      return {
        position: position,
        plugin: plugin["default"] || plugin
      };
    } else {
      throw new ReferenceError(messages.get("pluginUnknown", name));
    }
  };
  PluginManager.prototype.validate = function validate(name, plugin) {
    var key = plugin.key;
    if (this.transformers[key]) {
      throw new ReferenceError(messages.get("pluginKeyCollision", key));
    }
    if (!plugin.buildPass || plugin.constructor.name !== "Plugin") {
      throw new TypeError(messages.get("pluginNotTransformer", name));
    }
    plugin.metadata.plugin = true;
  };
  PluginManager.prototype.add = function add(name) {
    var position;
    var plugin;
    if (name) {
      if (typeof name === "object" && name.transformer) {
        plugin = name.transformer;
        position = name.position;
      } else if (typeof name !== "string") {
        plugin = name;
      }
      if (typeof name === "string") {
        var _subnormaliseString = this.subnormaliseString(name, position);
        plugin = _subnormaliseString.plugin;
        position = _subnormaliseString.position;
      }
    } else {
      throw new TypeError(messages.get("pluginIllegalKind", typeof name, name));
    }
    position = position || "before";
    if (PluginManager.positions.indexOf(position) < 0) {
      throw new TypeError(messages.get("pluginIllegalPosition", position, name));
    }
    if (typeof plugin === "function") {
      plugin = PluginManager.memoisePluginContainer(plugin);
    }
    this.validate(name, plugin);
    var pass = this.transformers[plugin.key] = plugin.buildPass(this.file);
    if (pass.canTransform()) {
      var stack = position === "before" ? this.before : this.after;
      stack.push(pass);
    }
  };
  return PluginManager;
})();
exports["default"] = PluginManager;
module.exports = exports["default"];

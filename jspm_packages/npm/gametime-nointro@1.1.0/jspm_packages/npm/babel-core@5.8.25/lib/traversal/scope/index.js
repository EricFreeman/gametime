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
var _lodashCollectionIncludes = require("lodash/collection/includes");
var _lodashCollectionIncludes2 = _interopRequireDefault(_lodashCollectionIncludes);
var _repeating = require("repeating");
var _repeating2 = _interopRequireDefault(_repeating);
var _index = require("../index");
var _index2 = _interopRequireDefault(_index);
var _lodashObjectDefaults = require("lodash/object/defaults");
var _lodashObjectDefaults2 = _interopRequireDefault(_lodashObjectDefaults);
var _messages = require("../../messages");
var messages = _interopRequireWildcard(_messages);
var _binding = require("./binding");
var _binding2 = _interopRequireDefault(_binding);
var _globals = require("globals");
var _globals2 = _interopRequireDefault(_globals);
var _lodashArrayFlatten = require("lodash/array/flatten");
var _lodashArrayFlatten2 = _interopRequireDefault(_lodashArrayFlatten);
var _lodashObjectExtend = require("lodash/object/extend");
var _lodashObjectExtend2 = _interopRequireDefault(_lodashObjectExtend);
var _helpersObject = require("../../helpers/object");
var _helpersObject2 = _interopRequireDefault(_helpersObject);
var _types = require("../../types/index");
var t = _interopRequireWildcard(_types);
var collectorVisitor = {
  For: function For(node, parent, scope) {
    var _arr = t.FOR_INIT_KEYS;
    for (var _i = 0; _i < _arr.length; _i++) {
      var key = _arr[_i];
      var declar = this.get(key);
      if (declar.isVar())
        scope.getFunctionParent().registerBinding("var", declar);
    }
  },
  Declaration: function Declaration(node, parent, scope) {
    if (this.isBlockScoped())
      return;
    if (this.isExportDeclaration() && this.get("declaration").isDeclaration())
      return;
    scope.getFunctionParent().registerDeclaration(this);
  },
  ReferencedIdentifier: function ReferencedIdentifier(node) {
    var binding = this.scope.getBinding(node.name);
    if (binding) {
      binding.reference(this);
    } else {
      this.scope.getProgramParent().addGlobal(node);
    }
  },
  ForXStatement: function ForXStatement() {
    var left = this.get("left");
    if (left.isPattern() || left.isIdentifier()) {
      this.scope.registerConstantViolation(left, left);
    }
  },
  ExportDeclaration: {exit: function exit(node) {
      var declar = node.declaration;
      if (t.isClassDeclaration(declar) || t.isFunctionDeclaration(declar)) {
        this.scope.getBinding(declar.id.name).reference();
      } else if (t.isVariableDeclaration(declar)) {
        var _arr2 = declar.declarations;
        for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
          var decl = _arr2[_i2];
          var ids = t.getBindingIdentifiers(decl);
          for (var name in ids) {
            this.scope.getBinding(name).reference();
          }
        }
      }
    }},
  LabeledStatement: function LabeledStatement(node) {
    this.scope.getProgramParent().addGlobal(node);
    this.scope.getBlockParent().registerDeclaration(this);
  },
  AssignmentExpression: function AssignmentExpression() {
    var ids = this.getBindingIdentifiers();
    var programParent;
    for (var name in ids) {
      if (this.scope.getBinding(name))
        continue;
      programParent = programParent || this.scope.getProgramParent();
      programParent.addGlobal(ids[name]);
    }
    this.scope.registerConstantViolation(this, this.get("left"), this.get("right"));
  },
  UpdateExpression: function UpdateExpression(node, parent, scope) {
    scope.registerConstantViolation(this, this.get("argument"), null);
  },
  UnaryExpression: function UnaryExpression(node, parent, scope) {
    if (node.operator === "delete")
      scope.registerConstantViolation(this, this.get("left"), null);
  },
  BlockScoped: function BlockScoped(node, parent, scope) {
    if (scope.path === this)
      scope = scope.parent;
    scope.getBlockParent().registerDeclaration(this);
  },
  ClassDeclaration: function ClassDeclaration(node, parent, scope) {
    var name = node.id.name;
    scope.bindings[name] = scope.getBinding(name);
  },
  Block: function Block(node, parent, scope) {
    var paths = this.get("body");
    var _arr3 = paths;
    for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
      var path = _arr3[_i3];
      if (path.isFunctionDeclaration()) {
        scope.getBlockParent().registerDeclaration(path);
      }
    }
  }
};
var renameVisitor = {
  ReferencedIdentifier: function ReferencedIdentifier(node, parent, scope, state) {
    if (node.name === state.oldName) {
      node.name = state.newName;
    }
  },
  Scope: function Scope(node, parent, scope, state) {
    if (!scope.bindingIdentifierEquals(state.oldName, state.binding)) {
      this.skip();
    }
  },
  "AssignmentExpression|Declaration": function AssignmentExpressionDeclaration(node, parent, scope, state) {
    var ids = this.getBindingIdentifiers();
    for (var name in ids) {
      if (name === state.oldName)
        ids[name].name = state.newName;
    }
  }
};
var Scope = (function() {
  function Scope(path, parent) {
    _classCallCheck(this, Scope);
    if (parent && parent.block === path.node) {
      return parent;
    }
    var cached = path.getData("scope");
    if (cached && cached.parent === parent && cached.block === path.node) {
      return cached;
    } else {
      path.setData("scope", this);
    }
    this.parent = parent;
    this.hub = path.hub;
    this.parentBlock = path.parent;
    this.block = path.node;
    this.path = path;
  }
  Scope.prototype.traverse = function traverse(node, opts, state) {
    _index2["default"](node, opts, this, state, this.path);
  };
  Scope.prototype.generateDeclaredUidIdentifier = function generateDeclaredUidIdentifier() {
    var name = arguments.length <= 0 || arguments[0] === undefined ? "temp" : arguments[0];
    var id = this.generateUidIdentifier(name);
    this.push({id: id});
    return id;
  };
  Scope.prototype.generateUidIdentifier = function generateUidIdentifier(name) {
    return t.identifier(this.generateUid(name));
  };
  Scope.prototype.generateUid = function generateUid(name) {
    name = t.toIdentifier(name).replace(/^_+/, "");
    var uid;
    var i = 0;
    do {
      uid = this._generateUid(name, i);
      i++;
    } while (this.hasBinding(uid) || this.hasGlobal(uid) || this.hasReference(uid));
    var program = this.getProgramParent();
    program.references[uid] = true;
    program.uids[uid] = true;
    return uid;
  };
  Scope.prototype._generateUid = function _generateUid(name, i) {
    var id = name;
    if (i > 1)
      id += i;
    return "_" + id;
  };
  Scope.prototype.generateUidIdentifierBasedOnNode = function generateUidIdentifierBasedOnNode(parent, defaultName) {
    var node = parent;
    if (t.isAssignmentExpression(parent)) {
      node = parent.left;
    } else if (t.isVariableDeclarator(parent)) {
      node = parent.id;
    } else if (t.isProperty(node)) {
      node = node.key;
    }
    var parts = [];
    var add = function add(node) {
      if (t.isModuleDeclaration(node)) {
        if (node.source) {
          add(node.source);
        } else if (node.specifiers && node.specifiers.length) {
          var _arr4 = node.specifiers;
          for (var _i4 = 0; _i4 < _arr4.length; _i4++) {
            var specifier = _arr4[_i4];
            add(specifier);
          }
        } else if (node.declaration) {
          add(node.declaration);
        }
      } else if (t.isModuleSpecifier(node)) {
        add(node.local);
      } else if (t.isMemberExpression(node)) {
        add(node.object);
        add(node.property);
      } else if (t.isIdentifier(node)) {
        parts.push(node.name);
      } else if (t.isLiteral(node)) {
        parts.push(node.value);
      } else if (t.isCallExpression(node)) {
        add(node.callee);
      } else if (t.isObjectExpression(node) || t.isObjectPattern(node)) {
        var _arr5 = node.properties;
        for (var _i5 = 0; _i5 < _arr5.length; _i5++) {
          var prop = _arr5[_i5];
          add(prop.key || prop.argument);
        }
      }
    };
    add(node);
    var id = parts.join("$");
    id = id.replace(/^_/, "") || defaultName || "ref";
    return this.generateUidIdentifier(id);
  };
  Scope.prototype.isStatic = function isStatic(node) {
    if (t.isThisExpression(node) || t.isSuper(node)) {
      return true;
    }
    if (t.isIdentifier(node)) {
      var binding = this.getBinding(node.name);
      if (binding) {
        return binding.constant;
      } else {
        return this.hasBinding(node.name);
      }
    }
    return false;
  };
  Scope.prototype.maybeGenerateMemoised = function maybeGenerateMemoised(node, dontPush) {
    if (this.isStatic(node)) {
      return null;
    } else {
      var id = this.generateUidIdentifierBasedOnNode(node);
      if (!dontPush)
        this.push({id: id});
      return id;
    }
  };
  Scope.prototype.checkBlockScopedCollisions = function checkBlockScopedCollisions(local, kind, name, id) {
    if (kind === "param")
      return;
    if (kind === "hoisted" && local.kind === "let")
      return;
    var duplicate = false;
    if (!duplicate)
      duplicate = kind === "let" || local.kind === "let" || local.kind === "const" || local.kind === "module";
    if (!duplicate)
      duplicate = local.kind === "param" && (kind === "let" || kind === "const");
    if (duplicate) {
      throw this.hub.file.errorWithNode(id, messages.get("scopeDuplicateDeclaration", name), TypeError);
    }
  };
  Scope.prototype.rename = function rename(oldName, newName, block) {
    newName = newName || this.generateUidIdentifier(oldName).name;
    var info = this.getBinding(oldName);
    if (!info)
      return;
    var state = {
      newName: newName,
      oldName: oldName,
      binding: info.identifier,
      info: info
    };
    var scope = info.scope;
    scope.traverse(block || scope.block, renameVisitor, state);
    if (!block) {
      scope.removeOwnBinding(oldName);
      scope.bindings[newName] = info;
      state.binding.name = newName;
    }
    var file = this.hub.file;
    if (file) {
      this._renameFromMap(file.moduleFormatter.localImports, oldName, newName, state.binding);
    }
  };
  Scope.prototype._renameFromMap = function _renameFromMap(map, oldName, newName, value) {
    if (map[oldName]) {
      map[newName] = value;
      map[oldName] = null;
    }
  };
  Scope.prototype.dump = function dump() {
    var sep = _repeating2["default"]("-", 60);
    console.log(sep);
    var scope = this;
    do {
      console.log("#", scope.block.type);
      for (var name in scope.bindings) {
        var binding = scope.bindings[name];
        console.log(" -", name, {
          constant: binding.constant,
          references: binding.references,
          kind: binding.kind
        });
      }
    } while (scope = scope.parent);
    console.log(sep);
  };
  Scope.prototype.toArray = function toArray(node, i) {
    var file = this.hub.file;
    if (t.isIdentifier(node)) {
      var binding = this.getBinding(node.name);
      if (binding && binding.constant && binding.path.isGenericType("Array"))
        return node;
    }
    if (t.isArrayExpression(node)) {
      return node;
    }
    if (t.isIdentifier(node, {name: "arguments"})) {
      return t.callExpression(t.memberExpression(file.addHelper("slice"), t.identifier("call")), [node]);
    }
    var helperName = "to-array";
    var args = [node];
    if (i === true) {
      helperName = "to-consumable-array";
    } else if (i) {
      args.push(t.literal(i));
      helperName = "sliced-to-array";
      if (this.hub.file.isLoose("es6.forOf"))
        helperName += "-loose";
    }
    return t.callExpression(file.addHelper(helperName), args);
  };
  Scope.prototype.registerDeclaration = function registerDeclaration(path) {
    if (path.isLabeledStatement()) {
      this.registerBinding("label", path);
    } else if (path.isFunctionDeclaration()) {
      this.registerBinding("hoisted", path);
    } else if (path.isVariableDeclaration()) {
      var declarations = path.get("declarations");
      var _arr6 = declarations;
      for (var _i6 = 0; _i6 < _arr6.length; _i6++) {
        var declar = _arr6[_i6];
        this.registerBinding(path.node.kind, declar);
      }
    } else if (path.isClassDeclaration()) {
      this.registerBinding("let", path);
    } else if (path.isImportDeclaration()) {
      var specifiers = path.get("specifiers");
      var _arr7 = specifiers;
      for (var _i7 = 0; _i7 < _arr7.length; _i7++) {
        var specifier = _arr7[_i7];
        this.registerBinding("module", specifier);
      }
    } else if (path.isExportDeclaration()) {
      var declar = path.get("declaration");
      if (declar.isClassDeclaration() || declar.isFunctionDeclaration() || declar.isVariableDeclaration()) {
        this.registerDeclaration(declar);
      }
    } else {
      this.registerBinding("unknown", path);
    }
  };
  Scope.prototype.registerConstantViolation = function registerConstantViolation(root, left, right) {
    var ids = left.getBindingIdentifiers();
    for (var name in ids) {
      var binding = this.getBinding(name);
      if (binding)
        binding.reassign(root, left, right);
    }
  };
  Scope.prototype.registerBinding = function registerBinding(kind, path) {
    if (!kind)
      throw new ReferenceError("no `kind`");
    if (path.isVariableDeclaration()) {
      var declarators = path.get("declarations");
      var _arr8 = declarators;
      for (var _i8 = 0; _i8 < _arr8.length; _i8++) {
        var declar = _arr8[_i8];
        this.registerBinding(kind, declar);
      }
      return;
    }
    var parent = this.getProgramParent();
    var ids = path.getBindingIdentifiers(true);
    for (var name in ids) {
      var _arr9 = ids[name];
      for (var _i9 = 0; _i9 < _arr9.length; _i9++) {
        var id = _arr9[_i9];
        var local = this.getOwnBinding(name);
        if (local) {
          if (local.identifier === id)
            continue;
          this.checkBlockScopedCollisions(local, kind, name, id);
        }
        parent.references[name] = true;
        this.bindings[name] = new _binding2["default"]({
          identifier: id,
          existing: local,
          scope: this,
          path: path,
          kind: kind
        });
      }
    }
  };
  Scope.prototype.addGlobal = function addGlobal(node) {
    this.globals[node.name] = node;
  };
  Scope.prototype.hasUid = function hasUid(name) {
    var scope = this;
    do {
      if (scope.uids[name])
        return true;
    } while (scope = scope.parent);
    return false;
  };
  Scope.prototype.hasGlobal = function hasGlobal(name) {
    var scope = this;
    do {
      if (scope.globals[name])
        return true;
    } while (scope = scope.parent);
    return false;
  };
  Scope.prototype.hasReference = function hasReference(name) {
    var scope = this;
    do {
      if (scope.references[name])
        return true;
    } while (scope = scope.parent);
    return false;
  };
  Scope.prototype.isPure = function isPure(node, constantsOnly) {
    if (t.isIdentifier(node)) {
      var binding = this.getBinding(node.name);
      if (!binding)
        return false;
      if (constantsOnly)
        return binding.constant;
      return true;
    } else if (t.isClass(node)) {
      return !node.superClass || this.isPure(node.superClass, constantsOnly);
    } else if (t.isBinary(node)) {
      return this.isPure(node.left, constantsOnly) && this.isPure(node.right, constantsOnly);
    } else if (t.isArrayExpression(node)) {
      var _arr10 = node.elements;
      for (var _i10 = 0; _i10 < _arr10.length; _i10++) {
        var elem = _arr10[_i10];
        if (!this.isPure(elem, constantsOnly))
          return false;
      }
      return true;
    } else if (t.isObjectExpression(node)) {
      var _arr11 = node.properties;
      for (var _i11 = 0; _i11 < _arr11.length; _i11++) {
        var prop = _arr11[_i11];
        if (!this.isPure(prop, constantsOnly))
          return false;
      }
      return true;
    } else if (t.isProperty(node)) {
      if (node.computed && !this.isPure(node.key, constantsOnly))
        return false;
      return this.isPure(node.value, constantsOnly);
    } else {
      return t.isPure(node);
    }
  };
  Scope.prototype.setData = function setData(key, val) {
    return this.data[key] = val;
  };
  Scope.prototype.getData = function getData(key) {
    var scope = this;
    do {
      var data = scope.data[key];
      if (data != null)
        return data;
    } while (scope = scope.parent);
  };
  Scope.prototype.removeData = function removeData(key) {
    var scope = this;
    do {
      var data = scope.data[key];
      if (data != null)
        scope.data[key] = null;
    } while (scope = scope.parent);
  };
  Scope.prototype.init = function init() {
    if (!this.references)
      this.crawl();
  };
  Scope.prototype.crawl = function crawl() {
    var path = this.path;
    var info = this.block._scopeInfo;
    if (info)
      return _lodashObjectExtend2["default"](this, info);
    info = this.block._scopeInfo = {
      references: _helpersObject2["default"](),
      bindings: _helpersObject2["default"](),
      globals: _helpersObject2["default"](),
      uids: _helpersObject2["default"](),
      data: _helpersObject2["default"]()
    };
    _lodashObjectExtend2["default"](this, info);
    if (path.isLoop()) {
      var _arr12 = t.FOR_INIT_KEYS;
      for (var _i12 = 0; _i12 < _arr12.length; _i12++) {
        var key = _arr12[_i12];
        var node = path.get(key);
        if (node.isBlockScoped())
          this.registerBinding(node.node.kind, node);
      }
    }
    if (path.isFunctionExpression() && path.has("id")) {
      if (!t.isProperty(path.parent, {method: true})) {
        this.registerBinding("var", path);
      }
    }
    if (path.isClassExpression() && path.has("id")) {
      this.registerBinding("var", path);
    }
    if (path.isFunction()) {
      var params = path.get("params");
      var _arr13 = params;
      for (var _i13 = 0; _i13 < _arr13.length; _i13++) {
        var param = _arr13[_i13];
        this.registerBinding("param", param);
      }
    }
    if (path.isCatchClause()) {
      this.registerBinding("let", path);
    }
    if (path.isComprehensionExpression()) {
      this.registerBinding("let", path);
    }
    var parent = this.getProgramParent();
    if (parent.crawling)
      return;
    this.crawling = true;
    path.traverse(collectorVisitor);
    this.crawling = false;
  };
  Scope.prototype.push = function push(opts) {
    var path = this.path;
    if (path.isSwitchStatement()) {
      path = this.getFunctionParent().path;
    }
    if (path.isLoop() || path.isCatchClause() || path.isFunction()) {
      t.ensureBlock(path.node);
      path = path.get("body");
    }
    if (!path.isBlockStatement() && !path.isProgram()) {
      path = this.getBlockParent().path;
    }
    var unique = opts.unique;
    var kind = opts.kind || "var";
    var blockHoist = opts._blockHoist == null ? 2 : opts._blockHoist;
    var dataKey = "declaration:" + kind + ":" + blockHoist;
    var declarPath = !unique && path.getData(dataKey);
    if (!declarPath) {
      var declar = t.variableDeclaration(kind, []);
      declar._generated = true;
      declar._blockHoist = blockHoist;
      this.hub.file.attachAuxiliaryComment(declar);
      var _path$unshiftContainer = path.unshiftContainer("body", [declar]);
      declarPath = _path$unshiftContainer[0];
      if (!unique)
        path.setData(dataKey, declarPath);
    }
    var declarator = t.variableDeclarator(opts.id, opts.init);
    declarPath.node.declarations.push(declarator);
    this.registerBinding(kind, declarPath.get("declarations").pop());
  };
  Scope.prototype.getProgramParent = function getProgramParent() {
    var scope = this;
    do {
      if (scope.path.isProgram()) {
        return scope;
      }
    } while (scope = scope.parent);
    throw new Error("We couldn't find a Function or Program...");
  };
  Scope.prototype.getFunctionParent = function getFunctionParent() {
    var scope = this;
    do {
      if (scope.path.isFunctionParent()) {
        return scope;
      }
    } while (scope = scope.parent);
    throw new Error("We couldn't find a Function or Program...");
  };
  Scope.prototype.getBlockParent = function getBlockParent() {
    var scope = this;
    do {
      if (scope.path.isBlockParent()) {
        return scope;
      }
    } while (scope = scope.parent);
    throw new Error("We couldn't find a BlockStatement, For, Switch, Function, Loop or Program...");
  };
  Scope.prototype.getAllBindings = function getAllBindings() {
    var ids = _helpersObject2["default"]();
    var scope = this;
    do {
      _lodashObjectDefaults2["default"](ids, scope.bindings);
      scope = scope.parent;
    } while (scope);
    return ids;
  };
  Scope.prototype.getAllBindingsOfKind = function getAllBindingsOfKind() {
    var ids = _helpersObject2["default"]();
    var _arr14 = arguments;
    for (var _i14 = 0; _i14 < _arr14.length; _i14++) {
      var kind = _arr14[_i14];
      var scope = this;
      do {
        for (var name in scope.bindings) {
          var binding = scope.bindings[name];
          if (binding.kind === kind)
            ids[name] = binding;
        }
        scope = scope.parent;
      } while (scope);
    }
    return ids;
  };
  Scope.prototype.bindingIdentifierEquals = function bindingIdentifierEquals(name, node) {
    return this.getBindingIdentifier(name) === node;
  };
  Scope.prototype.getBinding = function getBinding(name) {
    var scope = this;
    do {
      var binding = scope.getOwnBinding(name);
      if (binding)
        return binding;
    } while (scope = scope.parent);
  };
  Scope.prototype.getOwnBinding = function getOwnBinding(name) {
    return this.bindings[name];
  };
  Scope.prototype.getBindingIdentifier = function getBindingIdentifier(name) {
    var info = this.getBinding(name);
    return info && info.identifier;
  };
  Scope.prototype.getOwnBindingIdentifier = function getOwnBindingIdentifier(name) {
    var binding = this.bindings[name];
    return binding && binding.identifier;
  };
  Scope.prototype.hasOwnBinding = function hasOwnBinding(name) {
    return !!this.getOwnBinding(name);
  };
  Scope.prototype.hasBinding = function hasBinding(name, noGlobals) {
    if (!name)
      return false;
    if (this.hasOwnBinding(name))
      return true;
    if (this.parentHasBinding(name, noGlobals))
      return true;
    if (this.hasUid(name))
      return true;
    if (!noGlobals && _lodashCollectionIncludes2["default"](Scope.globals, name))
      return true;
    if (!noGlobals && _lodashCollectionIncludes2["default"](Scope.contextVariables, name))
      return true;
    return false;
  };
  Scope.prototype.parentHasBinding = function parentHasBinding(name, noGlobals) {
    return this.parent && this.parent.hasBinding(name, noGlobals);
  };
  Scope.prototype.moveBindingTo = function moveBindingTo(name, scope) {
    var info = this.getBinding(name);
    if (info) {
      info.scope.removeOwnBinding(name);
      info.scope = scope;
      scope.bindings[name] = info;
    }
  };
  Scope.prototype.removeOwnBinding = function removeOwnBinding(name) {
    delete this.bindings[name];
  };
  Scope.prototype.removeBinding = function removeBinding(name) {
    var info = this.getBinding(name);
    if (info) {
      info.scope.removeOwnBinding(name);
    }
    var scope = this;
    do {
      if (scope.uids[name]) {
        scope.uids[name] = false;
      }
    } while (scope = scope.parent);
  };
  _createClass(Scope, null, [{
    key: "globals",
    value: _lodashArrayFlatten2["default"]([_globals2["default"].builtin, _globals2["default"].browser, _globals2["default"].node].map(Object.keys)),
    enumerable: true
  }, {
    key: "contextVariables",
    value: ["arguments", "undefined", "Infinity", "NaN"],
    enumerable: true
  }]);
  return Scope;
})();
exports["default"] = Scope;
module.exports = exports["default"];

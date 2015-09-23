/* */ 
"format cjs";
"use strict";
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
var _detectIndent = require("detect-indent");
var _detectIndent2 = _interopRequireDefault(_detectIndent);
var _whitespace = require("./whitespace");
var _whitespace2 = _interopRequireDefault(_whitespace);
var _nodePrinter = require("./node/printer");
var _nodePrinter2 = _interopRequireDefault(_nodePrinter);
var _repeating = require("repeating");
var _repeating2 = _interopRequireDefault(_repeating);
var _sourceMap = require("./source-map");
var _sourceMap2 = _interopRequireDefault(_sourceMap);
var _position = require("./position");
var _position2 = _interopRequireDefault(_position);
var _messages = require("../messages");
var messages = _interopRequireWildcard(_messages);
var _buffer = require("./buffer");
var _buffer2 = _interopRequireDefault(_buffer);
var _lodashObjectExtend = require("lodash/object/extend");
var _lodashObjectExtend2 = _interopRequireDefault(_lodashObjectExtend);
var _lodashCollectionEach = require("lodash/collection/each");
var _lodashCollectionEach2 = _interopRequireDefault(_lodashCollectionEach);
var _node2 = require("./node/index");
var _node3 = _interopRequireDefault(_node2);
var _types = require("../types/index");
var t = _interopRequireWildcard(_types);
var CodeGenerator = (function() {
  function CodeGenerator(ast, opts, code) {
    _classCallCheck(this, CodeGenerator);
    opts = opts || {};
    this.comments = ast.comments || [];
    this.tokens = ast.tokens || [];
    this.format = CodeGenerator.normalizeOptions(code, opts, this.tokens);
    this.opts = opts;
    this.ast = ast;
    this.whitespace = new _whitespace2["default"](this.tokens);
    this.position = new _position2["default"]();
    this.map = new _sourceMap2["default"](this.position, opts, code);
    this.buffer = new _buffer2["default"](this.position, this.format);
  }
  CodeGenerator.normalizeOptions = function normalizeOptions(code, opts, tokens) {
    var style = "  ";
    if (code) {
      var indent = _detectIndent2["default"](code).indent;
      if (indent && indent !== " ")
        style = indent;
    }
    var format = {
      shouldPrintComment: opts.shouldPrintComment,
      retainLines: opts.retainLines,
      comments: opts.comments == null || opts.comments,
      compact: opts.compact,
      quotes: CodeGenerator.findCommonStringDelimiter(code, tokens),
      indent: {
        adjustMultilineComment: true,
        style: style,
        base: 0
      }
    };
    if (format.compact === "auto") {
      format.compact = code.length > 100000;
      if (format.compact) {
        console.error("[BABEL] " + messages.get("codeGeneratorDeopt", opts.filename, "100KB"));
      }
    }
    if (format.compact) {
      format.indent.adjustMultilineComment = false;
    }
    return format;
  };
  CodeGenerator.findCommonStringDelimiter = function findCommonStringDelimiter(code, tokens) {
    var occurences = {
      single: 0,
      double: 0
    };
    var checked = 0;
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (token.type.label !== "string")
        continue;
      var raw = code.slice(token.start, token.end);
      if (raw[0] === "'") {
        occurences.single++;
      } else {
        occurences.double++;
      }
      checked++;
      if (checked >= 3)
        break;
    }
    if (occurences.single > occurences.double) {
      return "single";
    } else {
      return "double";
    }
  };
  CodeGenerator.prototype.generate = function generate() {
    var ast = this.ast;
    this.print(ast);
    if (ast.comments) {
      var comments = [];
      var _arr = ast.comments;
      for (var _i = 0; _i < _arr.length; _i++) {
        var comment = _arr[_i];
        if (!comment._displayed)
          comments.push(comment);
      }
      this._printComments(comments);
    }
    return {
      map: this.map.get(),
      code: this.buffer.get()
    };
  };
  CodeGenerator.prototype.buildPrint = function buildPrint(parent) {
    return new _nodePrinter2["default"](this, parent);
  };
  CodeGenerator.prototype.catchUp = function catchUp(node) {
    if (node.loc && this.format.retainLines && this.buffer.buf) {
      while (this.position.line < node.loc.start.line) {
        this._push("\n");
      }
    }
  };
  CodeGenerator.prototype._printNewline = function _printNewline(leading, node, parent, opts) {
    if (!opts.statement && !_node3["default"].isUserWhitespacable(node, parent)) {
      return;
    }
    var lines = 0;
    if (node.start != null && !node._ignoreUserWhitespace) {
      if (leading) {
        lines = this.whitespace.getNewlinesBefore(node);
      } else {
        lines = this.whitespace.getNewlinesAfter(node);
      }
    } else {
      if (!leading)
        lines++;
      if (opts.addNewlines)
        lines += opts.addNewlines(leading, node) || 0;
      var needs = _node3["default"].needsWhitespaceAfter;
      if (leading)
        needs = _node3["default"].needsWhitespaceBefore;
      if (needs(node, parent))
        lines++;
      if (!this.buffer.buf)
        lines = 0;
    }
    this.newline(lines);
  };
  CodeGenerator.prototype.print = function print(node, parent) {
    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    if (!node)
      return;
    if (parent && parent._compact) {
      node._compact = true;
    }
    var oldConcise = this.format.concise;
    if (node._compact) {
      this.format.concise = true;
    }
    if (!this[node.type]) {
      throw new ReferenceError("unknown node of type " + JSON.stringify(node.type) + " with constructor " + JSON.stringify(node && node.constructor.name));
    }
    var needsParens = _node3["default"].needsParens(node, parent);
    if (needsParens)
      this.push("(");
    this.printLeadingComments(node, parent);
    this.catchUp(node);
    this._printNewline(true, node, parent, opts);
    if (opts.before)
      opts.before();
    this.map.mark(node, "start");
    this[node.type](node, this.buildPrint(node), parent);
    if (needsParens)
      this.push(")");
    this.map.mark(node, "end");
    if (opts.after)
      opts.after();
    this.format.concise = oldConcise;
    this._printNewline(false, node, parent, opts);
    this.printTrailingComments(node, parent);
  };
  CodeGenerator.prototype.printJoin = function printJoin(print, nodes) {
    var _this = this;
    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
    if (!nodes || !nodes.length)
      return;
    var len = nodes.length;
    if (opts.indent)
      this.indent();
    var printOpts = {
      statement: opts.statement,
      addNewlines: opts.addNewlines,
      after: function after() {
        if (opts.iterator) {
          opts.iterator(node, i);
        }
        if (opts.separator && i < len - 1) {
          _this.push(opts.separator);
        }
      }
    };
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      print.plain(node, printOpts);
    }
    if (opts.indent)
      this.dedent();
  };
  CodeGenerator.prototype.printAndIndentOnComments = function printAndIndentOnComments(print, node) {
    var indent = !!node.leadingComments;
    if (indent)
      this.indent();
    print.plain(node);
    if (indent)
      this.dedent();
  };
  CodeGenerator.prototype.printBlock = function printBlock(print, node) {
    if (t.isEmptyStatement(node)) {
      this.semicolon();
    } else {
      this.push(" ");
      print.plain(node);
    }
  };
  CodeGenerator.prototype.generateComment = function generateComment(comment) {
    var val = comment.value;
    if (comment.type === "CommentLine") {
      val = "//" + val;
    } else {
      val = "/*" + val + "*/";
    }
    return val;
  };
  CodeGenerator.prototype.printTrailingComments = function printTrailingComments(node, parent) {
    this._printComments(this.getComments("trailingComments", node, parent));
  };
  CodeGenerator.prototype.printLeadingComments = function printLeadingComments(node, parent) {
    this._printComments(this.getComments("leadingComments", node, parent));
  };
  CodeGenerator.prototype.getComments = function getComments(key, node, parent) {
    if (t.isExpressionStatement(parent)) {
      return [];
    }
    var comments = [];
    var nodes = [node];
    if (t.isExpressionStatement(node)) {
      nodes.push(node.argument);
    }
    var _arr2 = nodes;
    for (var _i2 = 0; _i2 < _arr2.length; _i2++) {
      var _node = _arr2[_i2];
      comments = comments.concat(this._getComments(key, _node));
    }
    return comments;
  };
  CodeGenerator.prototype._getComments = function _getComments(key, node) {
    return node && node[key] || [];
  };
  CodeGenerator.prototype.shouldPrintComment = function shouldPrintComment(comment) {
    if (this.format.shouldPrintComment) {
      return this.format.shouldPrintComment(comment.value);
    } else {
      if (comment.value.indexOf("@license") >= 0 || comment.value.indexOf("@preserve") >= 0) {
        return true;
      } else {
        return this.format.comments;
      }
    }
  };
  CodeGenerator.prototype._printComments = function _printComments(comments) {
    if (!comments || !comments.length)
      return;
    var _arr3 = comments;
    for (var _i3 = 0; _i3 < _arr3.length; _i3++) {
      var comment = _arr3[_i3];
      if (!this.shouldPrintComment(comment))
        continue;
      if (comment._displayed)
        continue;
      comment._displayed = true;
      this.catchUp(comment);
      this.newline(this.whitespace.getNewlinesBefore(comment));
      var column = this.position.column;
      var val = this.generateComment(comment);
      if (column && !this.isLast(["\n", " ", "[", "{"])) {
        this._push(" ");
        column++;
      }
      if (comment.type === "CommentBlock" && this.format.indent.adjustMultilineComment) {
        var offset = comment.loc && comment.loc.start.column;
        if (offset) {
          var newlineRegex = new RegExp("\\n\\s{1," + offset + "}", "g");
          val = val.replace(newlineRegex, "\n");
        }
        var indent = Math.max(this.indentSize(), column);
        val = val.replace(/\n/g, "\n" + _repeating2["default"](" ", indent));
      }
      if (column === 0) {
        val = this.getIndent() + val;
      }
      if ((this.format.compact || this.format.retainLines) && comment.type === "CommentLine") {
        val += "\n";
      }
      this._push(val);
      this.newline(this.whitespace.getNewlinesAfter(comment));
    }
  };
  _createClass(CodeGenerator, null, [{
    key: "generators",
    value: {
      templateLiterals: require("./generators/template-literals"),
      comprehensions: require("./generators/comprehensions"),
      expressions: require("./generators/expressions"),
      statements: require("./generators/statements"),
      classes: require("./generators/classes"),
      methods: require("./generators/methods"),
      modules: require("./generators/modules"),
      types: require("./generators/types"),
      flow: require("./generators/flow"),
      base: require("./generators/base"),
      jsx: require("./generators/jsx")
    },
    enumerable: true
  }]);
  return CodeGenerator;
})();
_lodashCollectionEach2["default"](_buffer2["default"].prototype, function(fn, key) {
  CodeGenerator.prototype[key] = function() {
    return fn.apply(this.buffer, arguments);
  };
});
_lodashCollectionEach2["default"](CodeGenerator.generators, function(generator) {
  _lodashObjectExtend2["default"](CodeGenerator.prototype, generator);
});
module.exports = function(ast, opts, code) {
  var gen = new CodeGenerator(ast, opts, code);
  return gen.generate();
};
module.exports.CodeGenerator = CodeGenerator;

/* */ 
"format cjs";
"use strict";
exports.__esModule = true;
exports.AnyTypeAnnotation = AnyTypeAnnotation;
exports.ArrayTypeAnnotation = ArrayTypeAnnotation;
exports.BooleanTypeAnnotation = BooleanTypeAnnotation;
exports.BooleanLiteralTypeAnnotation = BooleanLiteralTypeAnnotation;
exports.DeclareClass = DeclareClass;
exports.DeclareFunction = DeclareFunction;
exports.DeclareModule = DeclareModule;
exports.DeclareVariable = DeclareVariable;
exports.FunctionTypeAnnotation = FunctionTypeAnnotation;
exports.FunctionTypeParam = FunctionTypeParam;
exports.InterfaceExtends = InterfaceExtends;
exports._interfaceish = _interfaceish;
exports.InterfaceDeclaration = InterfaceDeclaration;
exports.IntersectionTypeAnnotation = IntersectionTypeAnnotation;
exports.MixedTypeAnnotation = MixedTypeAnnotation;
exports.NullableTypeAnnotation = NullableTypeAnnotation;
exports.NumberTypeAnnotation = NumberTypeAnnotation;
exports.StringLiteralTypeAnnotation = StringLiteralTypeAnnotation;
exports.StringTypeAnnotation = StringTypeAnnotation;
exports.TupleTypeAnnotation = TupleTypeAnnotation;
exports.TypeofTypeAnnotation = TypeofTypeAnnotation;
exports.TypeAlias = TypeAlias;
exports.TypeAnnotation = TypeAnnotation;
exports.TypeParameterInstantiation = TypeParameterInstantiation;
exports.ObjectTypeAnnotation = ObjectTypeAnnotation;
exports.ObjectTypeCallProperty = ObjectTypeCallProperty;
exports.ObjectTypeIndexer = ObjectTypeIndexer;
exports.ObjectTypeProperty = ObjectTypeProperty;
exports.QualifiedTypeIdentifier = QualifiedTypeIdentifier;
exports.UnionTypeAnnotation = UnionTypeAnnotation;
exports.TypeCastExpression = TypeCastExpression;
exports.VoidTypeAnnotation = VoidTypeAnnotation;
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
function AnyTypeAnnotation() {
  this.push("any");
}
function ArrayTypeAnnotation(node, print) {
  print.plain(node.elementType);
  this.push("[");
  this.push("]");
}
function BooleanTypeAnnotation() {
  this.push("bool");
}
function BooleanLiteralTypeAnnotation(node) {
  this.push(node.value ? "true" : "false");
}
function DeclareClass(node, print) {
  this.push("declare class ");
  this._interfaceish(node, print);
}
function DeclareFunction(node, print) {
  this.push("declare function ");
  print.plain(node.id);
  print.plain(node.id.typeAnnotation.typeAnnotation);
  this.semicolon();
}
function DeclareModule(node, print) {
  this.push("declare module ");
  print.plain(node.id);
  this.space();
  print.plain(node.body);
}
function DeclareVariable(node, print) {
  this.push("declare var ");
  print.plain(node.id);
  print.plain(node.id.typeAnnotation);
  this.semicolon();
}
function FunctionTypeAnnotation(node, print, parent) {
  print.plain(node.typeParameters);
  this.push("(");
  print.list(node.params);
  if (node.rest) {
    if (node.params.length) {
      this.push(",");
      this.space();
    }
    this.push("...");
    print.plain(node.rest);
  }
  this.push(")");
  if (parent.type === "ObjectTypeProperty" || parent.type === "ObjectTypeCallProperty" || parent.type === "DeclareFunction") {
    this.push(":");
  } else {
    this.space();
    this.push("=>");
  }
  this.space();
  print.plain(node.returnType);
}
function FunctionTypeParam(node, print) {
  print.plain(node.name);
  if (node.optional)
    this.push("?");
  this.push(":");
  this.space();
  print.plain(node.typeAnnotation);
}
function InterfaceExtends(node, print) {
  print.plain(node.id);
  print.plain(node.typeParameters);
}
exports.ClassImplements = InterfaceExtends;
exports.GenericTypeAnnotation = InterfaceExtends;
function _interfaceish(node, print) {
  print.plain(node.id);
  print.plain(node.typeParameters);
  if (node["extends"].length) {
    this.push(" extends ");
    print.join(node["extends"], {separator: ", "});
  }
  this.space();
  print.plain(node.body);
}
function InterfaceDeclaration(node, print) {
  this.push("interface ");
  this._interfaceish(node, print);
}
function IntersectionTypeAnnotation(node, print) {
  print.join(node.types, {separator: " & "});
}
function MixedTypeAnnotation() {
  this.push("mixed");
}
function NullableTypeAnnotation(node, print) {
  this.push("?");
  print.plain(node.typeAnnotation);
}
var _types2 = require("./types");
exports.NumberLiteralTypeAnnotation = _types2.Literal;
function NumberTypeAnnotation() {
  this.push("number");
}
function StringLiteralTypeAnnotation(node) {
  this.push(this._stringLiteral(node.value));
}
function StringTypeAnnotation() {
  this.push("string");
}
function TupleTypeAnnotation(node, print) {
  this.push("[");
  print.join(node.types, {separator: ", "});
  this.push("]");
}
function TypeofTypeAnnotation(node, print) {
  this.push("typeof ");
  print.plain(node.argument);
}
function TypeAlias(node, print) {
  this.push("type ");
  print.plain(node.id);
  print.plain(node.typeParameters);
  this.space();
  this.push("=");
  this.space();
  print.plain(node.right);
  this.semicolon();
}
function TypeAnnotation(node, print) {
  this.push(":");
  this.space();
  if (node.optional)
    this.push("?");
  print.plain(node.typeAnnotation);
}
function TypeParameterInstantiation(node, print) {
  this.push("<");
  print.join(node.params, {
    separator: ", ",
    iterator: function iterator(node) {
      print.plain(node.typeAnnotation);
    }
  });
  this.push(">");
}
exports.TypeParameterDeclaration = TypeParameterInstantiation;
function ObjectTypeAnnotation(node, print) {
  var _this = this;
  this.push("{");
  var props = node.properties.concat(node.callProperties, node.indexers);
  if (props.length) {
    this.space();
    print.list(props, {
      separator: false,
      indent: true,
      iterator: function iterator() {
        if (props.length !== 1) {
          _this.semicolon();
          _this.space();
        }
      }
    });
    this.space();
  }
  this.push("}");
}
function ObjectTypeCallProperty(node, print) {
  if (node["static"])
    this.push("static ");
  print.plain(node.value);
}
function ObjectTypeIndexer(node, print) {
  if (node["static"])
    this.push("static ");
  this.push("[");
  print.plain(node.id);
  this.push(":");
  this.space();
  print.plain(node.key);
  this.push("]");
  this.push(":");
  this.space();
  print.plain(node.value);
}
function ObjectTypeProperty(node, print) {
  if (node["static"])
    this.push("static ");
  print.plain(node.key);
  if (node.optional)
    this.push("?");
  if (!t.isFunctionTypeAnnotation(node.value)) {
    this.push(":");
    this.space();
  }
  print.plain(node.value);
}
function QualifiedTypeIdentifier(node, print) {
  print.plain(node.qualification);
  this.push(".");
  print.plain(node.id);
}
function UnionTypeAnnotation(node, print) {
  print.join(node.types, {separator: " | "});
}
function TypeCastExpression(node, print) {
  this.push("(");
  print.plain(node.expression);
  print.plain(node.typeAnnotation);
  this.push(")");
}
function VoidTypeAnnotation() {
  this.push("void");
}

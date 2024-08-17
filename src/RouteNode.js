"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _RouteNode_handler;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteNode = void 0;
var WILDCARD = "*";
function isParametrized(pathPart) {
    return pathPart.startsWith(":");
}
function isOptional(pathPart) {
    return pathPart.endsWith("?");
}
function getParamName(_name) {
    var name = _name;
    if (isOptional(name)) {
        name = name.slice(0, -1);
    }
    if (isParametrized(name)) {
        name = name.slice(1);
    }
    return name;
}
function getPathPartName(pathPart) {
    if (isParametrized(pathPart) || pathPart === WILDCARD) {
        return WILDCARD;
    }
    return getParamName(pathPart);
}
var RouteNode = /** @class */ (function () {
    function RouteNode(name) {
        if (name === void 0) { name = "root"; }
        this.children = {};
        this.params = [];
        _RouteNode_handler.set(this, null);
        this.type = "default";
        this.name = name;
    }
    Object.defineProperty(RouteNode.prototype, "handler", {
        set: function (cb) {
            if (__classPrivateFieldGet(this, _RouteNode_handler, "f")) {
                throw new Error("Handler is already defined and cannot be reassigned.");
            }
            __classPrivateFieldSet(this, _RouteNode_handler, cb, "f");
        },
        enumerable: false,
        configurable: true
    });
    RouteNode.prototype.add = function (path, handler, index, params) {
        var _a, _b;
        if (index === void 0) { index = -1; }
        if (params === void 0) { params = []; }
        if (path.length - 1 <= index) {
            this.handler = handler;
            (_a = this.params).push.apply(_a, params);
            return;
        }
        var nextPathPart = path[index + 1];
        var nextName = getPathPartName(nextPathPart);
        var hasChild = nextName in this.children;
        if (isOptional(nextPathPart)) {
            this.handler = handler;
            (_b = this.params).push.apply(_b, params);
        }
        if (!hasChild) {
            this.children[nextName] = new RouteNode(nextName);
        }
        var nextParams = params;
        if (nextName === WILDCARD && nextPathPart !== WILDCARD) {
            nextParams = __spreadArray(__spreadArray([], params, true), [getParamName(nextPathPart)], false);
            this.children[nextName].type = "parametrized";
        }
        if (nextPathPart === WILDCARD) {
            this.children[nextName].type = "wildcard";
        }
        this.children[nextName].add(path, handler, index + 1, nextParams);
    };
    RouteNode.prototype.resolve = function (path, params, index, potential) {
        if (params === void 0) { params = []; }
        if (index === void 0) { index = -1; }
        var paramsData = params;
        var currentPathPart = path[index + 1];
        if (this.type === "parametrized") {
            paramsData = __spreadArray(__spreadArray([], paramsData, true), [path[index]], false);
        }
        if (path.length - 1 === index) {
            if (!__classPrivateFieldGet(this, _RouteNode_handler, "f")) {
                if (potential) {
                    return potential.node.resolve(path, potential.params, potential.index + 1);
                }
                return null;
            }
            var paramsObj = this.params.reduce(function (obj, name, index) {
                obj[name] = paramsData[index];
                return obj;
            }, {});
            return {
                handler: __classPrivateFieldGet(this, _RouteNode_handler, "f"),
                params: paramsObj,
            };
        }
        var child = this.children[currentPathPart];
        if (WILDCARD in this.children && path.length - 2 > index) {
            if (!child) {
                child = this.children[WILDCARD];
            }
            else if (!potential) {
                potential = {
                    node: this.children[WILDCARD],
                    index: index,
                    params: paramsData,
                };
            }
        }
        if (!child) {
            if (WILDCARD in this.children) {
                child = this.children[WILDCARD];
            }
            else if (potential) {
                return potential.node.resolve(path, potential.params, potential.index + 1);
            }
            else {
                return null;
            }
        }
        return child.resolve(path, paramsData, index + 1, potential);
    };
    RouteNode.prototype.toString = function (indentation, lastChild) {
        var _this = this;
        if (indentation === void 0) { indentation = ""; }
        if (lastChild === void 0) { lastChild = true; }
        var result = "".concat(indentation).concat(lastChild ? "└─" : "├─", " ").concat(this.name, " [type: ").concat(this.type, ", params: [").concat(this.params.join(", "), "]]\n");
        var childrenKeys = Object.keys(this.children);
        childrenKeys.forEach(function (key, index) {
            var child = _this.children[key];
            var isLast = index === childrenKeys.length - 1;
            result += child.toString(indentation + (lastChild ? "   " : "│  "), isLast);
        });
        return result;
    };
    return RouteNode;
}());
exports.RouteNode = RouteNode;
_RouteNode_handler = new WeakMap();

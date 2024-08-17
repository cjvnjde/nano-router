"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
var RouteNode_1 = require("./RouteNode");
var forbiddenDividers = ["?", ":"];
var Router = /** @class */ (function () {
    function Router(dividers) {
        if (dividers === void 0) { dividers = ["/", "-"]; }
        var _this = this;
        this.root = new RouteNode_1.RouteNode();
        this.toString = function () {
            return _this.root.toString();
        };
        for (var _i = 0, dividers_1 = dividers; _i < dividers_1.length; _i++) {
            var divider = dividers_1[_i];
            if (forbiddenDividers.includes(divider)) {
                throw new Error("Divider \"".concat(divider, "\" is forbidden."));
            }
        }
        this.dividerRegex = new RegExp("[".concat(dividers.join(''), "]"), 'g');
    }
    Router.prototype.on = function (path, handler) {
        var shatteredPath = this.splitPath(path);
        this.root.add(shatteredPath, handler);
    };
    Router.prototype.match = function (path) {
        var urlPath = path.split('?')[0];
        var shatteredPath = this.splitPath(urlPath);
        return this.root.resolve(shatteredPath);
    };
    Router.prototype.splitPath = function (path) {
        return path.split(this.dividerRegex).filter(Boolean);
    };
    return Router;
}());
exports.Router = Router;

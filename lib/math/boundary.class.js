"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * this class is responsible to show the boundary of the selected components
 */
var Boundary = (function () {
    function Boundary(left, rigth, top, bottom, components) {
        this.left = left;
        this.rigth = rigth;
        this.top = top;
        this.bottom = bottom;
        this.components = components;
    }
    Boundary.createFromXY = function (x, y, component) {
        var bottom = y + component.type === "file" ? 100 : 350;
        return new this(x, x, y, bottom, [component]);
    };
    Boundary.createFromPoint = function (point, component) {
        return this.createFromXY(point.x, point.y, component);
    };
    Boundary.createFromComponent = function (component) {
        return this.createFromPoint(component.position, component);
    };
    Boundary.createFromComponents = function (components) {
        var _this = this;
        if (components == null || components.length === 0) {
            return null;
        }
        var boundary = this.createFromComponent(components[0]);
        components.slice(1).forEach(function (component) {
            boundary.extend(_this.createFromComponent(component));
        });
        return boundary;
    };
    Boundary.prototype.extend = function (boundary2) {
        this.left = Math.min(boundary2.left, this.left);
        this.rigth = Math.max(boundary2.rigth, this.rigth);
        this.top = Math.min(boundary2.top, this.top);
        this.bottom = Math.max(boundary2.bottom, this.bottom);
        this.components = this.components.concat(boundary2.components);
    };
    Boundary.translate = function (boundary, x, y) {
        boundary.left += x;
        boundary.rigth += x;
        boundary.top += y;
        boundary.bottom += y;
        boundary.components.forEach(function (component) {
            var position = component.position;
            position.x += x;
            position.y += y;
        });
    };
    Boundary.prototype.translateXY = function (x, y) {
        if (y === void 0) { y = 0; }
        Boundary.translate(this, x, y);
    };
    /**
    arranges the layout
    */
    Boundary.arrangeLayout = function (boundaries) {
        var maxX = 0;
        var components = [];
        boundaries.forEach(function (boundary) {
            maxX = Math.max(boundary.rigth, maxX);
            components = components.concat(boundary.components);
        });
        var prevBound = null;
        boundaries.forEach(function (boundary) {
            var translateX = maxX - boundary.rigth;
            var translateY = prevBound ? prevBound.bottom - boundary.top : 0;
            boundary.translateXY(translateX, translateY);
            prevBound = boundary;
        });
        var x = 0, y = 0, bottom = 350;
        if (boundaries.length) {
            x = maxX + 350;
            y = Math.max((prevBound.bottom - 350) / 2, 0);
            bottom = Math.max(prevBound.bottom, 350);
        }
        return [new Boundary(0, x, 0, bottom, components), { x: x, y: y }];
    };
    return Boundary;
}());
exports.Boundary = Boundary;

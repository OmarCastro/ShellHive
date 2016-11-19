"use strict";
var Boundary = (function () {
    function Boundary(left, rigth, top, bottom, components) {
        this.left = left;
        this.rigth = rigth;
        this.top = top;
        this.bottom = bottom;
        this.components = components;
    }
    Boundary.createFromXY = function (x, y, component) {
        var bottom;
        if (component.type === "file") {
            bottom = y + 100;
        }
        else {
            bottom = y + 350;
        }
        return new this(x, x, y, bottom, [component]);
    };
    Boundary.createFromPoint = function (point, component) {
        return this.createFromXY(point.x, point.y, component);
    };
    Boundary.createFromComponent = function (component) {
        return this.createFromPoint(component.position, component);
    };
    Boundary.createFromComponents = function (components) {
        if (components.length === 0) {
            return null;
        }
        var boundary = this.createFromComponent(components[0]);
        for (var i = 1, len = components.length; i < len; ++i) {
            boundary.extend(this.createFromComponent(components[i]));
        }
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
        var prevBound = null;
        var components = [];
        boundaries.forEach(function (boundary) {
            maxX = Math.max(boundary.rigth, maxX);
            components = components.concat(boundary.components);
        });
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

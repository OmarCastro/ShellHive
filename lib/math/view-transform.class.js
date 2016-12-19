"use strict";
/**
 * Responsible for showing the transformation of a scene
 */
var ViewTransform = (function () {
    function ViewTransform(translateX, translateY, _scale) {
        if (translateX === void 0) { translateX = 0; }
        if (translateY === void 0) { translateY = 0; }
        if (_scale === void 0) { _scale = 1; }
        this.translateX = translateX;
        this.translateY = translateY;
        this._scale = _scale;
    }
    ViewTransform.prototype.translate = function (x, y) {
        this.translateX += x;
        this.translateY += y;
    };
    Object.defineProperty(ViewTransform.prototype, "x", {
        get: function () { return this.translateX; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewTransform.prototype, "y", {
        get: function () { return this.translateY; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewTransform.prototype, "scaleAmount", {
        get: function () { return this._scale; },
        enumerable: true,
        configurable: true
    });
    ViewTransform.prototype.translateByPoint = function (point) {
        this.translate(point.x, point.y);
    };
    ViewTransform.prototype.transformCoordinates = function (x, y) {
        return {
            x: (x - this.translateX) / this._scale,
            y: (y - this.translateY) / this._scale
        };
    };
    ViewTransform.prototype.transformPoint = function (point) {
        return this.transformCoordinates(point.x, point.y);
    };
    return ViewTransform;
}());
exports.ViewTransform = ViewTransform;

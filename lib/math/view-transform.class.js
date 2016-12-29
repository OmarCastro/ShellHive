"use strict";
/**
 * ViewTransform class
 *
 * A simplified version of the tranformation matrix of a scene, since
 * for all necessary features, the scale and translate operations are enough.
 *
 * The affline matrix used for the transformation is:
 *
 *   [ scale     0        x  ]
 *   [ 0        scale     y  ]
 *   [ 0          0       1  ]
 *
 * this matrix is the result of the following transformations
 *   scale by {scale} then translate by {x} and {y}
 *
 */
var ViewTransform = (function () {
    function ViewTransform(x, y, _scale) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (_scale === void 0) { _scale = 1; }
        this.x = x;
        this.y = y;
        this._scale = _scale;
    }
    Object.defineProperty(ViewTransform.prototype, "scale", {
        get: function () { return this._scale; },
        set: function (scaleAmmount) { this._scale = scaleAmmount; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ViewTransform.prototype, "cssTransform", {
        get: function () { return "translate(" + this.x + "px, " + this.y + "px) scale(" + this.scale + ")"; },
        enumerable: true,
        configurable: true
    });
    ViewTransform.prototype.translateByPoint = function (point) {
        this.translate(point.x, point.y);
    };
    ViewTransform.prototype.translate = function (x, y) {
        this.x += x;
        this.y += y;
    };
    /**
     * apply the tranformation of the point with the transformation matrix
     */
    ViewTransform.prototype.transformCoordinates = function (x, y) {
        return {
            x: x * this._scale + this.x,
            y: y * this._scale + this.y
        };
    };
    /**
     * apply the inverse tranformation the point the transformation matrix
     */
    ViewTransform.prototype.inverseTransformCoordinates = function (x, y) {
        return {
            x: (x - this.x) / this._scale,
            y: (y - this.y) / this._scale
        };
    };
    ViewTransform.prototype.transformPoint = function (point) {
        return this.transformCoordinates(point.x, point.y);
    };
    return ViewTransform;
}());
exports.ViewTransform = ViewTransform;

/**
A rectangle class
*/
var Rectangle = (function () {
    function Rectangle() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
    }
    Object.defineProperty(Rectangle.prototype, "left", {
        get: function () {
            return this.x;
        },
        set: function (x) {
            this.x = x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "right", {
        get: function () {
            return this.x + this.width;
        },
        set: function (x) {
            this.width = x - this.x;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "top", {
        get: function () {
            return this.y;
        },
        set: function (y) {
            this.y = y;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Rectangle.prototype, "bottom", {
        get: function () {
            return this.y + this.height;
        },
        set: function (y) {
            this.height = y - this.y;
        },
        enumerable: true,
        configurable: true
    });

    /**
    expands the rectangle by doing the union beteen this
    and the other rectangle
    */
    Rectangle.prototype.expand = function (other) {
        var x = Math.min(this.x, other.x);
        var y = Math.min(this.y, other.y);
        var w = Math.max(this.right, other.right);
        -x;
        var h = Math.max(this.bottom, other.bottom) - y;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    };

    /** translates the rectangle by X and Y */
    Rectangle.prototype.translateXY = function (x, y) {
        this.x += x;
        this.y += y;
    };

    /** translates the rectangle by a point object, it should include x and y */
    Rectangle.prototype.translatePoint = function (point) {
        this.x += point.x;
        this.y += point.y;
    };
    return Rectangle;
})();

module.exports = Rectangle;

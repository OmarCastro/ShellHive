"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Iterator = (function () {
    function Iterator(ArgList) {
        this.index = 0;
        this.argList = ArgList;
        this.length = ArgList.length;
        this.current = ArgList[0];
    }
    Iterator.prototype.hasNext = function () { return this.index !== this.length; };
    Iterator.prototype.next = function () { return this.current = this.argList[this.index++]; };
    Iterator.prototype.rest = function () { return this.argList.slice(this.index); };
    return Iterator;
}());
exports.Iterator = Iterator;

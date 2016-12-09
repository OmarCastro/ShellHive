"use strict";
var app = require("../app.module");
app.directive("mousetrap", [function () { return ({
        scope: true,
        link: function (scope, element, attr) {
            var shorcuts = attr.mousetrap;
            var htmlbuttons = shorcuts.split("+").map(function (key) { return "<kbd>" + key + "</kbd>"; }).join("+");
            element.append("<div class=\"small align-right\">" + htmlbuttons + "</div>");
            Mousetrap.bind(attr.mousetrap.toLowerCase(), function () { return element.trigger("click"); });
        }
    }); }]);

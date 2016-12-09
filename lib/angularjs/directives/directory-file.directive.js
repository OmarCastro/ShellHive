"use strict";
var app = require("../app.module");
var utils_1 = require("../utils");
app.directive("directoryfile", [function () {
        return {
            scope: true,
            template: "\n      <p class=\"icon-container text-center\">\n        <span class=\"icon glyphicon glyphicon-file\"></span>\n      </p>\n      <p class=\"icon-label text-center\" ng-bind=\"record.name\"></p>",
            link: function (scope, element, attr) {
                console.log('linking dirfile');
                var contentType = 'application/octet-stream';
                var filename = scope.record.filename;
                var origin = window.location.origin;
                var path = [origin, 'files', utils_1.projectId, scope.record.name].join('/');
                var downloadurl = [contentType, filename, path].join(':');
                scope.record.downloadurl = ['/download', utils_1.projectId, scope.record.name].join('/');
                //element.attr("href", path)
                element.attr("data-downloadurl", downloadurl);
                element[0].addEventListener("dragstart", function (event) {
                    var dt = event.dataTransfer;
                    dt.setData("text/uri-list", path);
                    dt.setData("text/plain", filename);
                    dt.setData("DownloadURL", downloadurl);
                }, false);
                element.dblclick(function (event) {
                    window.open(path, '_blank');
                });
            }
        };
    }]);

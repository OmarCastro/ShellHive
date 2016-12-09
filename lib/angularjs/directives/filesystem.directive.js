"use strict";
var app = require("../app.module");
var utils_1 = require("../utils");
var router_1 = require("../router");
app.directive("filesystem", ['csrf', 'alerts', '$rootScope', function (csrf, alerts, rootScope) { return ({
        scope: true,
        template: "\n    <div class=\"container-fluid\">\n    <div class=\"row-fluid\">\n      <div ng-repeat=\"record in directoryContent\" class=\"col-xs-4 col-sm-3 col-md-2\" directoryfile\n      ng-class=\"(selectedFile == record) ? 'selected':''\" draggable=\"true\" ng-click=\"selectFile(record)\"></div>\n    </div>\n  </div>\n  <div class=\"transfer-buttons\">\n      You can also download, and upload files by dragging files from, and to the desktop. &nbsp;&nbsp;&nbsp;&nbsp;\n      <a href=\"{{selectedFile.downloadurl}}\" download=\"{{selectedFile.filename}}\" ng-disabled=\"!selectedFile\" class=\"download btn\"> Download File </a>\n      <div class=\"upload btn\"> Upload File </div>\n  </div>\n    ",
        link: function (scope, element, attr) {
            scope.directoryContent = [];
            scope.selectedFile = null;
            scope.selectFile = function (file) {
                console.log(file);
                scope.selectedFile = (scope.selectedFile == file) ? null : file;
            };
            //scope.sails = sails
            function updateFileSystem() {
                router_1.default.fetch(router_1.routeTable.directoriesOfProject(utils_1.projectId)).onResponse(function (data) {
                    scope.directoryContent = data;
                    scope.$digest();
                });
            }
            element.dropzone({
                url: router_1.routeTable.uploadToProject(utils_1.projectId).url,
                maxFilesize: 100,
                maxThumbnailFilesize: 5,
                clickable: ".upload",
                error: function (file, errorMessage) {
                    console.log(errorMessage);
                },
                sending: function (file, xhr) {
                    xhr.setRequestHeader('X-CSRF-Token', csrf.csrf);
                },
                uploadprogress: function (file, progress) {
                    file.__notification.progress = ~~progress;
                    rootScope.$apply();
                },
                addedfile: function (file) {
                    console.log(file);
                    file.__notification = alerts.addNotification({ msg: 'Uploading ' + file.name });
                },
                success: function (file) {
                    file.__notification.msg = 'File "' + file.name + '" uploaded';
                    delete file.__notification.progress;
                    alerts.removeAfter(file.__notification, 5000);
                    rootScope.$apply();
                    updateFileSystem();
                }
            });
            updateFileSystem();
        }
    }); }]);

"use strict";
exports.pathArray = window["pathArray"] = window.location.pathname.split('/');
exports.projectId = window["projId"] = exports.pathArray[exports.pathArray.length - 1];

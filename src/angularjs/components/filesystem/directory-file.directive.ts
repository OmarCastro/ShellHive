import * as app from "../../app.module"
import { projectId } from "../../utils"
import { SocketService } from "../../socket.service"
import router from "../../router"

interface FileScope extends angular.IScope {
  record: any
}

app.directive("directoryfile", [() => ({
  scope: true,
  template: require("./directory-file.html"),
  link: function (scope: FileScope, element, attr) {
    console.log('linking dirfile');

    const contentType = 'application/octet-stream'
    const filename = scope.record.filename
    const origin = window.location.origin;
    const path = [origin, 'files', projectId, scope.record.name].join('/')
    const downloadurl = [contentType, filename, path].join(':');
    scope.record.downloadurl = ['/download', projectId, scope.record.name].join('/')


    //element.attr("href", path)
    element.attr("data-downloadurl", downloadurl)

    element[0].addEventListener("dragstart", function (event) {
      const dt = event.dataTransfer;
      dt.setData("text/uri-list", path);
      dt.setData("text/plain", filename);
      dt.setData("DownloadURL", downloadurl);
    }, false);

    element.dblclick(function (event) {
      window.open(path, '_blank');
    });
  }

})]);

import * as app from "../app.module"
import { projectId } from "../utils"
import {SocketService} from "../socket.service"
import router from "../router"

interface FileScope extends angular.IScope{
  record: any
}

app.directive("directoryfile", ['$document', function($document){
  return {
    scope: true,
    template: `
      <p class="icon-container text-center">
        <span class="icon glyphicon glyphicon-file"></span>
      </p>
      <p class="icon-label text-center" ng-bind="record.name"></p>`,
    link: function(scope:FileScope, element, attr){
      console.log('linking dirfile');

      var contentType = 'application/octet-stream'
      var filename = scope.record.filename
      var origin = window.location.origin;
      var path = [origin, 'files', projectId, scope.record.name].join('/')
      var downloadurl = [contentType,filename,path].join(':');
      scope.record.downloadurl = ['/download', projectId, scope.record.name].join('/')


      //element.attr("href", path)
      element.attr("data-downloadurl", downloadurl)

      element[0].addEventListener("dragstart",function(event){
        var dt = event.dataTransfer;
        dt.setData("text/uri-list", path);
        dt.setData("text/plain", filename);
        dt.setData("DownloadURL",downloadurl);
      },false);

      element.dblclick( function(event){
        window.open(path,'_blank');
      });  
    }
  };
}]);

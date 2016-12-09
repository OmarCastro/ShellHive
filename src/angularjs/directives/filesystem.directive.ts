import * as app from "../app.module"
import { projectId } from "../utils"
import {SocketService} from "../socket.service"
import network, { routeTable } from "../router"


interface FileSystemScope extends angular.IScope{
    directoryContent: any[]
    selectedFile: any;
    selectFile: (file: any) => void
}

app.directive("filesystem", ['csrf','alerts','$rootScope',(csrf, alerts, rootScope) => {
  return {
    scope: true,
    template: `
    <div class="container-fluid">
    <div class="row-fluid">
      <div ng-repeat="record in directoryContent" class="col-xs-4 col-sm-3 col-md-2" directoryfile
      ng-class="(selectedFile == record) ? 'selected':''" draggable="true" ng-click="selectFile(record)"></div>
    </div>
  </div>
  <div class="transfer-buttons">
      You can also download, and upload files by dragging files from, and to the desktop. &nbsp;&nbsp;&nbsp;&nbsp;
      <a href="{{selectedFile.downloadurl}}" download="{{selectedFile.filename}}" ng-disabled="!selectedFile" class="download btn"> Download File </a>
      <div class="upload btn"> Upload File </div>
  </div>
    `,
    link: function(scope: FileSystemScope, element, attr){
      scope.directoryContent = []
      scope.selectedFile = null
      scope.selectFile = function(file){
        console.log(file);
        scope.selectedFile = (scope.selectedFile == file) ? null : file;
      }
      //scope.sails = sails

      function updateFileSystem(){
        network.fetch(routeTable.directoriesOfProject(projectId)).onResponse(data => {
          scope.directoryContent = data
          scope.$digest();
        })
      }

      (<any>element).dropzone({ 
        url: routeTable.uploadToProject(projectId).url,
        maxFilesize: 100,
        maxThumbnailFilesize: 5,
        clickable: ".upload",
        error: function(file,errorMessage){
          console.log(errorMessage)
        },
        sending:function(file,xhr){
          xhr.setRequestHeader('X-CSRF-Token', csrf.csrf);
        },
        uploadprogress: function(file, progress){
          file.__notification.progress = ~~progress
          rootScope.$apply();
        },
        addedfile: function(file){
          console.log(file)
          file.__notification = alerts.addNotification({msg: 'Uploading ' + file.name})
        },
        success: function(file){
          file.__notification.msg = 'File "' + file.name + '" uploaded'
          delete file.__notification.progress
          alerts.removeAfter(file.__notification, 5000);
          rootScope.$apply();
          updateFileSystem();
        }
      });

      updateFileSystem();
    }
  };
}]);


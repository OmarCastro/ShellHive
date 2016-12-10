import * as app from "../app.module"
import { projectId } from "../utils"
import {SocketService} from "../socket.service"
import network, { routeTable } from "../router"

interface FileSystemScope extends angular.IScope{
    directoryContent: any[]
    selectedFile: any;
    selectFile: (file: any) => void
}

app.directive("filesystem", ['csrf','alerts','$rootScope',(csrf, alerts, rootScope) => ({
    scope: true,
    template: require("./filesystem.html"),
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
  })]);


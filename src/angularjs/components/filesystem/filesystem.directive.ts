import * as app from "../../app.module"
import { projectId } from "../../utils"
import {SocketService} from "../../socket.service"
import network, { routeTable } from "../../router"
import {CSRF}  from "../../services/csrf"
import notificationService, {ProgressNotification} from "../notification-area/notifications.service"
import {FileUploadManager} from "./file-upload-manager.service"
import dropzone = require("dropzone")

interface FileSystemScope extends angular.IScope{
    directoryContent: any[]
    selectedFile: any;
    selectFile: (file: any) => void
}

app.directive("filesystem", [() => ({ 
    scope: true,
    template: require("./filesystem.html"),
    link: function(scope: FileSystemScope, element: JQuery, attr){
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

      const uploadingFiles = new FileUploadManager()

      new dropzone(element[0],{ 
        url: routeTable.uploadToProject(projectId).url,
        maxFilesize: 100,
        maxThumbnailFilesize: 5,
        clickable: ".upload",
        error: function(file,errorMessage){
          console.log(errorMessage)
        },
        sending:function(file,xhr){
          xhr.setRequestHeader('X-CSRF-Token', CSRF.csrfToken);
        },
        uploadprogress: function(file, progress){
          uploadingFiles.notificationOf(file).map(_ => _.progress = ~~progress)
          scope.$applyAsync()
        },
        addedfile: function(file){
          console.log(file)
          uploadingFiles.pushFile(file)
        },
        success: function(file){
          uploadingFiles.notificationOf(file).map(_ => {
            _.msg = 'File "' + file.name + '" uploaded';
            _.progress = null
            notificationService.closeNotificationOnTimeout(_, 5000).then(()=>scope.$applyAsync());
          })
          uploadingFiles.pullFile(file);
          scope.$applyAsync()
          updateFileSystem();
        }
      });
      updateFileSystem();
    }
})]);


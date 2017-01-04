import * as app from "../../app.module"
import { projectId } from "../../utils"
import {SocketService} from "../../socket.service"
import network, { routeTable } from "../../router"
import {CSRF}  from "../../services/csrf"
import {IAlertService, AlertMsg}  from "../../services/alerts"
import dropzone = require("dropzone")

interface FileSystemScope extends angular.IScope{
    directoryContent: any[]
    selectedFile: any;
    selectFile: (file: any) => void
}

interface UploadingFile {
  file: Dropzone.DropzoneFile
  notification: AlertMsg
}



app.directive("filesystem", ['alerts','$rootScope',(alerts: IAlertService, rootScope) => { 
  
  class FileUploadManager {
    private files = [] as UploadingFile[]
    notificationOf(file: Dropzone.DropzoneFile){
      for(const fileUpload of this.files){
        if(fileUpload.file === file) return [fileUpload.notification];
      }
      return [];
    }
    
    pushFile(file: Dropzone.DropzoneFile){
      this.files.push({
            file, 
            notification: alerts.addNotification({msg: 'Uploading ' + file.name})
        })
    }

    pullFile(file: Dropzone.DropzoneFile){
      this.files = this.files.reduce((result, fileUpload) => {
        if(fileUpload.file !== file){ result.push(fileUpload); }
        return result;
      }, [])
    }
}
  
  
  return {
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
          rootScope.$apply();
        },
        addedfile: function(file){
          console.log(file)
          uploadingFiles.pushFile(file)
        },
        success: function(file){
          uploadingFiles.notificationOf(file).map(_ => {
            _.msg = 'File "' + file.name + '" uploaded';
            _.progress = null
            alerts.removeAfter(_, 5000);
          })
          uploadingFiles.pullFile(file);
          rootScope.$apply();
          updateFileSystem();
        }
      });

      updateFileSystem();
    }
}}]);


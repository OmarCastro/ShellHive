app.directive("filesystem", ['csrf','alerts','$rootScope',function(csrf, alerts, rootScope){
  return {
    scope: true,
    link: function(scope, element, attr){
      scope.directoryContent = []
      scope.selectedFile = null
      scope.selectFile = function(file){
        console.log(file);
        scope.selectedFile = (scope.selectedFile == file) ? null : file;
      }
      //scope.sails = sails

      function updateFileSystem(){
        io.socket.get("/directories/project/"+projId, function(data){
          scope.directoryContent = data
          scope.$digest();
        });
      }

      element.dropzone({ 
        url: "/upload/"+projId,
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


app.directive("filesystem", ['csrf',function(csrf){
  return {
    scope: true,
    link: function(scope, element, attr){
      scope.directoryContent = []
      //scope.sails = sails

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
        }
      });

      io.socket.get("/directories/project/"+projId, function(data){
        scope.directoryContent = data
        scope.$apply();
      });
    }
  };
}]);


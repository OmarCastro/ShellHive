app.directive("filesystem", function(){
  return {
    scope: true,
    link: function(scope, element, attr){
      scope.directoryContent = []
      //scope.sails = sails

      element.dropzone({ 
        url: "/upload",
        maxFilesize: 100,
        paramName: "uploadfile",
        maxThumbnailFilesize: 5
      });

      io.socket.get("/directories/project/"+projId, function(data){
        scope.directoryContent = data
        scope.$apply();
      });
    }
  };
});


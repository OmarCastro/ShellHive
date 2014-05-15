
var viewGraph;

app.controller('directoryCtrl', ['$scope', function(scope){
  scope.directoryContent = []
  //scope.sails = sails

    io.socket.get("/directories/project/"+projId, function(data){
      scope.directoryContent = data
      scope.$apply();
    });

  //sails.get("/directories/project/"+projId)
  //.success(function(data){
  //	console.log(data);
  //  scope.directoryContent = data
  //}).error(function(data){
  //  console.error(data);
  //  scope.directoryContent = [{name:data}]
  //})
}]);
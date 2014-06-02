app.directive("directoryfile", ['$document', function($document){
  return {
    scope: true,
    link: function(scope, element, attr){
      console.log('linking dirfile');

      var contentType = 'application/octet-stream'
      var filename = scope.record.filename
      var origin = window.location.origin;
      var path = [origin, 'files', projId, scope.record.name].join('/')
      var downloadurl = [contentType,filename,path].join(':');
      scope.record.downloadurl = ['/download', projId, scope.record.name].join('/')


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

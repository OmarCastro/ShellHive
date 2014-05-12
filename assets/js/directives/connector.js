app.directive("connector", function($document){
  return {
    scope: true,
    link: function(scope, element, attr){
      var StartPortOffset, EndPortOffset;
      
      var dataedge = scope.$parent.edge;
      var elem = element[0];
      var $graphElement = element.closest('[graph-model]');
      var graphElement = $graphElement[0];
      
      
      var startComponent = dataedge.startComponent;
      var startPosition = startComponent.position;
      var endComponent = dataedge.endComponent;
      var endPosition = endComponent.position;
      scope.endsPositions = [startPosition,endPosition]
      
       function update(){
         console.log('updating edge')
          setEdgePath(startPosition.x + StartPortOffset.left, 
                      startPosition.y + StartPortOffset.top,
                      endPosition.x + EndPortOffset.left,
                      endPosition.y + EndPortOffset.top);
      };
      
      
      

      var setEdgePath = function(iniX, iniY, endX, endY){
        var xpoint;
        xpoint = (endX - iniX) / 4;
        elem.setAttribute(
          'd', "M " + iniX + " " + iniY 
            + " H " + (iniX + 0.5 * xpoint) 
            + " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY
            + " H " + endX);
      };
     
      scope.update = update;
      
      scope.reset = function(){
        var Startnode = graphElement.querySelector(".nodes .component[data-node-id='" + dataedge.startNode + "']");
        var StartPort = Startnode.querySelector(".box[data-port='" + dataedge.startPort + "']");
        var Endnode = graphElement.querySelector(".nodes .component[data-node-id='" + dataedge.endNode + "']");
        var EndPort = Endnode.querySelector(".box[data-port='" + dataedge.endPort + "']");
        StartPortOffset = {
          top: StartPort.offsetTop + StartPort.offsetHeight * 0.75,
          left: StartPort.offsetLeft
        };
        EndPortOffset = {
          top: EndPort.offsetTop + EndPort.offsetHeight * 0.75,
          left: EndPort.offsetLeft
        };
        update();
      };
      requestAnimationFrame(function(){
        scope.$watch('edge.endPort', scope.reset);
        //scope.$watch('endsPositions',scope.update,true)
        requestAnimationFrame(scope.reset)
      });
    }
  };
});

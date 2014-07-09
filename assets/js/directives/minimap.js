app.directive("minimap", function(){
  return {
    scope: true,
    require: '^graph',
    link: function(scope, element, attr, graphController){
      var $graphElement = scope.graphElement;
      var workspace = $graphElement[0].querySelector(".workspace");
      var elem = element[0];
      var boundary = {x1:0,y1:0,x2:0,y2:0};
      var graphX = 0
      var graphY = 0

      scope.scale = 1;
      var viewbox =  element.find(".viewbox");

      var mapSize = 150;
      scope.mapSize = mapSize;
      var margin = 200 //margin to view all nodes

      scope.updateViewport = function(viewport){
        scope.viewport = viewport;
        var scale = scope.scale;
        viewbox.css({
          transform: "translate("+(-viewport.x1)+"px, "+(-viewport.y1)+"px)",
          width: (viewport.x2-viewport.x1),
          height: (viewport.y2-viewport.y1),
          borderWidth: 1/scale+"px"
        })
      }
      requestAnimationFrame(function(){
        scope.updateViewport({x1:0,y1:0,x2:workspace.offsetWidth,y2:workspace.offsetHeight})
      });
        mapMouseToScene = function(event){
          var ref$, x, y;
          ref$ = mapMouseToView(event), x = ref$.x, y = ref$.y;
          return mapPointToScene(x, y);
        };
        mapMouseToView = function(event){
          var offset;
          offset = element.offset();
          return {
            x: Math.round(event.pageX - offset.left),
            y: Math.round(event.pageY - offset.top)
          };
        };

        mapPointToScene = function(x, y){
          var scale = scope.scale;
          return {
            x: (x/ scale - graphX) ,
            y: (y/ scale - graphY)
          };
        };

        function pointerEvent(ev){
          var event = ev.originalEvent
          var viewport = scope.viewport;
          var point = mapMouseToScene(event)
          var width = (viewport.x2 -viewport.x1)
          var height = (viewport.y2 -viewport.y1)
          var midX = width/2;
          var midY = height/2;
          
          var newX = (point.x - midX)
          var newY = (point.y - midY)
          

          //console.log(point, {x: midX, y:midY, w:width, h:height} , {newX: newX, newY:newY});

          graphController.moveScene(-newX,-newY);
          event.preventDefault();
          event.stopPropagation();
        }

        element.bind("pointerdown", function(ev){ pointerEvent(ev); element.bind("pointermove", pointerEvent); });
        element.bind("pointerup", function(ev){element.unbind("pointermove", pointerEvent);});

        var MouseWheelHandler = function(event){
          event.preventDefault();
          event.stopPropagation();
        };
        mousewheelevt = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";
        elem.addEventListener(mousewheelevt, MouseWheelHandler, false);

      scope.boundaries = function(){
        var components = scope.visualData.components;
        if(!components || components.length == 0) return;
        var firstComponentPosition = components[0].position
        var minX = firstComponentPosition.x;
        var minY = firstComponentPosition.y;
        var maxX = firstComponentPosition.x;
        var maxY = firstComponentPosition.y;
        components.forEach(function(component){
          var position = component.position;
          if(minX > position.x){ minX = position.x; }
          if(minY > position.y){ minY = position.y; }
          if(maxX < position.x){ maxX = position.x; }
          if(maxY < position.y){ maxY = position.y; }
        });

        boundary.x1 = minX
        boundary.x2 = maxX
        boundary.y1 = minY
        boundary.y2 = maxY

        return boundary
      }

      scope.$watch('boundaries()', function(newValue, oldValue){
        
        var width = boundary.x2 + margin - boundary.x1 + margin*2
        var height= boundary.y2 + margin - boundary.y1 + margin*2
        var wScale = mapSize / width
        var hScale = mapSize / height
        var scale = Math.min(wScale, hScale);
        scope.scale = scale
        graphX = -boundary.x1 + margin
        graphY = -boundary.y1 + margin
        scope.transform = "scale("+ scale +") translate("+ graphX + "px, "+ graphY +"px)";
        viewbox.css({
          borderWidth: 1/scale+"px"
        })
      }, true);
    }
  };
});


app.directive("minicomponent", function(){
  return {
    scope: true,
    link: function(scope, element, attr){
      var datanode = scope.data;
      var $graphElement = scope.graphElement;
      var graphElement = $graphElement[0];

      scope.offsetWidth = 100
      scope.offsetHeight = 100

      var update = function(){
        var elem = graphElement.querySelector(".nodes .component[data-node-id='" + datanode.id + "']");
        scope.offsetWidth = (elem) ? elem.offsetWidth:100
        scope.offsetHeight = (elem) ? elem.offsetHeight:100
        scope.$digest();
      }

      if(datanode.files !== null){
        scope.$watch("data.files.length",function(){
          requestAnimationFrame(update);
        })
      }

      scope.$watch("data",function(){
        requestAnimationFrame(update);
      })
      requestAnimationFrame(update);
    }
  }
});

app.directive("miniconnector", function(){
  return {
    scope: true,
    link: function(scope, element, attr){

      var dataedge = scope.$parent.edge;
      var elem = element[0];
      
      
      var startComponent = dataedge.startComponent;
      var startPosition = startComponent.position;
      var endComponent = dataedge.endComponent;
      var endPosition = endComponent.position;
      scope.endPos = endPosition
      scope.startPos = startPosition

      function updateEdge(){
        var iniX = startPosition.x + 50
        var iniY = startPosition.y + 50
        var endX = endPosition.x + 50
        var endY = endPosition.y + 50
        var xpoint = (endX - iniX) / 4;

        elem.setAttribute(
          'd', "M " + iniX + " " + iniY 
            + " H " + (iniX + 0.5 * xpoint) 
            + " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY
            + " H " + endX);
      }

      var elementClass = "from-"+startComponent.type;
      elem.classList.add(elementClass);
      elem.classList.add(elementClass+"-"+dataedge.startPort);
      scope.$watch("endPos",updateEdge, true);
      scope.$watch("startPos",updateEdge, true);
      
    }
  };
});


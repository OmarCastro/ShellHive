app.directive("component", function($document){
  var pointerId;
  pointerId = 0;
  return {
    require: '^graph',
    scope: true,
    link: function(scope, element, attr, graphModelController){
      var datanode, startX, startY, title, position, elem, imstyle, mousemove, moveBy, mouseup;
      datanode = scope.data;
      startX = 0;
      startY = 0;
      title = datanode.title;
      position = datanode.position;
      scope.collapsed = false;
      scope.togglecollapse = function(){
        scope.collapsed = !scope.collapsed;
        updatePorts();
        requestAnimationFrame(function(){
           $('path[connector]').each(function(index){
              var scope = $(this).scope();
              if(scope.endsPositions && scope.endsPositions[0] == position || scope.endsPositions[1] == position){
                scope.reset();
              }
            })
         });
      };
      scope.update = function(){
        scope.transform = "translate(" + position.x + "px, " + position.y + "px)"; 
      }



      function existConnectionToPort(port){
        return !scope.graphData.connections.every(function(connection){
          return (connection.startNode != datanode.id || connection.startPort != port.name) 
          && (connection.endNode != datanode.id || connection.endPort != port.name) 
        })
      }

    switch(datanode.type){
    case 'file':
      scope.title = {
        name: "file"
      }
      break;
    case 'command':
      scope.title = {
        name: datanode.exec
      }
      break;
    case 'macro':
      var macros = scope.graphData.macros;
      scope.graphData.macroList.every(function(macroName){
        var macro = macros[macroName];
        if(macro.id == datanode.graph){
          scope.title = {
            name: macro.name,
            description: macro.description
          }
          return false;
        }
        return true;
      })
      break;
    }

    scope.updatePorts = updatePorts;
     function updatePorts (){
                  console.log("updatePorts")

        scope.inputPorts = [];
        scope.outputPorts = [];
          switch(datanode.type){
            case 'file':
              scope.inputPorts = [{name: "input", text:"overwrite"},{name: "append", text:"append"}]
              scope.outputPorts = [{name: "output", text:"content"}]
              break;
            case 'command':
            case 'macro':
              scope.inputPorts = [{name: "input", text:"stdin"}]
              scope.outputPorts = [{name: "output", text:"stdout"}
                            ,{name: "error", text:"stderr"}
                            ,{name: "retcode", text:"return"}]
              break;
            default:
              scope.inputPorts = [];
              scope.outputPorts = [];
          }
        if(scope.collapsed){
          console.log("collapsed")
          scope.inputPorts = scope.inputPorts.filter(existConnectionToPort)
          scope.outputPorts = scope.outputPorts.filter(existConnectionToPort)
        }
      }




      updatePorts();

      scope.update();
      elem = element[0];
      imstyle = elem.style;
      //scope.$watch('data.position',scope.update, true);
      var drag = false;
      element.bind("pointerdown", function(ev){
        var event, targetTag, pointerId, x$;
        //console.log(datanode);
        switch (ev.which) {
        case 2:
          return true;
        case 3:
          return false;
        }
        graphModelController.hidePopupAndEdge();
        event = ev.originalEvent;
        targetTag = event.target.tagName;
        console.log(targetTag);
        if (pointerId || in$(targetTag, 'INPUT SELECT LABEL BUTTON A TEXTAREA'.split(" "))) {
          return true;
        }
        var drag = false;
        pointerId = event.pointerId;
        x$ = $document;
        x$.bind("pointermove", mousemove);
        x$.bind("pointerup", mouseup);
        startX = event.screenX;
        startY = event.screenY;
        
        
        return false;
      });
      mousemove = function(ev){
        var event;
        event = ev.originalEvent;
        moveBy(event.screenX - startX, event.screenY - startY);
        startX = event.screenX;
        startY = event.screenY;
      };
      moveBy = function(x, y){
        drag = true;
        graphModelController.translateNode(datanode.id, position, x, y);
        printget({type: 'move', componentId:scope.data.id, movepos: position});
        scope.update();
         $('path[connector]').each(function(index){
              var scope = $(this).scope();
              if(scope.endsPositions && scope.endsPositions[0] == position || scope.endsPositions[1] == position){
                scope.update();
              }
            })
        
        //
        //socket.get('/users/3',function serverSays(err,users){
        //    if (err)
        //        console.log(err)
        //    console.log(JSON.stringify(users));
        //});
        
      };
      mouseup = function(ev){
        var pointerId, x$;
        pointerId = 0;
        var doc = $document;
        doc.unbind("pointermove", mousemove);
        doc.unbind("pointerup", mouseup);
        if(drag){
          scope.$emit('updateComponent',datanode);
          drag = false;
          ev.preventDefault();
          return false;
        }
      };
    }
  };
});
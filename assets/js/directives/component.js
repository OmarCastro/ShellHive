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
      
      scope.update = function(){
        scope.transform = "translate(" + position.x + "px, " + position.y + "px)"; 
      }
      
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
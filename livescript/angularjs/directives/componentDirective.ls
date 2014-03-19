
app.directive "connector", ($document) ->
    scope:true
    link: (scope, element, attr) !->
      var StartPortOffset, EndPortOffset, 
        startPosition, endPosition,
        startComponent, endComponent
      
      dataedge = scope.$parent.edge
      elem = element[0]
      $graphElement = element.closest('[graph-model]')
      resultScope = $graphElement.scope()
      graphElement = $graphElement[0]

      for component in resultScope.visualData.components when component.id == dataedge.startNode
          startComponent := component
          startPosition  := component.position
          break

      for component in resultScope.visualData.components when component.id == dataedge.endNode
          endComponent := component
          endPosition  := component.position
          break

      setEdgePath = (iniX,iniY,endX,endY) ->
        xpoint = (endX - iniX)/4
        elem.setAttribute \d,"M #iniX #iniY H #{iniX+0.5*xpoint} C #{iniX+2*xpoint},#iniY #{iniX+xpoint*2},#endY #{iniX+xpoint*4},#endY H #endX"

      update = ->
        setEdgePath(
          startPosition.x+StartPortOffset.left,
          startPosition.y+StartPortOffset.top,
          endPosition.x+EndPortOffset.left,
          endPosition.y+EndPortOffset.top
        )
      scope.update = update
      scope.updateWithId = (id) !-> update! if dataedge.startNode == id or dataedge.endNode == id
      scope.reset = ->
        Startnode = graphElement.querySelector(".nodes .component[data-node-id='#{dataedge.startNode}']")
        StartPort = Startnode.querySelector(".box[data-port='#{dataedge.startPort}']")
        Endnode = graphElement.querySelector(".nodes .component[data-node-id='#{dataedge.endNode}']")
        EndPort = Endnode.querySelector(".box[data-port='#{dataedge.endPort}']")

        StartPortOffset := {
            top: StartPort.offsetTop + StartPort.offsetHeight*0.75,
            left: StartPort.offsetLeft
        }
        EndPortOffset := {
            top: EndPort.offsetTop + EndPort.offsetHeight*0.75,
            left: EndPort.offsetLeft 
        }
        update!
      requestAnimationFrame ->  
        scope.$watch 'edge.endPort', -> scope.reset!
        scope.reset!


#comp

app.directive "component", ($document) ->
    pointerId = 0
    require: '^graphModel'    
    scope:true
    link: (scope, element, attr,graphModelController) !->
      scope.transform = cssTransform.replace(/[A-Z]/g,(v)->"-#{v.toLowerCase()}")
      datanode = scope.$parent.data
      startX = 0
      startY = 0
      title = datanode.title
      position = datanode.position
      elem = element[0];
      imstyle = elem.style
      #timestamp = 0

      element.bind "pointerdown", (ev) !->
        console.log datanode
        switch ev.which
        | 2 => return true
        | 3 => return false
        #timestamp := Date.now!
        graphModelController.hidePopupAndEdge!
        event = ev.originalEvent
        targetTag = event.target.tagName
        return true if pointerId 
               or targetTag in <[INPUT SELECT LABEL BUTTON A]>
        pointerId = event.pointerId
        $document
          ..bind "pointermove", mousemove
          ..bind "pointerup", mouseup
        startX := event.screenX
        startY := event.screenY
        return false
      mousemove = (ev) !->
        event = ev.originalEvent
        moveBy event.screenX - startX,event.screenY - startY
        startX := event.screenX
        startY := event.screenY
      moveBy = (x, y) !-> 
        graphModelController.translateNode(datanode.id,position,x,y)
        scope.$digest!
      mouseup = ->
        #console.log "#{Date.now!} - #timestamp = " Date.now! - timestamp
        #if datanode.type is \subgraph and Date.now! - timestamp < 300
        #  graphModelController.setGraphView(datanode.macro)
        pointerId = 0
        $document
          ..unbind "pointermove", mousemove
          ..unbind "pointerup", mouseup


##port


app.directive "port", ($document) ->
  require: '^graphModel'
  scope: true
  link: (scope, element, attr, graphModelController) !->
    datanode = scope.$parent.data
    title    = datanode.title
    position = datanode.position
    elem     = element[0];
    imstyle  = elem.style
    scope.componentId = datanode.id
    scope.isOutputNode = attr.port in <[output error retcode]>      
    element.bind "pointerdown", (ev) !->
      console.log ev
      event = ev.originalEvent
      graphModelController.startEdge elem,position,event
      $document
        ..bind "pointermove", mousemove
        ..bind "pointerup", mouseup
      return false

    ConnectIfOk = (startNode,startPort,endNode,endPort) !->
      visualData  = graphModelController.getVisualData!
      isOk = true
      for x in visualData.connections 
      when (x.startNode == endNode and x.endNode == startNode)
      or (x.startNode == startNode and x.endNode == endNode)
        isOk = false
        break
      if isOk
        visualData.connections.push {startNode, startPort, endNode, endPort}
        graphModelController.updateScope!  

    mousemove = (ev) !-> graphModelController.moveEdge ev.originalEvent      
    mouseup = (ev) !->
      event       = ev.originalEvent
      pointedElem = document.elementFromPoint event.clientX,event.clientY
      $pointedElem = $(pointedElem)

      if graphModelController.isFreeSpace pointedElem
        if attr.port in <[output error retcode]>
          graphModelController.showPopup event, scope.componentId, attr.port, null, \input
        else
          graphModelController.showPopup event, null, \output, scope.componentId, attr.port
      else
        graphModelController.endEdge!
        outAttr = $pointedElem.attr "data-port"        
        if outAttr
          outPortScope = $pointedElem.scope!
          if scope.isOutputNode != outPortScope.isOutputNode
            if scope.isOutputNode
              ConnectIfOk(scope.componentId,attr.port,outPortScope.componentId,outAttr)
            else
              ConnectIfOk(outPortScope.componentId,outAttr,scope.componentId,attr.port)
      $document
        ..unbind "pointermove", mousemove
        ..unbind "pointerup", mouseup

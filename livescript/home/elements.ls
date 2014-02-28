graph = document.querySelector \div.graph
nodes = document.querySelector \div.nodes
edges = document.querySelector \svg.edges

pointers = {}
graph-data = null;

/**
  gets the first supported proprieties in CSS
  used to resolve prefixes

  @param {Array.<string>} proparray - a list of arrays
  @return{string} the supported proprierty
*/
function get-CSS-supported-prop(proparray)
    root=document.documentElement
    for i in proparray
        if i of root.style
            return i 

cssTransform = get-CSS-supported-prop <[transform WebkitTransform MozTransform]>
socket = io.connect!


socket.on \nodePosChanged (data) !->
  requestAnimationFrame ->
    graph-data.nodes[data.id].api.moveTo data.x,data.y




app = angular.module("drag", [])
app.controller "Controller", ($scope)!->
  $scope.dataNodes = []
  $scope.dataEdges = []
  socket.on \flowData, (data) !->
    graph-data := data
    for k,v of data.nodes
      continue if k is "maxid"        
      v.edges = []
      $scope.dataNodes.push(v)
    for k,v of data.edges
      continue if k is "maxid"
      $scope.dataEdges.push(v)

    $scope.$apply!

  socket.emit \graph-user ""


app
  ..directive "component", ($document) ->
    pointerId = 0
    scope:true
    link: (scope, element, attr) !->
      datanode = scope.$parent.node
      startX = 0
      startY = 0
      title = datanode.title
      x = datanode.x
      y = datanode.y
      elem = element[0];
      imstyle = elem.style
      element.bind "pointerdown", (event) !->
        targetTag = event.target.tagName
        return if pointerId || targetTag in <[INPUT SELECT LABEL]>
        pointerId = event.pointerId
        $document
          ..bind "pointermove", mousemove
          ..bind "pointerup", mouseup
        startX := event.screenX - x
        startY := event.screenY - y
        event.preventDefault!
        event.stopPropagation!
      mousemove = (event) !->
        moveTo event.screenX - startX,event.screenY - startY
        socket.emit \nodePosChanged {id: datanode.id, x, y};
      moveTo = (newX, newY) !-> 
          x := newX
          y := newY
          updatePos!
      updatePos = !->
        tr = "translate(#{x}px, #{y}px)"
        imstyle[cssTransform] = tr
        for edge in datanode.edges
            edge.api.updateEdge!

      mouseup = ->
        pointerId = 0
        $document
          ..unbind "pointermove", mousemove
          ..unbind "pointerup", mouseup
      
      rect = elem.getBoundingClientRect!
      elem.style.minWidth = "#{rect.width}px"
      inputelem = elem.querySelector("div.input .box")
      input = inputelem.getBoundingClientRect!
      outputelem = elem.querySelector("div.output .box")
      output = outputelem.getBoundingClientRect!
      inputX = input.left + input.width/2 - rect.left
      inputY = input.top + input.height/2 - rect.top
      outputX = output.left + output.width/2 - rect.left
      outputY = output.top + output.height/2 - rect.top
      datanode.api = 
        inputPos : -> 

          {x: x + inputX,   y: y + inputY  }
        outputPos: -> {x: x + outputX, y: y + outputY}
        pos: -> {x,y}
        size:{width:rect.width,height:rect.height}
        getbbox: -> elem.firstChild.getBoundingClientRect!
        moveTo: moveTo
      updatePos!
    restrict: 'C'

  ..directive "connector", ($document) ->
    scope:true
    link: (scope, element, attr) !->
      dataedge = scope.$parent.edge
      startNode = graph-data.nodes[dataedge.start]
      endNode = graph-data.nodes[dataedge.end]
      startNode.edges.push dataedge
      endNode.edges.push dataedge
      elem = element[0]
      setEdgePath = (iniX,iniY,endX,endY) ->
        xpoint = (endX - iniX)/4
        elem.setAttribute \d,"M #iniX #iniY C #{iniX+xpoint},#iniY #{iniX+xpoint*3},#endY #endX,#endY"
      updateEdge = ->
        startNodePos = startNode.api.outputPos!
        endNodePos = endNode.api.inputPos!
        setEdgePath startNodePos.x,startNodePos.y,endNodePos.x,endNodePos.y
      dataedge.api = {updateEdge}
      elem.addEventListener \pointerdown, !-> 
        elem.classList.toggle \sel
        if elem.classList.contains \sel
          socket.emit \run-app {id:1}
      updateEdge!



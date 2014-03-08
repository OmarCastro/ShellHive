

##graphModel
 
app.directive "graphModel", ($document) ->
  restrict: 'A'
  replace: false
  scope:
    visualData: '=graphModel'
    options: '='
  controller:['$scope', '$element', '$attrs', (scope, element, attr) !->
    pointerId = 0
    
    #graph transformations
    scale = 1
    graphX = 0
    graphY = 0

    #mouse event helper
    startX = 0
    startY = 0

    #edge creation helper
    edgeIniX = 0
    edgeIniY = 0

    elem = element[0];

    scope
      ..implementedCommands = listOfImplementedCommands
      ..isImplemented = isImplemented
      ..isArray = angular.isArray
      ..isString = angular.isString
      ..swapPrevious = (array,index,id) ->
        return if index == 0;
        [array[index],array[index-1]] = [array[index-1],array[index]]
        for connection in scope.visualData.connections
        when connection.endNode == id 
          if connection.endPort == "file#index"
            connection.endPort = "file#{index-1}"
          else if connection.endPort == "file#{index-1}"
            connection.endPort = "file#index"

    elem.style[cssTransform] = "translate3d(0,0,0)"
    nodesElem = elem.querySelector(".nodes")
    edgesElem = elem.querySelector(".edges")
    svgElem = elem.querySelector("svg")

    $svgElem = $(svgElem)
    nodesElemStyle = nodesElem.style
    edgesElemStyle = edgesElem.style
    update = ->
      transform = "translate(#{graphX}px, #{graphY}px) scale(#{scale})"
      nodesElemStyle[cssTransform] = transform
      edgesElemStyle[cssTransform] = transform

    update!
    mousemove = (ev) !->
      event = ev.originalEvent
      graphX += event.screenX - startX
      graphY += event.screenY - startY
      startX := event.screenX
      startY := event.screenY
      update!
    mouseup = ->
      pointerId := 0
      $document
        ..unbind "pointermove", mousemove
        ..unbind "pointerup", mouseup

    element.bind "pointerdown", (ev) !->
      event = ev.originalEvent
      targetTag = event.target.tagName
      return if pointerId || targetTag in <[INPUT SELECT LABEL]>
      pointerId := event.pointerId
      $document
        ..bind "pointermove", mousemove
        ..bind "pointerup", mouseup
      startX := event.screenX
      startY := event.screenY
      event.preventDefault!
      event.stopPropagation!

    mapMouseToScene = (event) ->
      {x,y} = mapMouseToView event
      mapPointToScene x,y

    mapMouseToView = (event) !->
      offset = $svgElem.offset!
      return {
        x: event.pageX - offset.left
        y: event.pageY - offset.top
      }

    mapPointToScene = (x,y)->
      x: (x - graphX)/scale
      y: (y - graphY)/scale

    scaleFromMouse = (amount, event) !->
      return if (scale < 0.2 && amount < 1) || (scale > 20 && amount > 1)
      {x,y} = mapMouseToView event
      relpointX = x - graphX
      relpointY = y - graphY
      graphX += Math.round( -relpointX * amount + relpointX )
      graphY += Math.round( -relpointY * amount + relpointY )
      scale *= amount
      update!

    MouseWheelHandler = (event)->
      return if not event.altKey
      event.preventDefault!
      event.stopPropagation!
      if (event.wheelDelta or -event.detail) > 0
        scaleFromMouse 1.1, event
      else
        scaleFromMouse 0.9, event
    mousewheelevt = if /Firefox/i.test(navigator.userAgent) then "DOMMouseScroll" else "mousewheel"
    elem.addEventListener(mousewheelevt, MouseWheelHandler, false);
    simpleEdge = element.find('.emptyEdge')[0]

    setEdgePath = (iniX,iniY,endX,endY) ->
        xpoint = (endX - iniX)/4
        simpleEdge.setAttribute \d , "M #iniX #iniY H #{iniX+0.5*xpoint} C #{iniX+2*xpoint},#iniY #{iniX+xpoint*2},#endY #{iniX+xpoint*4},#endY H #endX"

    this
      ..startEdge = (elem,position,ev) ->
        edgeIniX := elem.offsetLeft + position.x
        edgeIniY := elem.offsetTop + elem.offsetHeight*0.75 + position.y
        setEdgePath edgeIniX,edgeIniY,edgeIniX,edgeIniY
      ..moveEdge = (event) ->
        {x,y} = mapMouseToScene event
        console.log x,y
        setEdgePath edgeIniX,edgeIniY,x,y
      ..endEdge = ->
        simpleEdge.setAttribute \d, "M 0 0"
      ..updateScope = -> scope.$digest!
      ..getVisualData = -> scope.visualData
      ..mapPointToScene = mapPointToScene
      ..mapMouseToScene = mapMouseToScene
      ..mapMouseToView = mapMouseToView
      ..translateNode = (id,position,x,y) !->
        position.x += x/scale
        position.y += y/scale
        for el in edgesElem.querySelectorAll("[connector]")
          $(el).scope().updateWithId(id)
  ]



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
        console.log \mi
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

      element.bind "pointerdown", (ev) !->
        event = ev.originalEvent
        targetTag = event.target.tagName
        return if pointerId || targetTag in <[INPUT SELECT LABEL]>
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

    mousemove = (ev) !->
      event = ev.originalEvent
      graphModelController.moveEdge event      
    mouseup = (ev) !->
      graphModelController.endEdge!
      event       = ev.originalEvent
      pointedElem = $(document.elementFromPoint event.clientX,event.clientY)
      outAttr     = pointedElem.attr "data-port"        
      if outAttr
        outPortScope = pointedElem.scope!
        if scope.isOutputNode != outPortScope.isOutputNode
          if scope.isOutputNode
            ConnectIfOk(scope.componentId,attr.port,outPortScope.componentId,outAttr)
          else
            ConnectIfOk(outPortScope.componentId,outAttr,scope.componentId,attr.port)
      $document
        ..unbind "pointermove", mousemove
        ..unbind "pointerup", mouseup



##sidebar

app.directive 'sidebar', ['$document', ($document) ->
  replace: false
  scope: {} #isolate it
  require: '^graphModel'
  controller: ($scope, $element, $attrs) ->
    $scope.implementedCommands = shellParser.implementedCommands

  link:(scope, element, attr,graphModelCtrl) !->
    requestAnimationFrame ->
      element.find('li').each (index) ->
        $ this .bind 'click', (ev)-> 
          ev.stopPropagation!
          newResult = shellParser.parseCommand $(this).attr(\data-command)
          newComponent = newResult.components[0]
            ..id = graphModelCtrl.getVisualData!.components.length
            ..position = graphModelCtrl.mapPointToScene 0,0
          graphModelCtrl.getVisualData!.components.push newComponent
          console.log graphModelCtrl.getVisualData!.components
          graphModelCtrl.updateScope!
  template:
    """
      <ul>
        <li data-command="{{command}}" ng-repeat="command in implementedCommands">
            <span ng-bind="command"></span>
        </li>
      </ul>
    """
]




activeDrop = null;






##dropdownSelect

app.directive('dropdownSelect', ['$document', ($document) ->
  restrict: 'A'
  replace: true
  scope:
      dropdownSelect: '='
      dropdownModel: '='
      dropdownOnchange: '&'

  controller: ['$scope', '$element', '$attrs', ($scope, $element, $attrs) ->
      this.select = (selected) !->
          $scope.dropdownModel = selected
          $scope.dropdownOnchange({ selected: selected })
      body = $document.find("body")
      body.bind("click", !->
          $element.removeClass('active')
          activeDrop := null
      )
      $element.bind('click', (event) !->
          event.stopPropagation()
          if activeDrop && activeDrop != $element
            activeDrop.removeClass('active')
            activeDrop := null
          $element.toggleClass('active')
          activeDrop := $element
      )

      return
  ]

  template:
      """
      <div class='wrap-dd-select'>
          <span class='selected'>{{dropdownModel}}</span>
          <ul class='dropdown'>
              <li ng-repeat='item in dropdownSelect'
                  class='dropdown-item'
                  dropdown-select-item='item'>
              </li>
          </ul>
      </div>
      """
])

app.directive('dropdownSelectItem', [ ->
    return {
        require: '^dropdownSelect'
        replace: true
        scope:
            dropdownSelectItem: '='

        link: (scope, element, attrs, dropdownSelectCtrl) !->
            scope.selectItem = !->
                dropdownSelectCtrl.select scope.dropdownSelectItem

        template: """
            <li>
                <a href='' class='dropdown-item'
                    ng-click='selectItem()'>
                    {{dropdownSelectItem}}
                </a>
            </li>"""
    }

])
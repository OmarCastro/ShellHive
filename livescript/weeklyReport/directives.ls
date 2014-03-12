

##graphModel
 
app.directive "graphModel", ($document) ->
  restrict: 'A'
  replace: false
  scope:
    graphModel: '='
    options: '='
  controller:['$scope', '$element','$modal', '$attrs', (scope, element, $modal, attr) !->
    #console.log scope.options
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
    graphModel = scope.graphModel
    graphModel.macros = {}
    scope
      ..popupText = ''
      ..graph = this
      ..$watch "graphModel", ->
        #console.log "ni"
        scope.visualData = scope.graphModel;
      ..visualData = scope.graphModel;
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

    popup = elem.querySelector("div[popup]")
    $popup = $(popup)
    popupHeight = $popup.height!
    $popup.hide!
    $popupInput = $popup.find("input");

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
      return false if ev.which == 3
      hidePopupAndEdge!
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
    newComponent = (content, position)->
      if content.split(" ")[0] in listOfImplementedCommands
        newCommandComponent(content, position)
      else
        newMacroComponent(content, position)

    newMacroComponent = (name, position)->
      {visualData} = scope
      newComponent =
        type: \subgraph
        macro: graphModel.macros[name]
        id: visualData.counter++
        position: {}
      visualData.components.push newComponent
      newComponent.position <<<< position
      newComponent
    newCommandComponent = (command, position)->
      console.log command
      {visualData} = scope
      newResult = shellParser.parseCommand command
      newComponent = newResult.components[0]
        ..id = visualData.counter++
        ..position <<<< position
      visualData.components.push newComponent
      newComponent

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


    popupState = {x:0,y:0,startNode:0,startPort:0}

    startEdge = (elem,position,ev) ->
        this.hidePopup!
        edgeIniX := elem.offsetLeft + position.x
        edgeIniY := elem.offsetTop + elem.offsetHeight*0.75 + position.y
        setEdgePath edgeIniX,edgeIniY,edgeIniX,edgeIniY
    moveEdge = (event) ->
        {x,y} = mapMouseToScene event
        setEdgePath edgeIniX,edgeIniY,x,y
    endEdge = ->
        console.log "edge finished"
        simpleEdge.setAttribute \d, "M 0 0"

    showPopup = (event,startNode,startPort) ->
        scope.popupText = ''
        {x,y} = mapMouseToView event
        popupState <<<< {x,y}
        popupState
          ..startNode = startNode
          ..startPort = startPort
        console.log popupHeight / 2
        popup.style[cssTransform] = "translate(#{x}px,#{y - popupHeight / 2}px)"
        $popup.show!
        $popupInput.focus!
        scope.$digest!
    popupSubmit = (content) ->
        comp = newComponent(content,popupState);
        scope.visualData.connections.push {
          popupState.startNode, 
          popupState.startPort, endNode: comp.id, endPort: \input
        }
        hidePopup!
        endEdge!
    hidePopup = ->
        $popup.hide!
    hidePopupAndEdge = ->
        $popup.hide!
        endEdge!

##graphC
    this
      ..showPopup = showPopup
      ..nodesElement = nodesElem
      ..popupSubmit = popupSubmit
      ..hidePopup = hidePopup
      ..hidePopupAndEdge = hidePopupAndEdge
      ..nodesElement = nodesElem
      ..typeAheadModel = listOfImplementedCommands
      ..newCommandComponent = newCommandComponent
      ..startEdge = startEdge
      ..moveEdge = moveEdge
      ..endEdge = endEdge
      ..updateScope = -> scope.$digest!
      ..getVisualData = -> scope.visualData
      ..mapPointToScene = mapPointToScene
      ..mapMouseToScene = mapMouseToScene
      ..mapMouseToView = mapMouseToView
      ..setGraphView = (view) !->  hidePopupAndEdge!; scope.visualData = view
      ..revertToRoot = !-> scope.visualData = graphModel;
      ..newMacro = (name, descr) !-> 
        graphModel.macros[name] = shellParser.createMacro name, descr
        this.typeAheadModel = listOfImplementedCommands ++ [key for key in graphModel.macros]
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

      element.bind "pointerdown", (ev) !->
        switch ev.which
        | 2 => return true
        | 3 => return false
        graphModelController.hidePopupAndEdge!
        event = ev.originalEvent
        targetTag = event.target.tagName
        return if pointerId 
               or targetTag in <[INPUT SELECT LABEL]>
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

      if pointedElem == graphModelController.nodesElement
        graphModelController.showPopup event, scope.componentId, attr.port
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



##sidebar

app.directive 'sidebar', ['$document', ($document) ->
  replace: false
  scope: true
  require: '^graphModel'
  controller: ($scope, $element, $modal, $attrs) ->
    form =
      name:''
      description:''    
    console.log $scope.graph
    $scope.implementedCommands = shellParser.implementedCommands
    $scope.open = -> 
      modalInstance = $modal.open {
        templateUrl: 'myModalContent.html'
        controller: ($scope, $modalInstance) !->
          ctrl = this
          $scope.form = form
          $scope.cancel = -> $modalInstance.dismiss('cancel');
          $scope.ok = !-> $modalInstance.close(form);
        resolve:
          items: -> $scope.items
      }

      modalInstance.result.then (selectedItem) ->
        $scope.graph.newMacro form.name, form.description
        form.name = form.description = ''

  link:(scope, element, attr,graphModelCtrl) !->
    requestAnimationFrame ->
      element.find('a[data-command]').each (index) ->
        $ this .bind 'click', (ev)->
          console.log ev
          graphModelCtrl.newCommandComponent do
            $(this).attr(\data-command)
            graphModelCtrl.mapPointToScene 0,0
          graphModelCtrl.updateScope!


  templateUrl: 'sidebarModel.html'

]


app.directive 'sidebarMacroComponent',  ->
  replace: true
  require: '^graphModel'
  scope:
      sidebarMacroComponent: '='
  link: (scope, element, attrs, graphModelCtrl) !->
      scope.selectItem = !->
        name = scope.sidebarMacroComponent
        #console.log graphModelCtrl.getVisualData!.macros[name]
        newComponent = {
          type: \subgraph
          macro: graphModelCtrl.getVisualData!.macros[name]
        }
          ..id = graphModelCtrl.getVisualData!.counter++
          ..position = graphModelCtrl.mapPointToScene 0,0
        graphModelCtrl.getVisualData!.components.push newComponent
  template: """
      <li>
          <a ng-click='selectItem()'>
              {{sidebarMacroComponent}}
          </a>
      </li>"""
    




##dropdownSelect
activeDrop = null;

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


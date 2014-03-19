

##graphModel
 
app.directive "graphModel", ($document) ->
  replace: false
  scope:
    graphModel: '='
    options: '='
  controller:['$scope', '$element','$modal', '$attrs', (scope, element, $modal, attr) !->
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

    #element cache
    elem = element[0];

    nodesElem = elem.querySelector(".nodes")
    nodesElemStyle = nodesElem.style

    edgesElem = elem.querySelector(".edges")
    edgesElemStyle = edgesElem.style
    
    svgElem = elem.querySelector("svg")
    $svgElem = $(svgElem)

    workspace = elem.querySelector(".workspace")
    $workspace = $(workspace)

    popup = elem.querySelector(".popup")
    $popup = $(popup)
    popupHeight = $popup.find("form").height!
    
    $popup.hide!
    $popupInput = $popup.find("input");


    graphModel = scope.graphModel
    graphModel.macros = {sss:shellParser.createMacro \sss,\ddd}
    graphModel.macroList = [key for key,val of graphModel.macros]



    scope
      ..popupText = ''
      ..graph = this
      ..$watch "graphModel", ->
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
      event = ev.originalEvent
      targetTag = event.target.tagName
      return if pointerId || targetTag in <[INPUT SELECT LABEL A LI BUTTON]>
      hidePopupAndEdge!
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
      #console.log command
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
      offset = $workspace.offset!
      return {
        x: Math.round(event.pageX - offset.left)
        y: Math.round(event.pageY - offset.top)
      }

    mapPointToScene = (x,y)->
      x: (x - graphX)/scale
      y: (y - graphY)/scale

    scaleFromMouse = (amount, event) !->
      return if (scale < 0.2 && amount < 1) || (scale > 20 && amount > 1)
      hidePopupAndEdge!
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
        #console.log event.pageX,",", event.pageY, "--" x,",",y,", scale: ", scale, " GX:", graphX, " GY:", graphY
        setEdgePath edgeIniX,edgeIniY,x,y
    endEdge = ->
        #console.log "edge finished"
        simpleEdge.setAttribute \d, "M 0 0"

    showPopup = (event,startNode,startPort,endNode,endPort) ->
        scope.popupText = ''
        {x,y} = mapMouseToView event
        popupState <<<< {x,y}
        popupState
          ..startNode = startNode
          ..startPort = startPort
          ..endNode = endNode
          ..endPort = endPort
        #console.log popupHeight / 2
        popup.style[cssTransform] = "translate(#{Math.round(x)}px,#{Math.round(y - popupHeight / 2)}px)"
        $popup.show!
        $popupInput.focus!
        scope.$digest!
    popupSubmit = (content) ->
        comp = newComponent(content,popupState);
        popupState.startNode ?= comp.id
        popupState.endNode ?= comp.id
        scope.visualData.connections.push {
          popupState.startNode, 
          popupState.startPort, 
          popupState.endNode, 
          popupState.endPort, 
        }
        hidePopup!
        endEdge!
    hidePopup = ->
        $popup.hide!
    hidePopupAndEdge = ->
        $popup.hide!
        endEdge!
    scope.newMacroModal = -> 
        form =
          name:''
          description:''
        modalInstance = $modal.open {
        templateUrl: 'myModalContent.html'
        controller: ($scope, $modalInstance) !->
          $scope.form = form
          $scope.cancel = -> $modalInstance.dismiss('cancel');
          $scope.ok = !-> $modalInstance.close(form);
        }

        modalInstance.result.then (selectedItem) ->
          scope.graph.newMacro form.name, form.description
          form.name = form.description = ''

    scope.newCommandAtTopLeft = (command)->
      newCommandComponent(command, mapPointToScene 0,0)

##graphC
    this
      ..removeComponent = (id) !->
        scope.visualData
          ..components = [x for x in scope.visualData.components when x.id != id]
          ..connections = [x for x in scope.visualData.connections when x.startNode != id and x.endNode != id]
      ..isFreeSpace = (elem) -> elem in [svgElem, workspace, nodesElem]
      ..showPopup = showPopup
      ..nodesElement = nodesElem
      ..popupSubmit = popupSubmit
      ..hidePopup = hidePopup
      ..hidePopupAndEdge = hidePopupAndEdge
      ..nodesElement = nodesElem
      ..newCommandComponent = newCommandComponent
      ..newMacroComponent = newMacroComponent
      ..startEdge = startEdge
      ..moveEdge = moveEdge
      ..endEdge = endEdge
      ..isMacroView
      ..updateScope = -> scope.$digest!
      ..getVisualData = -> scope.visualData
      ..mapPointToScene = mapPointToScene
      ..mapMouseToScene = mapMouseToScene
      ..mapMouseToView = mapMouseToView
      ..setGraphView = (view) !->  
        hidePopupAndEdge!;
        #console.log "graphview set to", view 
        scope.visualData = view
        scope.$digest!
      ..revertToRoot = !-> scope.visualData = graphModel;
      ..newMacro = (name, descr) !-> 
        graphModel.macros[name] = shellParser.createMacro name, descr
        graphModel.macroList = [key for key of graphModel.macros]
      ..translateNode = (id,position,x,y) !->
        position.x += x/scale
        position.y += y/scale
        for el in edgesElem.querySelectorAll("[connector]")
          $(el).scope().updateWithId(id)
  ]
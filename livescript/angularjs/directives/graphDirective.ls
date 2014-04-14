

##graphModel
 
app.directive "graphModel", ($document) ->
  replace: false
  scope:
    graphModel: '='
    options: '='
  templateUrl: 'graphTemplate.html'
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

    toplayout = elem.querySelector(".toplayout")
    splitbar = elem.querySelector(".ui-splitbar")
    graphModel = scope.graphModel
    graphModel.macros = {sss:shellParser.createMacro \sss,\ddd, "grep server | gzip | zcat"}
    graphModel.macroList = [key for key,val of graphModel.macros]

    console.log attr.demo
    if attr.demo != void
      $sp = scope.$parent 
        ..shellText = []
      scope.$on "runCommand", (event, message) ->
        command = shellParser.parseVisualData scope.graphModel
        $sp.shellText.push {text:command, type: "call"}
        $sp.shellText.push {text:"this is a demo", type: "error"}
        $sp.shellText = $sp.shellText[-50 to] if $sp.shellText.length > 50

    scope
      ..safedigest = !-> scope.$digest! unless scope.$$phase or scope.$root.$$phase
      ..toNatNum = (num) -> num.replace(/[^\d]/,'')
      ..popupText = ''
      ..graph = this
      ..$watch "graphModel", -> scope.visualData = scope.graphModel;
      ..$watch "shell", ->
        unless scope.shell
          toplayout.style.bottom = "0"
          splitbar.style.display = "none"
        else
          toplayout.style.bottom = "#{100 - parseFloat(splitbar.style.top)}%"
          splitbar.style.display = ""
      ..visualData = scope.graphModel;
      ..implementedCommands = listOfImplementedCommands
      ..isImplemented = isImplemented
      ..isArray = angular.isArray
      ..isString = angular.isString
      ..isRootView = -> scope.visualData === scope.graphModel
      ..toRootView = -> 
          scope.visualData = scope.graphModel
      ..macroViewList = -> if scope.visualData === scope.graphModel
        then graphModel.macroList else []



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

    $workspace.bind "pointerdown", (ev) !->
      return false if ev.which == 3
      event = ev.originalEvent
      targetTag = event.target.tagName
      return if pointerId || targetTag in  <[LI INPUT SELECT LABEL BUTTON A TEXTAREA]>

      hidePopupAndEdge!
      pointerId := event.pointerId
      $document
        ..bind "pointermove", mousemove
        ..bind "pointerup", mouseup
      startX := event.screenX
      startY := event.screenY
      event.preventDefault!
      event.stopPropagation!


    ##Component

    newComponent = (content, position)->
      if content.split(" ")[0] in listOfImplementedCommands
        newCommandComponent(content, position)
      else if content.split(" ")[0].indexOf(".") > -1
        newFileComponent(content.split(" ")[0], position)
      else
        newMacroComponent(content, position)

    newFileComponent = (filename,position) ->
      {visualData} = scope
      newComponent =
        type: \file
        id: visualData.counter++
        filename: filename
        position: {}
      visualData.components.push newComponent
      newComponent.position <<<< position
      newComponent

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
        simpleEdge.setAttribute \d , 
        """M #iniX #iniY 
           H #{iniX+0.5*xpoint} 
           C #{iniX+2*xpoint},#iniY #{iniX+xpoint*2},#endY #{iniX+xpoint*4},#endY 
           H #endX"""


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
        scope.safedigest!
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
        scope.sel = {-open}
        scope.safedigest!
    hidePopupAndEdge = ->
        hidePopup!
        endEdge!

    ##Modal

    scope.newMacroModal = -> 
        form =
          name:''
          description:''
          command: ''
        modalInstance = $modal.open {
        templateUrl: 'myModalContent.html'
        controller: ($scope, $modalInstance) !->
          $scope.form = form
          $scope.cancel = -> $modalInstance.dismiss('cancel');
          $scope.ok = !-> $modalInstance.close(form);
        }

        modalInstance.result.then (selectedItem) ->
          scope.graph.newMacro form.name, form.description, form.command
          form.name = form.description = ''

    scope.macroEditModal = (macroName)->
        macro = graphModel.macros[macroName]
        form =
          name:macro.name
          description:macro.description

        modalInstance = $modal.open {
        templateUrl: 'MacroEditModal.html'
        controller: ($scope, $modalInstance) !->
          $scope.form = form
          $scope.cancel = -> $modalInstance.dismiss('cancel');
          $scope.edit = !-> $modalInstance.close(result:"edit");
          $scope.delete = !-> $modalInstance.close(result:"delete");
          $scope.view = !-> $modalInstance.close(result:"view");
        }

        modalInstance.result.then (selectedItem) ->
          switch selectedItem.result
            when "edit"
              graphModel.macros[form.name] = macro
              delete graphModel.macros[macroName]
                
              macro
                ..name = form.name
                ..description = form.description
              graphModel.macroList = [key for key of graphModel.macros]
              scope.$digest!
            when "view"
              scope.graph.setGraphView(graphModel.macros[macroName])
            when "delete"
              delete graphModel.macros[macroName]
              graphModel.macroList = [key for key of graphModel.macros]

          form.name = form.description = ''


    scope.newCommandAtTopLeft = (command)->
      newCommandComponent(command, mapPointToScene 0,0)

##graphC
    this <<< {
      showPopup, popupSubmit, hidePopup, hidePopupAndEdge,
      nodesElement: nodesElem,
      newCommandComponent, newMacroComponent,
      startEdge,moveEdge,endEdge,
      mapPointToScene,mapMouseToScene,mapMouseToView
    }
    this
      ..setSelection = (options, obj) !-> 
        scope.sel = options;
        options.open = true
        elem = obj[0]
        offset = obj.offset!
        position = options.data.position
        y = offset.top - 50 + elem.offsetHeight * scale
        x = offset.left 
        options.transform = "translate(#{x}px, #{y}px)"
      ..selectSelection = (value)->
        {options, sel} = scope
        {data, name} = sel
        options[data.exec].$changeToValue(data.selectors[name],name,value)
        sel.open=false
      ..removeComponent = (id) !->
        console.log "removing component"
        scope.visualData
          ..components = [x for x in scope.visualData.components when x.id != id]
          ..connections = [x for x in scope.visualData.connections when x.startNode != id and x.endNode != id]
      ..isFreeSpace = (elem) -> elem in [svgElem, workspace, nodesElem]
      ..updateScope = -> scope.$digest!
      ..getVisualData = -> scope.visualData
      ..setGraphView = (view) !->  
        hidePopupAndEdge!;
        #console.log "graphview set to", view 
        scope.visualData = view
        scope.$digest!
      ..revertToRoot = !-> scope.visualData = graphModel;
      ..newMacro = (name, descr, command) !-> 
        graphModel.macros[name] = shellParser.createMacro name, descr, command
        graphModel.macroList = [key for key of graphModel.macros]
      ..translateNode = (id,position,x,y) !->
        position.x += x/scale
        position.y += y/scale
        for el in edgesElem.querySelectorAll("[connector]")
          $(el).scope().updateWithId(id)
  ]
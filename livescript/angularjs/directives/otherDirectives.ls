

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
        graphModelCtrl.newMacroComponent graphModelCtrl.mapPointToScene 0,0
        #console.log graphModelCtrl.getVisualData!.macros[name]
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


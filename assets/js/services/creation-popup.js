app.service('creationPopup',function($rootScope){
  
  var _this = this;
  var popupState = {
    x: 0,
    y: 0,
    startNode: 0,
    startPort: 0
  };
  this.popupText = ''
  var popup = document.querySelector("div[graph] .popup");
  var $popup = $(popup);
  var popupHeight = $popup.find("form").height();
  var $popupInput = $popup.find("input");
  var simpleEdge = document.querySelector('.emptyEdge');
  var scope;

  $popup.hide();


  var showPopup = function(event, startNode, startPort, endNode, endPort){
    _this.popupText = '';
    var ref$ = mapMouseToView(event);
    popupState.x = ref$.x; 
    popupState.y = ref$.y;
    popupState.startNode = startNode;
    popupState.startPort = startPort;
    popupState.endNode = endNode;
    popupState.endPort = endPort;
    popup.style[cssTransform] = "translate(" + Math.round(x) + "px," + Math.round(y - popupHeight / 2) + "px)";
    $popup.show();
    $popupInput.focus();
    $rootScope.$digest();
  };
  var popupSubmit = function(content){
    var comp;
    scope.$emit('addAndConnectComponent', {
      command: content,
      componentId: popupState.startNode,
      startPort: popupState.startPort,
      position: {x: popupState.x , y: popupState.y}
    })
    hidePopup();
    endEdge();
    
  };
  function hidePopup(){
    $popup.hide();
    scope.sel = { open: false };
    scope.safedigest();
  };

  this.setScope = function(newscope){scope = newscope; }
  this.showPopup = showPopup
  this.popupSubmit = popupSubmit
  this.hidePopup = hidePopup

})
import * as app from "../../app.module"


interface MiniComponentScope extends angular.IScope{
  graphElement: JQuery
  data: any
  offsetWidth: number
  offsetHeight:number
}

app.directive("minicomponent", function(){
  return {
    scope: true,
    link: function(scope: MiniComponentScope, element, attr){
      const datanode = scope.data;
      const $graphElement = scope.graphElement;
      const graphElement = $graphElement[0];

      scope.offsetWidth = 100
      scope.offsetHeight = 100

      function update(){
        const elem = graphElement.querySelector(`.nodes .component[data-node-id='${datanode.id}']`) as HTMLElement;
        scope.offsetWidth = (elem) ? elem.offsetWidth:100
        scope.offsetHeight = (elem) ? elem.offsetHeight:100
        scope.$digest();
      }

      if(datanode.files !== null){
        scope.$watch("data.files.length",function(){
          requestAnimationFrame(update);
        })
      }

      scope.$watch("data",function(){
        requestAnimationFrame(update);
      })
      requestAnimationFrame(update);
    }
  }
});

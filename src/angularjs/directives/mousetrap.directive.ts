import * as app from "../app.module"

interface IParameterFieldAttributes extends angular.IAttributes {
  mousetrap: string
}

app.directive("mousetrap", [() => ({
    scope: true,
    link: function(scope, element, attr:IParameterFieldAttributes){
      const shorcuts = attr.mousetrap;
      const htmlbuttons = shorcuts.split("+").map((key) => `<kbd>${key}</kbd>`).join("+");
      element.append(`<div class="small align-right">${htmlbuttons}</div>`);
      Mousetrap.bind(attr.mousetrap.toLowerCase(), () => element.trigger("click"))
    }
})]);

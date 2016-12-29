import * as app from "../../app.module"
import { CSRF } from "../../services/csrf"
import * as angular from "angular";
import { GraphController } from "./graph.controller"

const mousewheelevt = /Firefox/i.test(navigator.userAgent) ? "DOMMouseScroll" : "mousewheel";


app.directive("graph", () => ({
  replace: false,
  scope: true,
  templateUrl: 'graphTemplate.html',
  controller: "graphCtrl",
  link: function(scope, element, attr, graphCtrl:GraphController){
    element[0].addEventListener(mousewheelevt, MouseWheelHandler, false);
        function MouseWheelHandler(event){
          const ispopup = $(event.target).closest(".popupArea, .shell").length > 0
          if (!event.altKey && ispopup) { return; }
          event.preventDefault();
          event.stopPropagation();
          if ((event.wheelDelta || -event.detail) > 0) {
            return graphCtrl.scaleFromMouse(1.1, event);
          } else {
            return graphCtrl.scaleFromMouse(0.9, event);
          }
        };
  }
}));

import * as app from "../app.module"

app.directive("connectorsLayer", () => ({
  scope: true,
  restrict: "A",
  transclude: true,
  template: require("./connectors-layer.html"),
}));

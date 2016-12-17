import * as app from "../../app.module"

app.directive("inputPort", () => ({
  require: 'port',
  restrict: 'A',
  priority: 2,
  template: require("./input-port.html")
}));

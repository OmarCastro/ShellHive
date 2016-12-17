import * as app from "../../app.module"

app.directive("outputPort", () => ({
  require: 'port',
  priority: 2,
  template: require("./output-port.html")
}));

import * as app from "../../app.module"
import { CSRF } from "../../services/csrf"
import * as angular from "angular";

app.directive("graph", () => ({
  replace: false,
  scope: true,
  templateUrl: 'graphTemplate.html',
  controller: "graphCtrl"
}));

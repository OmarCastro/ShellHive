import * as app from "../app.module"


const serviceDeclaration : (Function | string | Function)[] = ["$timeout", alertService] 
export const serviceName = "alerts"

app.service(serviceName,serviceDeclaration)

 
declare module alertService {

}
interface AlertMsg {
  type: "info" | "danger";
  msg: string
}

export interface IAlertService {
  alerts: AlertMsg[];
  addAlert: (msg: AlertMsg) => void;
  addNotification: (msg: AlertMsg) => void;
  removeAfter: (msg: AlertMsg, time: number) => void;
  closeAlert: (index: number) => void;
}

function alertService($timeout: angular.ITimeoutService){
  const alerts = [];
  const service: IAlertService = this;
  service.alerts = alerts;

  service.addAlert = function(msg: AlertMsg) {
    msg.type = "danger"
    alerts.push(msg);
    service.removeAfter(msg, 5000)
  };

  service.addNotification = function(msg: AlertMsg) {
    msg.type = "info"
    alerts.push(msg);
    return msg
  };

  service.removeAfter = function(msg: AlertMsg, time: number) {
    $timeout(function(){
      const indx = alerts.indexOf(msg)
      if(indx < 0) return;
      service.closeAlert(indx)
    },time)
  };

  service.closeAlert = function(index: number) {
    alerts.splice(index, 1);
  };
}

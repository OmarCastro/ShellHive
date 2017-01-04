import * as app from "../app.module"


const serviceDeclaration : (Function | string)[] = ["$timeout", alertService] 
export const serviceName = "alerts"

app.service(serviceName,serviceDeclaration)


export interface AlertMsg {
  type?: "info" | "danger";
  msg: string
  progress?: number
}

export interface IAlertService {
  alerts: AlertMsg[];
  addAlert: (msg: AlertMsg) => void;
  addNotification: (msg: AlertMsg) => AlertMsg;
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

app.service('alerts',function($timeout){
  var alerts = [];
  var _this = this;
  this.alerts = alerts;

  this.addAlert = function(msg) {
    msg.type = "danger"
    alerts.push(msg);
    _this.removeAfter(msg, 5000)
  };

  this.addNotification = function(msg) {
    msg.type = "info"
    alerts.push(msg);
    return msg
  };

  this.removeAfter = function(msg, time) {
    $timeout(function(){
      var indx = alerts.indexOf(msg)
      if(indx < 0) return;
      _this.closeAlert(indx)
    },time)
  };

  this.closeAlert = function(index) {
    alerts.splice(index, 1);
  };
})
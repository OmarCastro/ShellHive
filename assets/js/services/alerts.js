app.service('alerts',function($timeout){
  var alerts = [];
  var _this = this;
  this.alerts = alerts;

  this.addAlert = function(msg) {
    alerts.push(msg);
    $timeout(function(){
      var indx = alerts.indexOf(msg)
      if(indx < 0) return;
      _this.closeAlert(indx)
    },5000)
  };

  this.closeAlert = function(index) {
    alerts.splice(index, 1);
  };
})
app.service('csrf',function(){
  var _this = this;
  io.socket.get('/csrfToken', function(data){
    _this.csrf = data._csrf;
  });
  window.printget = function(reqdata){
    io.socket.post('/project/graphaction', {id:projId, message:reqdata,_csrf:_this.csrf}, function(data){
      console.log(data);
    });
  }
})
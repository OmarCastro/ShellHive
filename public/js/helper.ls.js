(function(){
  var results, socket;
  results = document.querySelector('div.content');
  socket = io.connect();
  socket.emit('helper', "");
  socket.on('stdout', function(data){
    var x$, elem;
    x$ = elem = document.createElement('div');
    x$.setAttribute('data-commandline', data.commandline);
    elem.innerHTML = "<div class=\"commandline\"><span>" + data.commandline + "</span></div>\n<pre>" + data.content + " </pre>";
    results.appendChild(elem);
  });
  socket.on('error', function(data){
    var x$, elem;
    x$ = elem = document.createElement('div');
    x$.innerHTML = "command line : " + data.commandline + "\nresult: " + data.content;
    results.appendChild(elem);
  });
}).call(this);


var SocketsService = module.exports = {

  
  getClientListInRoom: function(roomName){
  	var io = sails.io;
  	var clientsInRoom = io.sockets.adapter.rooms[roomName].sockets
  	return Object.keys(clientsInRoom).map(function(clientId){
  		return io.sockets.connected[clientId];
  	});
  }

  
};
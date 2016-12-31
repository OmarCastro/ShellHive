/**
 * demoController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
  startDemo: function(req, res){},


  subscribe: function(req,res){
    var parser = CollaborationService.parser;
    res.json({
      implementedCommands: parser.implementedCommands,
      SelectionOptions: parser.VisualSelectorOptions,
    })
  },

  startproject: function(req,res){
    var parser = CollaborationService.parser;
  	var socket = req.socket;
  	sails.log(socket);
  	var command = req.body.command;

  	var parsedGraph = parser.parseCommand(command);
    parsedGraph.connections = parsedGraph.connections.map(function(connection){return connection.toJSON()});
    res.json({
    	graph:parsedGraph.toJSON()
    });
  }
  
};

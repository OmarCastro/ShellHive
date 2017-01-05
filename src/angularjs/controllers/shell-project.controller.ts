import * as app from "../app.module"
import { projectId } from "../utils"
import { SocketService } from "../socket.service"
import network, { routeTable } from "../router"
import  * as welcomeUserModal  from "../modals/welcome-user.modal"
import  * as projectCreationModal  from "../modals/project-creation.modal"
import notificationService, {Alert} from "../components/notification-area/notifications.service"
import {CSRF}  from "../services/csrf"

declare const io;
app.controller('shellProject', ['$scope', '$modal', '$timeout', shellProjectController]);



function shellProjectController($scope, modal, $timeout) {
  const visualData = {} as jsmodels.IGraphData;
  $scope.filesystem = 0
  $scope.graphData = visualData;
  $scope.implementedCommands = [];
  $scope.chatMessages = [];
  $scope.clients = [];
  $scope.chat = { open: false };
  $scope.execStatus = false;
  $scope.isImplemented = function (data) {
    return this.implementedCommands.indexOf(data.exec) >= 0;
  };

  function viewGraph(graph) {
    if (graph.id) { graph = graph.id }
    network.send({
      payload: { id: graph },
      useRoute: routeTable.graphSubscription()
    }).onResponse(res => $scope.$applyAsync(() => {
      console.log(res);
      $scope.graphData.components = res.graph.components.map(function (component) {
        component.data.id = component.id;
        res.graph.connections.forEach(function (connection) {
          if (connection.startNode == component.id) connection.startComponent = component.data
          if (connection.endNode == component.id) connection.endComponent = component.data
        })
        return component.data
      });
      $scope.graphData.connections = res.graph.connections;

    }));
  }
  $scope.viewGraph = viewGraph

console.log("subscribe project!!")
  network.send({
    payload: { id: projectId },
    useRoute: routeTable.projectSubscription()
  }).onResponse((data) => {
    console.log("subscribe project response!!")

    $scope.implementedCommands = data.implementedCommands
    $scope.options = data.SelectionOptions;
    $scope.clients = data.clients;
    $scope.page = "graph";
    if(SocketService.socket.id == null) return;
    $scope.chatterId = SocketService.socket.id;
    $scope.chat = { open: $scope.clients.length > 1 };

    console.log("socket.id =", $scope.chatterId);

    $scope.$digest();



    if (data.visitor) {
      var visitorName: string = projectId == "3" ? "anon" : sessionStorage["visitorName"];
      var visitorColor: string = projectId == "3" ? "blue" : sessionStorage["visitorColor"];
      if (visitorName && visitorColor) {
        network.send({payload: { name: visitorName, color: visitorColor }, useRoute: routeTable.setUserName()});
      } else {
        welcomeUserModal.showModal(modal).then((form) => {
          network.send({payload: { name: form.name }, useRoute: routeTable.setUserName()});
          sessionStorage["visitorName"] = form.name;
          sessionStorage["visitorColor"] = data.you.color;
        });


      }
    }

    console.log(data);
    var graphs = data.graphs
    var len = graphs.length;
    if (len == 0) {
      return projectCreationModal.showModal(modal).then(function (form) {
        console.log(form);
        io.socket.post('/graph/createfromcommand/', {
          project: projectId, type: 'root',
          command: form.command, _csrf: CSRF.csrfToken
        }, function (res) {
          console.log(res);
          if (res.graph) {
            var graph = res.graph;
            $scope.rootGraph = graph;
            viewGraph(graph.id)
          }
        });
      });
      // is a new project
    } else {
      var macros = visualData.macros = {};
      var macroList = visualData.macroList = [];
      for (var i = 0; i < len; ++i) {
        var graph = graphs[i];
        if (graph.type == 'root') {
          $scope.rootGraph = graph
          viewGraph(graph.id)
        } else {
          graph.data.id = graph.id;
          macros[graph.data.name] = graph.data
          macroList.push(graph.data.name)
        }
      }
    }
  });

  $scope.shellText = [];


  var onComponentbyID_do = function (id, callback) {
    var components = visualData.components;
    var component;
    for (var indx = components.length - 1; indx >= 0; indx--) {
      component = components[indx];
      if (component.id === id) {
        callback(component);
        break;
      }
    }
  }


  var actionReceiveCallbacks = {
    move: function (data) {
      onComponentbyID_do(data.componentId, function (component) {
        var position = component.position;
        position.x = data.movepos.x;
        position.y = data.movepos.y;
        $scope.$broadcast("Graph::Connector::UpdateOfComponent", data.componentId, data.movepos)
        $scope.applyAsync()

      })
    },
    removeComponent: function (data) {
      var components = data.components.map(function (component) { return component.id })
      var connections = data.connections.map(function (connection) { return connection.id })
      visualData.components = visualData.components.filter(function (component) { return components.indexOf(component.id) < 0 })
      visualData.connections = visualData.connections.filter(function (connection) { return connections.indexOf(connection.id) < 0 })
      $scope.compileGraph()
    },

    addComponent: function (data) {
      console.log("addComponent:", data);
      if (data.component) {
        data.component.data.id = data.component.id
        visualData.components.push(data.component.data);
      }
      if (data.connection) {
        var connection = data.connection;
        visualData.components.forEach(function (component) {
          if (component.id == connection.startNode) {
            connection.startComponent = component
          } else if (component.id == connection.endNode) {
            connection.endComponent = component
          }
        });
        visualData.connections.push(connection)
      }
      $scope.compileGraph()
    },

    updateComponent: function (data) {
      console.log("updateComponent:", data);
      var components = visualData.components;
      for (var i = components.length - 1; i >= 0; i--) {
        if (components[i].id == data.id) {
          var component = components[i];
          for (const j in data.data) {
            if (j == "position") {
              var comPosition = component.position
              var dataPosition = data.data.position
              comPosition.x = dataPosition.x
              comPosition.y = dataPosition.y
            } else {
              component[j] = data.data[j];
            }
          }
          break;
        }
      }
      $scope.compileGraph()
    },

    removePipe: function (data) {
      var connections = data.pipes.map(function (connection) { return connection.id })
      visualData.connections = visualData.connections.filter(function (connection) { return connections.indexOf(connection.id) < 0 })
      $scope.compileGraph()
    },

    updateConnections: function (data) {


      console.log("updateConnections:", data);
      var connections = visualData.connections;
      var upConnections = data.connections;

      for (var i = connections.length - 1; i >= 0; i--) {
        for (var j = upConnections.length - 1; j >= 0; j--) {
          if (connections[i].id == upConnections[j]) {
            connections[i] = upConnections[j];
            break;
          }
        }
      }
      $scope.compileGraph()
    },

    multiaction: function (data) {
      $scope.haltCompileGraph();
      data.actions.forEach(function (action) {
        actionReceiveCallbacks[action.type](action);
      });
      $scope.resumeCompileGraph();
    }

  }

  function debugData(data) {
    console.log(data);
    if (data.alert) {
      const notification = { type: 'danger', msg: data.message } as Alert
      notificationService.pushNotification(notification)
      notificationService.closeNotificationOnTimeout(notification, 5000)
      $scope.$digest();
    } else if (data.status == 500 && data.errors) {
      data.errors.forEach(function (message) {
        const notification = { type: 'danger', msg: message } as Alert
        notificationService.pushNotification(notification)
        notificationService.closeNotificationOnTimeout(notification, 5000)
      })
    }
  }

  io.socket.on('action', function (data) {
    console.log('action', data);
    actionReceiveCallbacks[data.type](data)
  });

  io.socket.on('new user', function (data) {
    $scope.clients.push(data)
    $scope.$digest();
  });

  io.socket.on('user leave', function (id) {
    $scope.clients = $scope.clients.filter(function (client) { return client.id != id });
    $scope.$digest();
  });

  io.socket.on('update user', function (data) {
    for (var i = 0, _ref = $scope.clients, length = _ref.length; i < length; ++i) {
      var client = _ref[i];
      if (client.id == data.id) {
        _ref[i] = data;
      }
    }
    $scope.$digest();
  });


  io.socket.on('chat', function (data) {
    $scope.chatMessages.push(data)
    $scope.$digest();
  });

  io.socket.on('updateMacroList', function (graphs) {
    var len = graphs.length;
    var macros = visualData.macros = {};
    var macroList = visualData.macroList = [];
    for (var i = 0; i < len; ++i) {
      var graph = graphs[i];
      graph.data.id = graph.id;
      macros[graph.data.name] = graph.data
      macroList.push(graph.data.name)
    }
    $scope.$digest();
  });

  $scope.$on("runCommand", function (event, message) {
    if ($scope.execStatus) return;
    $scope.execStatus = true;
    console.log('runCommand!');
    $timeout(function () {
      $scope.execStatus = false
    }, 3000)
    io.socket.get('/graph/runGraph/', { _csrf: CSRF.csrfToken }, function (data) {
      debugData(data);
      $scope.shellText = [{
        text: data.command.pretty,
        type: "call"
      }];
      $scope.$digest();
    });
  });

  $scope.haltCompileGraph = function (event, message) {
    $scope.compileGraphHalted = true;
  };

  $scope.resumeCompileGraph = function (event, message) {
    $scope.compileGraphHalted = false;
    $scope.compileGraph();
  };

  $scope.compileGraph = function (event, message) {
    if ($scope.compileGraphHalted) {
      return;
    } else if (!$scope.shell) {
      return $scope.$digest();
    }
    //console.log('compileGraph!');
    io.socket.get('/graph/compile/', function (data) {
      debugData(data);
      $scope.$broadcast("Terminal::AddLines", [{
        text: data.command,
        type: "call"
      }]);
    });
  }

  $scope.$on("compileGraph", $scope.compileGraph);

  $scope.$on("removeComponent", function (event, message) {
    //console.log('removeComponent '+message+' !');
    io.socket.post('/graph/removeComponent/', { id: message, _csrf: CSRF.csrfToken }, debugData);
  });

  $scope.$on("addAndConnectComponent", function (event, message) {
    //console.log('addAndConnectComponent ', message,' !');
    message._csrf = CSRF.csrfToken
    io.socket.post('/graph/createAndConnectComponent/', message, debugData);
  });

  $scope.$on("updateComponent", function (event, message) {
    //console.log('updateComponent:' , message);
    message._csrf = CSRF.csrfToken
    var dataid = message.id;
    io.socket.put('/component/' + dataid, message, debugData);
  });

  $scope.$on("updateMacro", function (event, message) {
    //console.log('updateMacro:' , message);
    message._csrf = CSRF.csrfToken
    io.socket.put('/macro/setData', message, debugData);
  });

  $scope.$on("deleteMacro", function (event, message) {
    //console.log('deleteMacro:' , message);
    message._csrf = CSRF.csrfToken
    io.socket.put('/macro/remove', message, debugData);
  });


  $scope.$on("connectComponent", function (event, message) {
    //console.log('connectComponent:' , message);
    message = {
      data: message,
      _csrf: CSRF.csrfToken
    }
    io.socket.put('/graph/connect/', message, debugData);
  });


  $scope.$on("removePipe", function (event, message) {
    //console.log('removePipe:' , message);
    message = {
      data: message,
      _csrf: CSRF.csrfToken
    }
    io.socket.put('/graph/removePipe/', message, debugData);
  });
};
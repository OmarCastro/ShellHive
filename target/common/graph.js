var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Graph = (function () {
    function Graph(components, connections, firstMainComponent, counter) {
        if (typeof components === "undefined") { components = []; }
        if (typeof connections === "undefined") { connections = []; }
        if (typeof firstMainComponent === "undefined") { firstMainComponent = null; }
        if (typeof counter === "undefined") { counter = 0; }
        this.components = components;
        this.connections = connections;
        this.firstMainComponent = firstMainComponent;
        this.counter = counter;
    }
    /**
    transforms to JSON, JSON.stringify() will
    call this function if it exists
    */
    Graph.prototype.toJSON = function () {
        return {
            components: this.components,
            connections: this.connections
        };
    };

    Graph.prototype.connect = function (startComponent, outputPort, endComponent, inputPort) {
        var connection = new Connection(startComponent, outputPort, endComponent, inputPort);
        this.connections.push(connection);
    };

    /*
    expands with other graph
    */
    Graph.prototype.expands = function (other) {
        this.concatComponents(other.components);
        this.concatConnections(other.connections);
    };

    Graph.prototype.concatComponents = function (components) {
        this.components = this.components.concat(components);
    };
    Graph.prototype.concatConnections = function (connections) {
        this.connections = this.connections.concat(connections);
    };
    return Graph;
})();
exports.Graph = Graph;

var IndexedGraph = (function () {
    function IndexedGraph(graph) {
        this.components = {};
        this.inputConnections = {};
        this.outputConnections = {};
        var components = this.components;
        var outputConnections = this.outputConnections;
        var inputConnections = this.inputConnections;

        graph.components.forEach(function (component) {
            components[component.id] = component;
        });
        graph.connections.forEach(function (connection) {
            outputConnections[connection.startNode] = connection;
            inputConnections[connection.endNode] = connection;
        });
    }
    return IndexedGraph;
})();
exports.IndexedGraph = IndexedGraph;

var Macro = (function (_super) {
    __extends(Macro, _super);
    function Macro(name, description) {
        _super.call(this);
        this.name = name;
        this.description = description;
    }
    Macro.fromGraph = function (name, description, graphData) {
        var newmacro = new Macro(name, description);
        newmacro.components = graphData.components;
        newmacro.connections = graphData.connections;
        return newmacro;
    };
    return Macro;
})(Graph);
exports.Macro = Macro;

//============= COMPONENTS ===========
var Component = (function () {
    function Component() {
        this.position = { x: 0, y: 0 };
        this.id = 0;
    }
    Component.type = "abrstract component";
    return Component;
})();
exports.Component = Component;

/**
A command component
*/
var CommandComponent = (function (_super) {
    __extends(CommandComponent, _super);
    function CommandComponent() {
        _super.apply(this, arguments);
        this.type = CommandComponent.type;
        this.exec = null;
    }
    CommandComponent.type = "command";
    return CommandComponent;
})(Component);
exports.CommandComponent = CommandComponent;

/**
A file component
*/
var FileComponent = (function (_super) {
    __extends(FileComponent, _super);
    function FileComponent(filename) {
        _super.call(this);
        this.type = FileComponent.type;
        this.filename = filename;
    }
    FileComponent.type = "file";
    return FileComponent;
})(Component);
exports.FileComponent = FileComponent;

/**
A macro Component
*/
var GraphComponent = (function (_super) {
    __extends(GraphComponent, _super);
    function GraphComponent(name, description) {
        _super.call(this);
        this.name = name;
        this.description = description;
        this.type = GraphComponent.type;
        this.entryComponent = null;
        this.exitComponent = null;
        this.counter = 0;
        this.components = [];
        this.connections = [];
    }
    GraphComponent.prototype.setGraphData = function (graphData) {
        this.components = graphData.components;
        this.connections = graphData.connections;
        this.entryComponent = graphData.firstMainComponent;
    };
    GraphComponent.type = "graph";
    return GraphComponent;
})(Component);
exports.GraphComponent = GraphComponent;

/**
A macro Component
*/
var MacroComponent = (function (_super) {
    __extends(MacroComponent, _super);
    function MacroComponent(macro) {
        _super.call(this);
        this.macro = macro;
        this.type = MacroComponent.type;
    }
    MacroComponent.type = "macro";
    return MacroComponent;
})(Component);
exports.MacroComponent = MacroComponent;

//========   ==========
var Connection = (function () {
    function Connection(startComponent, startPort, endComponent, endPort) {
        this.startComponent = startComponent;
        this.startPort = startPort;
        this.endComponent = endComponent;
        this.endPort = endPort;
    }
    Object.defineProperty(Connection.prototype, "startNode", {
        get: function () {
            return this.startComponent.id;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Connection.prototype, "endNode", {
        get: function () {
            return this.endComponent.id;
        },
        enumerable: true,
        configurable: true
    });

    Connection.prototype.toJSON = function () {
        return {
            startNode: this.startNode,
            startPort: this.startPort,
            endNode: this.endComponent.id,
            endPort: this.endPort
        };
    };
    return Connection;
})();
exports.Connection = Connection;

//========   ==========
var Boundary = (function () {
    function Boundary(left, rigth, top, bottom, components) {
        this.left = left;
        this.rigth = rigth;
        this.top = top;
        this.bottom = bottom;
        this.components = components;
    }
    Boundary.createFromXY = function (x, y, component) {
        var bottom;
        if (component.type === "file") {
            bottom = y + 100;
        } else {
            bottom = y + 350;
        }
        return new this(x, x, y, bottom, [component]);
    };

    Boundary.createFromPoint = function (point, component) {
        return this.createFromXY(point.x, point.y, component);
    };

    Boundary.createFromComponent = function (component) {
        return this.createFromPoint(component.position, component);
    };

    Boundary.createFromComponents = function (components) {
        if (components.length === 0) {
            return null;
        }
        var boundary = this.createFromComponent(components[0]);
        for (var i = 1, len = components.length; i < len; ++i) {
            boundary.extend(this.createFromComponent(components[i]));
        }
        return boundary;
    };

    Boundary.prototype.extend = function (boundary2) {
        this.left = Math.min(boundary2.left, this.left);
        this.rigth = Math.max(boundary2.rigth, this.rigth);
        this.top = Math.min(boundary2.top, this.top);
        this.bottom = Math.max(boundary2.bottom, this.bottom);
        this.components = this.components.concat(boundary2.components);
    };

    Boundary.translate = function (boundary, x, y) {
        boundary.left += x;
        boundary.rigth += x;
        boundary.top += y;
        boundary.bottom += y;
        boundary.components.forEach(function (component) {
            var position = component.position;
            position.x += x;
            position.y += y;
        });
    };

    Boundary.prototype.translateXY = function (x, y) {
        if (typeof y === "undefined") { y = 0; }
        Boundary.translate(this, x, y);
    };

    /**
    arranges the layout
    */
    Boundary.arrangeLayout = function (boundaries) {
        var maxX = 0;
        var prevBound = null;
        var components = [];
        boundaries.forEach(function (boundary) {
            maxX = Math.max(boundary.rigth, maxX);
            components = components.concat(boundary.components);
        });

        boundaries.forEach(function (boundary) {
            var translateX = maxX - boundary.rigth;
            var translateY = prevBound ? prevBound.bottom - boundary.top : 0;
            boundary.translateXY(translateX, translateY);
            prevBound = boundary;
        });

        var x = 0, y = 0, bottom = 350;

        if (boundaries.length) {
            x = maxX + 450;
            y = Math.max((prevBound.bottom - 350) / 2, 0);
            bottom = Math.max(prevBound.bottom, 350);
        }
        return [new Boundary(0, x, 0, bottom, components), { x: x, y: y }];
    };
    return Boundary;
})();
exports.Boundary = Boundary;
//# sourceMappingURL=graph.js.map

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Component = (function () {
    function Component() {
        this.position = { x: 0, y: 0 };
        this.id = 0;
    }
    return Component;
})();
exports.Component = Component;

var CommandComponent = (function (_super) {
    __extends(CommandComponent, _super);
    function CommandComponent() {
        _super.apply(this, arguments);
    }
    return CommandComponent;
})(Component);
exports.CommandComponent = CommandComponent;

var FileComponent = (function (_super) {
    __extends(FileComponent, _super);
    function FileComponent(filename) {
        _super.call(this);
        this.type = "file";
        this.filename = filename;
    }
    return FileComponent;
})(Component);
exports.FileComponent = FileComponent;

var GraphComponent = (function (_super) {
    __extends(GraphComponent, _super);
    function GraphComponent(name, description) {
        _super.call(this);
        this.type = "macro";
        this.entryComponent = null;
        this.exitComponent = null;
        this.counter = 0;
        this.components = [];
        this.connections = [];
        this.name = name;
        this.description = description;
    }
    GraphComponent.prototype.setGraphData = function (graphData) {
        this.components = graphData.components;
        this.connections = graphData.connections;
        this.entryComponent = graphData.firstMainComponent;
    };
    return GraphComponent;
})(Component);
exports.GraphComponent = GraphComponent;
//# sourceMappingURL=component.js.map

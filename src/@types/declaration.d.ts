import angular = require("angular")

declare module "angular" {
    interface IRootScopeService {
        $broadcast(name: "Graph::Connector::ResetOfComponent", id: number): angular.IAngularEvent;
        $broadcast(name: "Graph::Connector::UpdateOfComponent",componentId:number, position: Point): angular.IAngularEvent;
        $on(name: "Graph::Connector::ResetOfComponent", listener: (event: angular.IAngularEvent, id: number) => any);
        $on(name: "Graph::Connector::UpdateOfComponent",listener: (event: angular.IAngularEvent, componentId:number, position: Point) => any);
    }
}
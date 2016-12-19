import angular = require("angular")

declare module "angular" {
    interface IRootScopeService {
        //Connector signals 
        $broadcast(name: "Graph::Connector::ResetOfComponent", id: number): angular.IAngularEvent;
        $broadcast(name: "Graph::Connector::UpdateOfComponent",componentId:number, position: Point): angular.IAngularEvent;
        $on(name: "Graph::Connector::ResetOfComponent", listener: (event: angular.IAngularEvent, id: number) => any);
        $on(name: "Graph::Connector::UpdateOfComponent",listener: (event: angular.IAngularEvent, componentId:number, position: Point) => any);

        //Create Component Pop up signals
        $broadcast(name: "createComponentPopup::show",event, startNode: number, startPort: string, endNode: number, endPort: string );
        $on(name: "createComponentPopup::show",listener: (event: angular.IAngularEvent, pointerEvent, startNode: number, startPort: string, endNode: number, endPort: string) => any);

        //minimap signals
        $broadcast(name: "Graph::Minimap::UpdateViewPort", viewport: IViewBox);
        $on(name: "Graph::Minimap::UpdateViewPort", listener: (event, viewport: IViewBox) => any);

        //edge popup signals
        $broadcast(name:"Graph::Popup::SetEdgePopup", position: IPoint, target: string, index: number);
        $on(name:"Graph::Popup::SetEdgePopup", listener: (event, position: IPoint, target: string, index: number) => void);
        $broadcast(name:"Graph::Popup::CloseEdgePopup");
        $on(name:"Graph::Popup::CloseEdgePopup", listener: () => void);


        //Component signals
        $broadcast(name:"Graph::Component::UpdatePorts");
        $on(name:"Graph::Component::UpdatePorts", listener: () => void)
        $broadcast(name:"Graph::Component::Collapse");
        $on(name:"Graph::Component::Collapse", listener: () => void)
        $broadcast(name:"Graph::Component::Uncollapse");
        $on(name:"Graph::Component::Uncollapse", listener: () => void)
    }
}
import * as app from "../../app.module"

interface PopupArea extends angular.IScope {
    EdgePopupClose: () => void;
    EdgePopupRemovePipe: (pipe: number) => void;
    readonly edgePopups: any[]
}


interface EdgePopup {
    x: number,
    y: number,
    transform: string,
    id: string,
    index: number
}

app.directive("popupArea", () => ({
    require: 'port',
    restrict: 'A',
    priority: 2,
    template: require("./popup-area.html"),
    link: function (scope: PopupArea, element, attr) {
        const edgePopups = [];
        (scope as any).edgePopups = edgePopups;

        scope.$on("Graph::Popup::SetEdgePopup", (event, position: IPoint, target: string, index: number) => {
            setEdgePopup(position, target, index); 
        });
        scope.$on("Graph::Popup::CloseEdgePopup", EdgePopupClose); 
        function setEdgePopup(position: IPoint, target: string, index: number) {
            const {x, y} = position;
            const data: EdgePopup = {
                x,y,index, id: target, 
                transform: `translate(${x}px,${y}px)`,
            }

            if (edgePopups.length == 0) {
                edgePopups.push(data);
            } else {
                edgePopups[0] = data;
            }
        }

        scope.EdgePopupRemovePipe = EdgePopupRemovePipe
        function EdgePopupRemovePipe(id) {
            scope.$emit('removePipe',{id})
            EdgePopupClose();
        }
        scope.EdgePopupClose = EdgePopupClose
        function EdgePopupClose() {
            edgePopups.length = 0;
        }
    }
}));

import * as app from "../app.module"
import {SocketService} from "../socket.service"

interface TextLine {
    text: string
    type: string
}

app.directive("terminal", [function () {
    return {
        restrict: "A",
        scope: true,
        link: function (scope: angular.IScope, element: JQuery, attr: angular.IAttributes) {
            const shellText: TextLine[] = []
            function addLines(lines: TextLine[]){
                shellText.push(...lines)
                const htmlToAppend = lines.map(line => `<pre class="${line.type}">${line.text}</pre>`).join('');
                element.append(htmlToAppend);
                if(shellText.length > 100){
                    $(`pre:lt(${shellText.length - 100})`).remove();
                    shellText.splice(0, shellText.length - 100)
                }
            }

            function addText(data:string, type: string ){
                addLines(data.split('\n').map(line => { return { text: line, type } }));
            }

            scope.$on("Terminal::AddLines", (event, params) => addLines(params));

            SocketService.socket.on('commandCall', (data: string) => addText(data, "call"));
            SocketService.socket.on('stdout', (data: string) => addText(data, "info"));
            SocketService.socket.on('stderr', (data: string) => addText(data, "error"));
            SocketService.socket.on('retcode', (data: string) => addLines([{text: "command finished with code " + data,type: "call"}]));
        }
    }
}]);

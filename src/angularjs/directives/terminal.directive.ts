import * as app from "../app.module"


interface TipScope extends angular.IScope {
    shellText: TextLine[]
}

interface TextLine {
    text: string
    type: string
}


declare var io

app.directive("terminal", [function () {
    return {
        restrict: "A",
        scope: true,
        template: '<pre ng-repeat="line in shellText" ng-class="line.type" ng-bind="line.text"></pre>',
        link: function (scope: TipScope, element: JQuery, attr: angular.IAttributes) {
            const shellText: TextLine[] = []
            scope.shellText = shellText;

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

            io.socket.on('commandCall', (data: string) => addText(data, "call"));
            io.socket.on('stdout', (data: string) => addText(data, "info"));
            io.socket.on('stderr', (data: string) => addText(data, "error"));
            io.socket.on('retcode', (data: string) => addLines([{text: "command finished with code " + data,type: "call"}]));
        }
    }
}]);

export = { init: function () { } }

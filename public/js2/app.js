/**
  gets the first supported proprieties in CSS
  used to resolve prefixes

  @param {Array.<string>} proparray - a list of arrays
  @return{string} the supported proprierty
*/
(function(){
  var cssTransform, isImplemented, SelectionOptions, app;
  function getCSSSupportedProp(proparray){
    var root, i$, len$, i;
    root = document.documentElement;
    for (i$ = 0, len$ = proparray.length; i$ < len$; ++i$) {
      i = proparray[i$];
      if (i in root.style) {
        return i;
      }
    }
  }
  cssTransform = getCSSSupportedProp(['transform', 'WebkitTransform', 'MozTransform']);
  isImplemented = function(data){
    return ['cat', 'grep', 'bunzip2', 'bzcat', 'bzip2', 'compress', 'ls', 'gzip', 'gunzip', 'zcat'].indexOf(data.exec) >= 0;
  };
  SelectionOptions = shellParser.VisualSelectorOptions;
  console.log("SelectionOptions");
  console.log(SelectionOptions);
  app = angular.module('report', []);
  app.controller('examples', function($scope){
    var examples, results, res$, i$, len$, index, example, AST, visualData, x$;
    $scope.options = SelectionOptions;
    examples = [
      {
        title: "ls",
        command: "ls -BartIsaCoolGuy"
      }, {
        title: "cat",
        command: "cat -s -A cat.txt grep.txt"
      }, {
        title: "grep",
        command: "grep -E ola my.txt"
      }, {
        title: "bzip2",
        command: "bzip2 file1.txt"
      }, {
        title: "bzcat",
        command: "bzcat file1.txt.bz2"
      }, {
        title: "bunzip2",
        command: "bunzip2 file1.txt.bz2"
      }, {
        title: "ls2",
        command: "ls -BartI saCoolGuy"
      }, {
        title: "gzip",
        command: "gzip file1.txt.gz"
      }, {
        title: "gunzip",
        command: "gunzip file1.txt.gz"
      }, {
        title: "zcat",
        command: "zcat file1.txt.gz"
      }, {
        title: "compress",
        command: "compress file1.txt.gz"
      }
    ];
    res$ = [];
    for (i$ = 0, len$ = examples.length; i$ < len$; ++i$) {
      index = i$;
      example = examples[i$];
      AST = shellParser.generateAST(example.command);
      visualData = shellParser.parseAST(AST);
      AST = JSON.stringify(AST, undefined, 2);
      res$.push({
        id: index,
        title: example.title,
        command: example.command,
        AST: AST,
        visualData: visualData,
        JSONVisualData: JSON.stringify(visualData, undefined, 2)
      });
    }
    results = res$;
    x$ = $scope;
    x$.TransformResults = results;
    x$.tab = results[0].id;
    x$.updateTab = function(id){
      return $scope.tab = id;
    };
    x$.isImplemented = isImplemented;
    return x$;
  });
  app.controller('visual2text', function($scope){
    var examples, results, i$, len$, i, example, AST, visualData;
    $scope.updateTab = function(id){
      return $scope.tab = id;
    };
    $scope.isImplemented = isImplemented;
    $scope.options = SelectionOptions;
    examples = [
      {
        title: 'cat',
        command: 'cat -s -A cat.txt grep.txt'
      }, {
        title: 'grep',
        command: 'grep -E "we are the champions" queens_lyrics.txt'
      }
    ];
    results = [];
    $scope.TransformResults = results;
    for (i$ = 0, len$ = examples.length; i$ < len$; ++i$) {
      i = i$;
      example = examples[i$];
      example = examples[i];
      AST = shellParser.generateAST(example.command);
      visualData = shellParser.parseAST(AST);
      results.push({
        id: i,
        title: example.title,
        command: example.command,
        visualData: visualData,
        JSONVisualData: JSON.stringify(visualData, void 8, 2)
      });
      (fn$.call(this, i, i, example));
    }
    return $scope.tab = results[0].id;
    function fn$(indx, i, example){
      $scope.$watch("TransformResults[" + indx + "].visualData.components", function(newValue){
        var x$;
        x$ = $scope.TransformResults[indx];
        x$.command = shellParser.parseComponent(newValue[0]);
        x$.JSONVisualData = JSON.stringify(newValue, void 8, 2);
        return console.log('!!!');
      }, true);
    }
  });
  app.controller('ASTTester', function($scope){
    var tests, testResults, res$, i$, len$, index, test, ast, results, res1$, j$, ref$, len1$, assert, result;
    $scope.updateTab = function(id){
      return $scope.tab = id;
    };
    tests = [
      {
        title: "basic test",
        command: "cat -s -A file1.txt file2.txt",
        asserts: ['equals(ast.length,1) // ast is the result of the AST tree', 'equals(ast[0].exec,"cat")', 'equals(ast[0].args,["-s","-A","file1.txt","file2.txt"])']
      }, {
        title: "failure test",
        command: "cat -s -A file1.txt file2.txt",
        asserts: ['equals(ast[0].exec,"catt")     // should fail', 'equals(ast[0].exec,"cat")                                // should pass', 'equals(ast[0].args,["-s","-A","file1.txt"])              // should fail', 'equals(ast[0].args,["-s","-A","file1.txt","file2.txt"])  // should pass']
      }, {
        title: "redirection",
        command: "grep line < file1.txt > file2.txt 2> file3.txt &> file4.txt",
        asserts: ['equals(ast[0].exec,"grep")', 'equals(ast[0].args[1],["inFrom","file1.txt"])', 'equals(ast[0].args[2],["outTo","file2.txt"])', 'equals(ast[0].args[3],["errTo","file2.txt"])', 'equals(ast[0].args[4],["out&errTo","file2.txt"])']
      }, {
        title: "quoted arguments",
        command: "cat \"in a galaxy.txt\" 'far far away.txt'",
        asserts: ['equals(ast[0].exec,"cat")', 'equals(ast[0].args,["in a galaxy.txt","far far away.txt"])']
      }, {
        title: "process substitution output",
        command: "tee >(grep line2 > file1.txt) >(grep line > file2.txt)",
        asserts: ['equals(ast[0].exec,"tee")', 'equals(ast[0].args[0][0],"outToProcess")', 'equals(ast[0].args[1][0],"outToProcess")']
      }, {
        title: "process substitution input",
        command: "diff <(zcat file1.txt.gz) <(zcat file2.txt.gz)",
        asserts: ['equals(ast[0].exec,"diff")', 'equals(ast[0].args[0][0],"inFromProcess")', 'equals(ast[0].args[1][0],"inFromProcess")']
      }, {
        title: "pipes",
        command: "cat file1.txt | grep line",
        asserts: ['equals(ast.length,2)', 'equals(ast[0].exec,"cat")', 'equals(ast[1].exec,"grep")', 'equals(ast[0].args,["file1.txt"])', 'equals(ast[1].args,["line"])']
      }, {
        title: "complex command",
        command: "ls parser/commands/dev/   | parallel 'find parser/commands/dev/{} -newer parser/commands/v/{.}.js' | parallel 'basename {}'",
        asserts: ['equals(ast.length,3)', 'equals(ast[0].exec,"ls")', 'equals(ast[1].exec,"parallel")', 'equals(ast[2].exec,ast[1].exec)', 'equals(ast[0].args,["parser/commands/dev/"])', 'equals(ast[1].args,["find parser/commands/dev/{} -newer parser/commands/v/{.}.js"])', 'equals(ast[2].args,["basename {}"])']
      }
    ];
    res$ = [];
    for (i$ = 0, len$ = tests.length; i$ < len$; ++i$) {
      index = i$;
      test = tests[i$];
      ast = shellParser.generateAST(test.command);
      res1$ = [];
      for (j$ = 0, len1$ = (ref$ = test.asserts).length; j$ < len1$; ++j$) {
        assert = ref$[j$];
        result = new Function('ast', 'equals', 'return ' + assert)(angular.copy(ast), angular.equals);
        res1$.push({
          command: assert,
          result: result,
          'class': result === true ? 'passed' : 'failed'
        });
      }
      results = res1$;
      res$.push({
        id: index,
        title: test.title,
        command: test.command,
        ast: JSON.stringify(ast, void 8, 2),
        results: results
      });
    }
    testResults = res$;
    $scope.testResults = testResults;
    return $scope.tab = testResults[0].id;
  });
  app.controller('ast-playground', function($scope){
    $scope.builder = {
      code: '',
      result: '',
      error: false
    };
    return $scope.generateAST = function(){
      var builder, err;
      builder = $scope.builder;
      if (builder.code === '') {
        return builder.result = '';
      }
      try {
        builder.result = JSON.stringify(shellParser.generateAST(builder.code), void 8, 2);
        return builder.error = false;
      } catch (e$) {
        err = e$;
        builder.error = true;
        return builder.result = 'compilation error \n' + err.message.split('\n').slice(1, 3).join('\n');
      }
    };
  });
  app.controller('visual-playground', function($scope){
    var emptyresult, x$, translateX, translateY, startX, startY, elembuilder, mousemove, mouseup;
    emptyresult = {
      components: [],
      connections: []
    };
    $scope.generateAST = function(){
      var builder, err;
      builder = $scope.builder;
      if (builder.code === '') {
        return builder.result = false;
      }
      try {
        builder.result = shellParser.parseCommand(builder.code);
        console.log($scope.builder);
        return builder.error = false;
      } catch (e$) {
        err = e$;
        builder.error = 'compilation error \n' + err.stack;
        builder.result = emptyresult;
        throw err;
      }
    };
    x$ = $scope;
    x$.screenHeight = window.screen.availHeight;
    x$.options = SelectionOptions;
    x$.isImplemented = isImplemented;
    x$.builder = {
      code: 'cat <( cat<(grep txt) <(grep t2) ) <(grep 2) <(grep 2)',
      result: '',
      error: false
    };
    translateX = 0;
    translateY = 0;
    startX = 0;
    startY = 0;
    elembuilder = document.querySelector(".playGround .visual-builder");
    angular.element(elembuilder).bind("pointerdown", function(event){
      var targetTag, pointerId, x$;
      targetTag = event.target.tagName;
      if (pointerId || (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'LABEL')) {
        return;
      }
      pointerId = event.pointerId;
      x$ = angular.element(document);
      x$.bind("pointermove", mousemove);
      x$.bind("pointerup", mouseup);
      startX = event.screenX;
      startY = event.screenY;
      event.preventDefault();
      event.stopPropagation();
    });
    mousemove = function(event){
      var i$, ref$, len$, elem;
      translateX = event.screenX - startX;
      translateY = event.screenY - startY;
      startX = event.screenX;
      startY = event.screenY;
      for (i$ = 0, len$ = (ref$ = elembuilder.querySelectorAll(".component")).length; i$ < len$; ++i$) {
        elem = ref$[i$];
        angular.element(elem).scope().moveTo(translateX, translateY);
      }
      for (i$ = 0, len$ = (ref$ = elembuilder.querySelectorAll("svg path")).length; i$ < len$; ++i$) {
        elem = ref$[i$];
        angular.element(elem).scope().update();
      }
      $scope.$digest();
    };
    mouseup = function(){
      var pointerId, x$;
      pointerId = 0;
      x$ = angular.element(document);
      x$.unbind("pointermove", mousemove);
      x$.unbind("pointerup", mouseup);
      return x$;
    };
    return $scope.generateAST();
  });
  app.controller('data-flow', function($scope){
    var connectors, examples, results, res$, i$, len$, index, example, AST, visualData, translateX, translateY, startX, startY, x$;
    $scope.options = SelectionOptions;
    connectors = [];
    examples = [
      {
        title: "single",
        command: "ls -BartIsaCoolGuy"
      }, {
        title: "process substitution",
        command: "cat <(grep 2004 events.txt) <(grep 1958 ye_olde_events.txt)"
      }, {
        title: "process substitution tree",
        command: "cat <( cat<(grep txt) <(grep t2) ) <(grep 2) <(grep 2)"
      }, {
        title: "pipe",
        command: "grep 2004 | cat uselessUseOfCat.txt | cat | cat | cat | cat"
      }
    ];
    res$ = [];
    for (i$ = 0, len$ = examples.length; i$ < len$; ++i$) {
      index = i$;
      example = examples[i$];
      AST = shellParser.generateAST(example.command);
      visualData = shellParser.parseAST(AST);
      connectors.push(visualData.connections);
      delete visualData.connections;
      AST = JSON.stringify(AST, undefined, 2);
      res$.push({
        id: index,
        title: example.title,
        command: example.command,
        AST: AST,
        visualData: visualData,
        JSONVisualData: JSON.stringify(visualData, undefined, 2)
      });
    }
    results = res$;
    translateX = 0;
    translateY = 0;
    startX = 0;
    startY = 0;
    requestAnimationFrame(function(){
      var elembuilders, i$, len$, index, elembuild;
      elembuilders = document.querySelectorAll(".visual-builder.data-flow");
      console.log(document.querySelectorAll(".visual-builder"));
      console.log(connectors);
      for (i$ = 0, len$ = elembuilders.length; i$ < len$; ++i$) {
        index = i$;
        elembuild = elembuilders[i$];
        $scope.TransformResults[index].visualData.connections = connectors[index];
        (fn$.call(this, elembuild, index, elembuild));
      }
      $scope.$digest();
      return console.log($scope.TransformResults);
      function fn$(elembuilder, index, elembuild){
        var mousemove, mouseup;
        angular.element(elembuilder).bind("pointerdown", function(event){
          var targetTag, pointerId, x$;
          targetTag = event.target.tagName;
          if (pointerId || (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'LABEL')) {
            return;
          }
          pointerId = event.pointerId;
          x$ = angular.element(document);
          x$.bind("pointermove", mousemove);
          x$.bind("pointerup", mouseup);
          startX = event.screenX;
          startY = event.screenY;
          event.preventDefault();
          event.stopPropagation();
        });
        mousemove = function(event){
          var i$, ref$, len$, elem;
          translateX = event.screenX - startX;
          translateY = event.screenY - startY;
          startX = event.screenX;
          startY = event.screenY;
          for (i$ = 0, len$ = (ref$ = elembuilder.querySelectorAll(".component")).length; i$ < len$; ++i$) {
            elem = ref$[i$];
            angular.element(elem).scope().moveTo(translateX, translateY);
          }
          for (i$ = 0, len$ = (ref$ = elembuilder.querySelectorAll("svg path")).length; i$ < len$; ++i$) {
            elem = ref$[i$];
            angular.element(elem).scope().update();
          }
          $scope.$digest();
        };
        mouseup = function(){
          var pointerId, x$;
          pointerId = 0;
          x$ = angular.element(document);
          x$.unbind("pointermove", mousemove);
          x$.unbind("pointerup", mouseup);
          return x$;
        };
      }
    });
    x$ = $scope;
    x$.TransformResults = results;
    x$.screenHeight = window.screen.availHeight;
    x$.tab = results[0].id;
    x$.updateTab = function(id){
      return $scope.tab = id;
    };
    x$.isImplemented = isImplemented;
    return x$;
  });
  app.directive("connector", function($document){
    return {
      scope: true,
      link: function(scope, element, attr){
        var Startnode, StartPort, Endnode, EndPort, childOffset1, childOffset2, startPosition, endPosition, startComponent, endComponent, resultScope, dataedge, elem, graphElement, setEdgePath, i$, ref$, len$, component, update;
        resultScope = scope;
        while (!resultScope.hasOwnProperty("visualData") && resultScope !== scope.$root) {
          resultScope = resultScope.$parent;
        }
        dataedge = scope.$parent.edge;
        elem = element[0];
        graphElement = elem.parentElement.parentElement;
        setEdgePath = function(iniX, iniY, endX, endY){
          var xpoint;
          xpoint = (endX - iniX) / 4;
          return elem.setAttribute('d', "M " + iniX + " " + iniY + " H " + (iniX + 0.5 * xpoint) + " C " + (iniX + 2 * xpoint) + "," + iniY + " " + (iniX + xpoint * 2) + "," + endY + " " + (iniX + xpoint * 4) + "," + endY + " H " + endX);
        };
        for (i$ = 0, len$ = (ref$ = resultScope.visualData.components).length; i$ < len$; ++i$) {
          component = ref$[i$];
          if (component.id === dataedge.startNode) {
            startComponent = component;
            startPosition = component.position;
            break;
          }
        }
        for (i$ = 0, len$ = (ref$ = resultScope.visualData.components).length; i$ < len$; ++i$) {
          component = ref$[i$];
          if (component.id === dataedge.endNode) {
            endComponent = component;
            endPosition = component.position;
            break;
          }
        }
        update = function(){
          return setEdgePath(startPosition.x + childOffset1.left, startPosition.y + childOffset1.top, endPosition.x + childOffset2.left, endPosition.y + childOffset2.top);
        };
        scope.update = update;
        scope.updateWithId = function(id){
          if (dataedge.startNode === id || dataedge.endNode === id) {
            update();
          }
        };
        requestAnimationFrame(function(){
          Startnode = document.querySelector(".playGround .nodes .component[data-node-id='" + dataedge.startNode + "']");
          StartPort = Startnode.querySelector(".box[data-port='" + dataedge.startPort + "']");
          Endnode = document.querySelector(".playGround .nodes .component[data-node-id='" + dataedge.endNode + "']");
          EndPort = Endnode.querySelector(".box[data-port='" + dataedge.endPort + "']");
          childOffset1 = {
            top: StartPort.offsetTop + StartPort.offsetHeight * 0.75,
            left: StartPort.offsetLeft
          };
          childOffset2 = {
            top: EndPort.offsetTop + EndPort.offsetHeight,
            left: EndPort.offsetLeft
          };
          return update();
        });
      }
    };
  });
  app.directive("component", function($document){
    var pointerId;
    pointerId = 0;
    return {
      scope: true,
      link: function(scope, element, attr){
        var datanode, startX, startY, title, position, elem, imstyle, mousemove, moveTo, mouseup;
        scope.transform = cssTransform.replace(/[A-Z]/g, function(v){
          return "-" + v.toLowerCase();
        });
        datanode = scope.$parent.data;
        startX = 0;
        startY = 0;
        title = datanode.title;
        position = datanode.position;
        elem = element[0];
        imstyle = elem.style;
        scope.moveTo = function(newX, newY){
          position.x += newX;
          position.y += newY;
        };
        element.bind("pointerdown", function(event){
          var targetTag, pointerId, x$;
          targetTag = event.target.tagName;
          if (pointerId || (targetTag === 'INPUT' || targetTag === 'SELECT' || targetTag === 'LABEL')) {
            return;
          }
          pointerId = event.pointerId;
          x$ = $document;
          x$.bind("pointermove", mousemove);
          x$.bind("pointerup", mouseup);
          startX = event.screenX;
          startY = event.screenY;
          event.preventDefault();
          event.stopPropagation();
        });
        mousemove = function(event){
          moveTo(event.screenX - startX, event.screenY - startY);
          startX = event.screenX;
          startY = event.screenY;
        };
        moveTo = function(newX, newY){
          var i$, ref$, len$, el;
          position.x += newX;
          position.y += newY;
          scope.$digest();
          for (i$ = 0, len$ = (ref$ = elem.parentElement.parentElement.querySelectorAll("svg path")).length; i$ < len$; ++i$) {
            el = ref$[i$];
            angular.element(el).scope().updateWithId(datanode.id);
          }
        };
        mouseup = function(){
          var pointerId, x$;
          pointerId = 0;
          x$ = $document;
          x$.unbind("pointermove", mousemove);
          x$.unbind("pointerup", mouseup);
          return x$;
        };
      }
    };
  });
}).call(this);

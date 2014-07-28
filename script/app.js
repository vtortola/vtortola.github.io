angular.module('myApp', [])

.controller('consoleController', function ($scope) {
    $scope.result = [
        { type: 'text', text: 'Welcome', breakLine:true },
    ];

    $scope.commandLine = '';
    $scope.prompt = '\\:>';

    function addLine(textline, lineType) {
        $scope.result.push({ text: textline, type: 'text' });
    }
        
    $scope.keypress= function (keyCode) {
        if ($scope.commandLine.length < 20) {
            $scope.commandLine += String.fromCharCode(keyCode);
            $scope.$apply();
        }
    };

    $scope.keyup= function (keyCode) {

        if (keyCode == 13) {
            addLine($scope.prompt + $scope.commandLine);
            addLine('This feature is still in development :)', 'result-line-server');
            $scope.commandLine = '';
            $scope.$apply();
        }
        else if (keyCode == 8) {
            if ($scope.commandLine) {
                $scope.commandLine = $scope.commandLine.substring(0, $scope.commandLine.length - 1);
                $scope.$apply();
            }
        }
    };
})


.directive('resultLine', function () {
    return {
        restrict: 'E',
        template: "<p class='result-line'>{{item.text}}</p>",
        link: function (scope, element, attrs, controller) {
            
        }
    }
})

.directive('console', function () {
    return {
        restrict: 'E',
        controller: 'consoleController',
        template: "<section class='console'><div id='results'><result-line ng-repeat='item in result'></result-line><span class='prompt'>{{prompt}}</span><span class='console-input'>{{commandLine}}</span><span class='cursor'>_</span></section>",
        link: function (scope, element, attrs, controller) {
            
            var console = angular.element(element[0].querySelector('.console'));
            var results = angular.element(element[0].querySelector('.results'));
            var prompt = angular.element(element[0].querySelector('.prompt'));
            var cursor = angular.element(element[0].querySelector('.cursor'));
            var consoleInput = angular.element(element[0].querySelector('.console-input'));

            setInterval(function () {
                cursor.toggleClass('cursor-hidden');
            }, 500);

            document.addEventListener("keypress", function (e) {
                scope.keypress(e.keyCode);
            });

            document.addEventListener("keyup", function (e) {
                scope.keyup(e.keyCode);
            });

            scope.$watchCollection('result', function () {
                console[0].scrollTop = console[0].scrollHeight;
            });

            scope.$watch('commandLine');
        }
    }
})
;
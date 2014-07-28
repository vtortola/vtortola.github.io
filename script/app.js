angular.module('myApp', ['vtortola-ng-console'])

.controller('console', function ($scope) {
    setTimeout(function () {
        $scope.$broadcast('console-output', { output: true, text: ['Welcome to vtortola.GitHub.io','Please type help for a list of commands'], breakLine: true });
        $scope.$apply();
    }, 100);

    $scope.$on('console-input', function (e, cinput) {
        var command = cinput[0];
        switch (command) {
            case 'ver':
            case 'version':
                $scope.$broadcast('console-output', { output: true, text: ['Version 0.1Beta'], breakLine: true });
                break;

            case 'help':
                $scope.$broadcast('console-output', { output: true, text: ['No commands are avaiable', 'This app is still in development:)'], breakLine: true });
                break;

            default:
                $scope.$broadcast('console-output', { output: true, text: ['There is no such command'], breakLine: true });
                break;
        }
        
    });
});


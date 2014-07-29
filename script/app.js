angular.module('myApp', ['vtortola-ng-console'])

.controller('console', function ($scope) {
    setTimeout(function () {
        $scope.$broadcast('console-output', { output: true, text: ['Welcome to vtortola.GitHub.io', 'This is a terminal prototype, still in development.' , '','Please type help for a list of commands'], breakLine: true });
        $scope.$apply();
    }, 100);

    $scope.$on('console-input', function (e, cinput) {
        var command = cinput[0];
        var parts = command.split(' ');
        if (parts.length < 1)
            return;

        switch (parts[0]) {
            case 'ver':
            case 'version':
                $scope.$broadcast('console-output', { output: true, text: ['Version 0.1 Beta'], breakLine: true });
                break;

            case 'help':
                $scope.$broadcast('console-output', { output: true, text: ['Avaiable commands:', '  help', '  version', '  echo'], breakLine: true });
                break;

            case 'echo':
                var echoed = parts.slice(1).join(' ');
                echoed = echoed ? echoed : '';
                $scope.$broadcast('console-output', { output: true, text: [echoed], breakLine: true });
                break;

            default:
                $scope.$broadcast('console-output', { output: true, text: ['There is no such command'], breakLine: true });
                break;
        }
        
    });
});


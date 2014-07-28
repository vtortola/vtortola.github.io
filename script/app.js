angular.module('myApp', ['vtortola-ng-console'])

.controller('console', function ($scope) {
    setTimeout(function () {
        $scope.$broadcast('console-output', { output: true, text: ['Welcome to vtortola.GitHub.io','Please type help for a list of commands'], breakLine: true });
        $scope.$apply();
    }, 100);

    $scope.$on('console-input', function (e) {

        $scope.$broadcast('console-output', { output: true, text: ['Welcome to vtortola.GitHub.io','lala'], breakLine: true });
    });
});


angular.module('myApp', ['vtortola-ng-console'])

.service('$ga', function () {
    (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        },
        i[r].l = 1 * new Date();
        a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
    })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

    ga('create', 'UA-53263543-1', 'auto');
    ga('send', 'pageview');
    return function () { return window.ga; };
})

.controller('console', function ($scope, $ga) {
    setTimeout(function () {
        $scope.$broadcast('console-output', { output: true, text: ['Welcome to vtortola.GitHub.io', 'This is a terminal prototype, still in development.' , '','Please type help for a list of commands'], breakLine: true });
        $scope.$apply();
    }, 100);

    $scope.$on('$viewContentLoaded', function (event) {
        $window._gaq.push(['_trackPageview', $location.path()]);
    });

    $scope.$on('console-input', function (e, cinput) {

        $ga()('send', 'event', 'Console', 'Input', cinput[0]);

        var command = cinput[0];
        var parts = command.split(' ');
        if (parts.length < 1)
            return;

        var output = [];

        switch (parts[0]) {
            case 'ver':
            case 'version':
                output.push({ output: true, text: ['Version 0.1 Beta'], breakLine: true });
                break;

            case 'help':
                output.push({
                    output: true,
                    text: ['Avaiable commands:',
                           '\thelp :\t\tShows this help.',
                           '\tversion :\tEchoes this software version.',
                           '\techo <input> :\tEchoes a given input.',
                           '\teval <input> :\tExecute the given input as Javascript and prints the result.'],
                    breakLine: true
                });
                break;

            case 'echo':
                var echoed = parts.slice(1).join(' ');
                echoed = echoed ? echoed : '';
                output.push({ output: true, text: [echoed], breakLine: true });
                break;

            case 'eval':
                var js = parts.slice(1).join(' ');
                js = js ? js : '';
                js = eval(js);
                js = js? js.toString():'';
                output.push({ output: true, text: [js], breakLine: true });
                break;

            default:
                output.push({ output: true, text: ['There is no such command'], breakLine: true });
                break;
        }

        for (var i = 0; i < output.length; i++) {
            $ga()('send', 'event', 'Console', 'Output', JSON.stringify(output[i]));
            $scope.$broadcast('console-output',output[i]);
        }
        
    });
});


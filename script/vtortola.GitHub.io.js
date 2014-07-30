angular.module('vtortola.GitHub.io', ['vtortola-ng-terminal'])

.provider('$ga', function () {

    window['GoogleAnalyticsObject'] = 'ga';
    window['ga'] = window['ga'] || function () { (window['ga'].q = window['ga'].q || []).push(arguments)}
    window['ga'].l = 1 * new Date();
    var script = document.createElement('script');
    var prevScript = document.getElementsByTagName('script')[0];
    script.async = 1;
    script.src = '//www.google-analytics.com/analytics.js';
    prevScript.parentNode.insertBefore(script, prevScript);

    var provider = function () {
        var me = {};

        me.$get = function () {
            ga('send', 'pageview');
            return function () {                
                return window.ga.apply(window, arguments);
            }
        };

        me.ga = function () {
                return window.ga.apply(window, arguments);
        };

        return me;
    };

    return provider();
})

.provider('commandLineSplitter', function () {
    var provider = function () {
        var me = {};
        var brackets = ['{', '}'];
        brackets.keep = true;
        me.separators = [['"'], ["'"], brackets];

        var isOpener = function (c) {
            var suitableOpeners = me.separators.filter(function (item) { return item[0] == c; });
            if (suitableOpeners.length > 1)
                throw new Error("Opening tag in multiple pairs: " + c);
            else if (suitableOpeners.length == 0)
                return null;
            else {
                return suitableOpeners[0];
            }
        };

        me.$get = function () {
            return {
                split: function (input) {
                    var parts = [];
                    var part = '';
                    var currentOc = null;
                    for (var i = 0; i < input.length; i++) {
                        var c = input[i];

                        if (c == ' ' && !currentOc) {
                            parts.push(part);
                            part = '';
                            continue;
                        }
                        
                        if (currentOc && currentOc[currentOc.length-1] == c) {
                            if (i != input.length - 1 && input[i + 1] != ' ')
                                throw new Error("An closing tag can only appear at the end of a sentence or before a space.");

                            if (currentOc.keep)
                                part += c;

                            parts.push(part);
                            part = '';
                            currentOc = null;
                            continue;
                        }

                        var oc = currentOc?null:isOpener(c);

                        if (oc) {
                            if (i != 0 && input[i - 1] != ' ')
                                throw new Error("An opening tag can only appear at the beggining of a sentence or after a space.");

                            currentOc = oc;
                            if (currentOc.keep)
                                part += c;
                            continue;
                        }
                        
                        part += c;

                    }
                    if (part)
                        parts.push(part);
                    return parts;
                }
            };
        };
        return me;
    }

    return provider();
})

.provider('commandBroker', function () {
    
    var provider = function () {
        var me = {};
        var handlers = [];

        me.$get = ['$injector', 'commandLineSplitter', function ($injector, commandLineSplitter) {
            return {
                execute: function (session, consoleInput) {

                    var parts = commandLineSplitter.split(consoleInput);

                    var suitableHandlers = handlers.filter(function(item){
                        return item.command == parts[0].toLowerCase();
                    });

                    if (suitableHandlers.length == 0)
                        throw new Error("There is no suitable handler for that command.");

                    var h = suitableHandlers[0];

                    if (h.init)
                        $injector.invoke(h.init);

                    parts[0] = session;
                    h.handle.apply(h, parts);
                }
            }
        }];

        me.appendCommandHandler = function (handler) {
            if (!handler || !handler.command || !handler.handle || !handler.description)
                throw new Error("Invalid command handler");

            var suitableHandlers = handlers.filter(function (item) {
                return item.command == handler.command;
            });

            if (suitableHandlers.length != 0)
                throw new Error("There is already a handler for that command.");

            handlers.push(handler);
        };

        me.describe = function () {
            return handlers.map(function (item) { return { command: item.command, description: item.description }; });
        };

        return me;
    };

    return provider();
})

.controller('console',['$scope','$ga','commandBroker', function ($scope, $ga, commandBroker) {

    setTimeout(function () {
        $scope.$broadcast('terminal-output', {
            output: true,
            text: ['Welcome to vtortola.GitHub.io',
                   'This is a terminal prototype in development.',
                   '',
                   "Please type 'help' to open a list of commands"],
            breakLine: true
        });
        $scope.$apply();
    }, 100);

    $scope.session = {
        commands: [],
        output: [],
        $scope:$scope
    };

    $scope.$watchCollection('session.commands', function (n) {
        for (var i = 0; i < n.length; i++) {
            $ga('send', 'event', 'Console', 'Command', JSON.stringify(n[i]));
            $scope.$broadcast('terminal-command', n[i]);
        }
        $scope.session.commands.splice(0, $scope.session.commands.length);
        $scope.$$phase || $scope.$apply();
    });

    $scope.$watchCollection('session.output', function (n) {
        for (var i = 0; i < n.length; i++) {
            $ga('send', 'event', 'Console', 'Output', JSON.stringify(n[i]));
            $scope.$broadcast('terminal-output', n[i]);
        }
        $scope.session.output.splice(0, $scope.session.output.length);
        $scope.$$phase || $scope.$apply();
    });

    $scope.$on('$viewContentLoaded', function (event) {
        $ga('send', 'pageview');
    });

    $scope.$on('terminal-input', function (e, consoleInput) {
        var cmd = consoleInput[0];

        $ga('send', 'event', 'Console', 'Input', cmd.command );
        try {
            if ($scope.session.context) {
                $scope.session.context.execute($scope.session, cmd.command);
            }
            else {
                commandBroker.execute($scope.session, cmd.command);
            }
        } catch (err) {
            $scope.session.output.push({ output: true, breakLine: true, text: [err.message, "Please type 'help' to see a list of commands"] });
        }
    });
}])

.config(['$gaProvider',function ($gaProvider) {
    $gaProvider.ga('create', 'UA-53263543-1', 'auto');
    //$gaProvider.ga('create', 'UA-53263543-1', { 'userId': '11' });
    // ga create UA-53263543-1 {"userId":"112"}
}])

.config(['terminalConfigurationProvider', function (terminalConfigurationProvider) {
    terminalConfigurationProvider.setTypeSoundUrl('/type.wav');
    terminalConfigurationProvider.setStartSoundUrl('/start.wav');
}])

;

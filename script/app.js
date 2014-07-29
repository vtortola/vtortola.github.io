angular.module('myApp', ['vtortola-ng-terminal', 'vtortola.github.io.commands'])

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
    return function () {
        return window.ga.apply(window,arguments);
    };
})

.provider('commandBroker', function () {
    
    var provider = function () {
        var me = {};
        var handlers = [];

        me.$get = function () {
            return {
                execute: function (session, consoleInput) {

                    var parts = consoleInput.split(' ');

                    var suitableHandlers = handlers.filter(function(item){
                        return item.command == parts[0].toLowerCase();
                    });

                    if (suitableHandlers.length == 0)
                        throw new Error("There is no suitable handler for that command.");

                    var h = suitableHandlers[0];
                    parts[0] = session;
                    h.handle.apply(h, parts);
                }
            }
        };

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

.service('session', function(){
    return {
        commands: [],
        output:[]
    };
})

.controller('console', function ($scope, $ga, commandBroker, session) {
    setTimeout(function () {
        $scope.$broadcast('console-output', { output: true, text: ['Welcome to vtortola.GitHub.io', 'This is a terminal prototype in development.' , '','Please type help for a list of commands'], breakLine: true });
        $scope.$apply();
    }, 100);

    $scope.$on('$viewContentLoaded', function (event) {
        $window._gaq.push(['_trackPageview', $location.path()]);
    });

    $scope.$on('console-input', function (e, consoleInput) {
        var cmd = consoleInput[0];

        $ga('send', 'event', 'Console', 'Input', cmd.command );
        try {
            commandBroker.execute(session, cmd.command);
        } catch (err) {
            session.output.push({output:true, breakLine:true, text:[err.message]});
        }

        for (var i = 0; i < session.output.length; i++) {
            $ga('send', 'event', 'Console', 'Output', JSON.stringify(session.output[i]));
            $scope.$broadcast('console-output', session.output[i]);
        }
        for (var i = 0; i < session.commands.length; i++) {
            $ga('send', 'event', 'Console', 'Command', JSON.stringify(session.commands[i]));
            $scope.$broadcast('console-command', session.commands[i]);
        }

        session.commands = [];
        session.output = [];
    });
})

.config(function (commandBrokerProvider) {

    commandBrokerProvider.appendCommandHandler({
        command: 'version',
        description: ['Shows this software version'],
        handle: function (session) {
            session.output.push({ output: true, text: ['Version 0.1 Beta'], breakLine: true });
        }
    });

    commandBrokerProvider.appendCommandHandler({
        command: 'clear',
        description: ['Clears the screen'],
        handle: function (session) {
            session.commands.push({ command: 'clear' });
        }
    });

    commandBrokerProvider.appendCommandHandler({
        command: 'echo',
        description: ['Echoes <parameter>'],
        handle: function (session, param) {
            param = !param ? "" : param;
            session.output.push({ output: true, text: [param], breakLine: true });
        }
    });

    commandBrokerProvider.appendCommandHandler({
        command: 'eval',
        description: ['Evaluates <parameter> as Javascript and returns the output'],
        handle: function (session, param) {
            param = !param ? "" : param;
            param = eval(param);
            param = param ? param.toString() : '';
            session.output.push({ output: true, text: [param], breakLine: true });
        }
    });

    //commandBrokerProvider.appendCommandHandler({
    //    command: 'websocket',
    //    description: ['Starts a websocket session to <parameter>'],
    //    handle: function (session) {
    //        session.commands.push({ command: 'startcontext', prompt: 'websocket:/>', contextName: 'websocket' });
    //    }
    //});

    //commandBrokerProvider.appendCommandHandler({
    //    command: 'exit',
    //    description: ['Ends a context'],
    //    handle: function (session) {
    //        if (session.contextName == 'websocket') {
    //            session.commands.push({ command: 'endcontext' });
    //        }
    //    }
    //});

    commandBrokerProvider.appendCommandHandler({
        command: 'help',
        description: ['Provides instructions about how to use this terminal'],
        handle: function (session, cmd) {
            var list = commandBrokerProvider.describe();
            var outText = [];
            if (cmd) {
                for (var i = 0; i < list.length; i++) {
                    if (list[i].command == cmd) {
                        var l = list[i];
                        outText.push("Command help for: " + cmd);
                        for (var j = 0; j < l.description.length; j++) {
                            outText.push(l.description[j]);
                        }
                        break;
                    }
                }
            }
            else {
                outText.push("Available commands:");
                for (var i = 0; i < list.length; i++) {
                    outText.push(" - " + list[i].command);
                }
                outText.push("");
                outText.push("Enter 'help <command>' to get help for a particular command.");
            }
            session.output.push({ output: true, text: outText, breakLine: true });
        }
    });
})

;

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

.service('session', function(){
    return {
        commands: [],
        output:[]
    };
})

.controller('console',['$scope','$ga','commandBroker','session', function ($scope, $ga, commandBroker, session) {
    setTimeout(function () {
        $scope.$broadcast('console-output', { output: true, text: ['Welcome to vtortola.GitHub.io', 'This is a terminal prototype in development.' , '','Please type help for a list of commands'], breakLine: true });
        $scope.$apply();
    }, 100);

    $scope.$on('$viewContentLoaded', function (event) {
        $ga('send', 'pageview');
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
}])

.config(['$gaProvider',function ($gaProvider) {
    //$gaProvider.ga('create', 'UA-53263543-1', 'auto');
    //$gaProvider.ga('create', 'UA-53263543-1', { 'userId': '11' });
    // ga create UA-53263543-1 {"userId":"112"}
}])

.config(['commandBrokerProvider', function (commandBrokerProvider) {

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
        handle: function (session) {
            var a = Array.prototype.slice.call(arguments,1);
            session.output.push({ output: true, text: [a.join(' ')], breakLine: true });
        }
    });

    commandBrokerProvider.appendCommandHandler({
        command: 'eval',
        description: ['Evaluates <parameter> as Javascript and returns the output'],
        handle: function (session, param) {
            var a = Array.prototype.slice.call(arguments, 1);
            var param = eval(a.join(' '));
            param = param ? param.toString() : '';
            session.output.push({ output: true, text: [param], breakLine: true });
        }
    });

    commandBrokerProvider.appendCommandHandler({
        command: 'break',
        description: ['Tests how commands are broken down in segments.'],
        handle: function (session) {
            var a = Array.prototype.slice.call(arguments, 1);
            session.output.push({ output: true, text: a, breakLine: true });
        }
    });

    //commandBrokerProvider.appendCommandHandler({
    //    command: 'websocket',
    //    description: ['Starts a websocket session to <parameter> [protocol]'],
    //    handle: function (session, url, protocol) {
    //        session.output.push({ output: true, text: ["Websocket session opened..."], breakLine: true });
    //        session.commands.push({ command: 'startcontext', prompt: 'websocket:/>' });
    //        session.contextName = "websocket";
    //    }
    //});

    //commandBrokerProvider.appendCommandHandler({
    //    command: 'exit',
    //    description: ['Ends the current context'],
    //    handle: function (session) {
    //        if (session.contextName == 'websocket') {
    //            session.contextName = "";
    //            session.commands.push({ command: 'endcontext' });
    //            session.output.push({ output: true, text: ["Websocket ended."], breakLine: true });
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

    var gaCommandHandler = function () {
        var me = {};
        var _ga = null;
        me.command= 'ga';
        me.description= ['Manipulates Google Analytics'];
        me.init= ['$ga', function($ga){
            _ga=$ga;
        }];
        me.handle= function (session, param) {
            _ga.apply(_ga, Array.prototype.slice.call(arguments, 1));
        }
        return me;
    };
    commandBrokerProvider.appendCommandHandler(gaCommandHandler());
}])

;

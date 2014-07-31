angular.module('vtortola.GitHub.io')

.config(['commandBrokerProvider', function (commandBrokerProvider) {

    commandBrokerProvider.appendCommandHandler({
        command: 'version',
        description: ['Shows this software version.'],
        handle: function (session) {
            session.output.push({ output: true, text: ['Version 0.1 Beta'], breakLine: true });
        }
    });

    commandBrokerProvider.appendCommandHandler({
        command: 'clear',
        description: ['Clears the screen.'],
        handle: function (session) {
            session.commands.push({ command: 'clear' });
        }
    });

    commandBrokerProvider.appendCommandHandler({
        command: 'echo',
        description: ['Echoes input.'],
        handle: function (session) {
            var a = Array.prototype.slice.call(arguments, 1);
            session.output.push({ output: true, text: [a.join(' ')], breakLine: true });
        }
    });

    commandBrokerProvider.appendCommandHandler({
        command: 'eval',
        description: ['Evaluates input as javascript.','Example: eval alert(1)'],
        handle: function (session, param) {
            var a = Array.prototype.slice.call(arguments, 1);
            var param = eval(a.join(' '));
            param = param ? param.toString() : '';
            session.output.push({ output: true, text: [param], breakLine: true });
        }
    });

    commandBrokerProvider.appendCommandHandler({
        command: 'break',
        description: ['Tests how commands are broken down in segments.',"Example: break 'aaa aaa' aaa aaa"],
        handle: function (session) {
            var a = Array.prototype.slice.call(arguments, 1);
            session.output.push({ output: true, text: a, breakLine: true });
        }
    });

    commandBrokerProvider.appendCommandHandler({
        command: 'websocket',
        description: ['Starts a websocket session.',
                      'Syntax: websocket <url> [protocol]',
                      'Example: websocket wss://echo.websocket.org'],
        handle: function (session, url, protocol) {
            if (!url) {
                throw new Error("The parameter 'url' is required, type 'help websocket' to get help.")
            }

            session.output.push({
                output: true,
                text: ["Openning connection to " + url + (protocol ? " with protocol " + protocol : "") + " ...",
                       "Type 'exit' to exit."],
                breakLine: true
            });
            session.commands.push({ command: 'startcontext', prompt: 'websocket:/>' });
            session.contextName = "websocket";
            session.context = function () {
                var me = {};
                var ws = protocol ? new WebSocket(url, protocol) : new WebSocket(url);
                ws.onopen = function () {
                    session.output.push({ output: true, text: ["Connection established."], breakLine: true });
                    session.$scope.$apply();
                };

                ws.onerror = function () {
                    session.output.push({ output: true, text: ["Connection error."], breakLine: true });
                    session.$scope.$apply();
                    me.execute(session, "exit");
                };

                ws.onmessage = function (msg) {
                    session.output.push({ output: true, text: [msg.data], breakLine: true });
                    session.$scope.$apply();
                };

                me.execute = function (s, c) {
                    if (c == 'exit') {
                        ws.close();
                        s.contextName = "";
                        delete s.context;
                        s.commands.push({ command: 'endcontext' });
                        s.output.push({ output: true, text: ["Websocket ended."], breakLine: true });
                        return;
                    }
                    ws.send(c);
                };
                return me;
            }();
        }
    });

    var helpCommandHandler = function () {
        var me = {};
        var list = commandBrokerProvider.describe();
        me.command= 'help';
        me.description= ['Provides instructions about how to use this terminal'];
        me.handle = function (session, cmd) {
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
                    outText.push("  " + list[i].command);
                }
                outText.push("");
                outText.push("Enter 'help <command>' to get help for a particular command.");
            }
            session.output.push({ output: true, text: outText, breakLine: true });
        };
        return me;
    };
    commandBrokerProvider.appendCommandHandler(helpCommandHandler());

    //var gaCommandHandler = function () {
    //    var me = {};
    //    var _ga = null;
    //    me.command = 'ga';
    //    me.description = ['Manipulates Google Analytics'];
    //    me.init = ['$ga', function ($ga) {
    //        _ga = $ga;
    //    }];
    //    me.handle = function (session, param) {
    //        //_ga.apply(_ga, Array.prototype.slice.call(arguments, 1));

    //        ga('set', { userId: '1234' });
    //    }
    //    return me;
    //};
    //commandBrokerProvider.appendCommandHandler(gaCommandHandler());

    var feedbackCommandHandler = function () {
        var me = {};
        var _ga = null;
        me.command = 'feedback';
        me.description = ['Sends a feedback message to the author.'];
        me.init = ['$ga', function ($ga) {
            _ga = $ga;
        }];
        me.handle = function (session, param) {
            var a = Array.prototype.slice.call(arguments, 1);
            var param = a.join(' ');
            _ga('send', 'event', 'Console', 'Feedback', param);
            session.output.push({ output: true, text: ["Your message have been sent.", "Thanks for the feedback!."], breakLine: true });
        }
        return me;
    };
    commandBrokerProvider.appendCommandHandler(feedbackCommandHandler());
}])

;
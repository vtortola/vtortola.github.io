angular.module('vtortola.GitHub.io.command.tools',[])

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
                            if (part)
                                parts.push(part);
                            part = '';
                            continue;
                        }

                        if (currentOc && currentOc[currentOc.length - 1] == c) {
                            if (i != input.length - 1 && input[i + 1] != ' ')
                                throw new Error("An closing tag can only appear at the end of a sentence or before a space.");

                            if (currentOc.keep)
                                part += c;

                            parts.push(part);
                            part = '';
                            currentOc = null;
                            continue;
                        }

                        var oc = currentOc ? null : isOpener(c);

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

                    if (!consoleInput)
                        return;

                    var parts = commandLineSplitter.split(consoleInput);

                    var suitableHandlers = handlers.filter(function (item) {
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

;
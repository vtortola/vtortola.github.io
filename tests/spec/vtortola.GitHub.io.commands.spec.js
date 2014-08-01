describe('vtortola.GitHub.io.commands', function () {

    beforeEach(module('vtortola.GitHub.io.commands',function($provide){
        $provide.value('$ga',function(){});
    }));

    var broker = null;

    beforeEach(inject(['commandBroker', function (commandBroker) {
        broker = commandBroker;
    }]));

    describe('Version', function () {

        it('Clean execution', function () {

            var session = {
                output: [],
                commands: []
            };

            broker.execute(session, "version");
            expect(session.output.length).toEqual(1);
            expect(session.output[0].text[0]).toEqual('Version 0.1 Beta');
        });

    });
});
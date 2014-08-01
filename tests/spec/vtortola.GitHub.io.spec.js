describe('vtortola.GitHub.io', function () {

    beforeEach(module('vtortola.GitHub.io'));

    describe('commandLineSplitter', function () {

        var splitter = null;
        beforeEach(inject(['commandLineSplitter', function (commandLineSplitter) {
            splitter = commandLineSplitter;
        }]));

        it('Simple splitting', function () {
            expect(splitter.split("hello hello")).toEqual(["hello", "hello"]);
            expect(splitter.split("'hello hello'")).toEqual(["hello hello"]);
            expect(splitter.split('"hello hello"')).toEqual(["hello hello"]);
            expect(splitter.split("\"hello '' hello\"")).toEqual(["hello '' hello"]);
            expect(splitter.split('\'hello " hello\'')).toEqual(["hello \" hello"]);
        });

        it('Object splitting', function () {
            expect(splitter.split("{ prop:1 } { prop:2 }")).toEqual(["{ prop:1 }", "{ prop:2 }"]);
            expect(splitter.split("{ prop:'hello hello' } { prop:'hello hello' }")).toEqual(["{ prop:'hello hello' }", "{ prop:'hello hello' }"]);
        });
    });
});
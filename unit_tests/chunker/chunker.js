/**
 * To run tests in this file, use:
 *  gulp unittest --grep Chunker
 */

'use strict';

;(function () {

    let assert = require('assert');
    let fs = require('fs')

    function getChunker () {
        let ChunkManager = require('../../src/js/chunker').ChunkManager;
        let chunker = new ChunkManager();
        return chunker;
    }

    describe('@Chunker', function () {
        beforeEach(function(){
            var data_str = fs.readFileSync(
                "./unit_tests/chunker/data_in.json", {'encoding':'utf8'});
            this.currentTest.chunks_arr = JSON.parse(data_str);
            this.currentTest.chunker = getChunker();
        });

        describe('@CombineVerses', function () {
            it('should make one chunk per chapter', function () {
                var chunker = this.test.chunker;
                var chunks_in = this.test.chunks_arr;
                var chapter_chunks = chunker.makeChapterChunks(chunks_in);
                assert.equal(chapter_chunks.length, 49);
                // TODO: provide output file to compare results with
                // TODO: make sure this.currentTest.chunks_arr is the same as before, 
                //   because we don't want to change the structure of 
                //   what gets saved to the underlying database.
            });
        });

    });

})();

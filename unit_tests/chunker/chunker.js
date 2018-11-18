/**
 * To run tests in this file, use:
 *  gulp unittest --grep Chunker
 */

'use strict';

;(function () {

    let assert = require('assert');
    let fs = require('fs')
    let _ = require('lodash')

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
            it('should make one chunk per chapter', function (done) {
                var chunker = this.test.chunker;
                var chunks_in = this.test.chunks_arr;
                var original_chunks = JSON.parse(JSON.stringify(chunks_in));
                var chapter_chunks = chunker.makeUserChunks(chunks_in);
                //fs.writeFileSync("./unit_tests/chunker/expected_data.json",JSON.stringify(chapter_chunks));
                assert.equal(chapter_chunks.length, 49);

                // Compare resulting chunks with provided expected output
                var expected_data = fs.readFileSync(
                    "./unit_tests/chunker/expected_data_out.json", {'encoding':'utf8'});
                var expected_json = JSON.parse(expected_data);
                if (!_.isEqual(chapter_chunks, expected_json)){
                    console.log(_.isEqual(chapter_chunks, expected_json));
                    throw new Error("Rechunking did not happen as expected.");
                };
                
                // TODO: make sure this.currentTest.chunks_arr is the same as before, 
                //   because we don't want to change the structure of 
                //   what gets saved to the underlying database.
                if(!_.isEqual(chunks_in, original_chunks)){
                    throw new Error("Was not expecting the original chunks array to be modified.");
                };
               done();
            });
        });

    });

})();

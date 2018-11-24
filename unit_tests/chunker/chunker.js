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

        describe('@SplitVerses', function() {
            it('should split a chunk of 4 verses into an array of 4 elements, each element a verse', function(){
                var chunker = this.test.chunker;
                var versesChunk = {
                    "chapter": "02",
                    "chunk": "17",
                    "content": "  <verse number=\"17\" style=\"v\" />আর শিশুটীর বিষয়ে যে সব কথা তাদের বলা হয়েছিল, তারা সেগুলো লোকেদের জানাল ।\n\n  <verse number=\"18\" style=\"v\" />এবং যত লোক মেষপালকদের মুখে ঐ সব কথা শুনলো, সবাই খুবই আশ্চর্য বোধ করলো ।\n\n  <verse number=\"19\" style=\"v\" />কিন্তু মরিয়ম এসব কথা মনে মনে চিন্তা করতে লাগলেন এবং নিজের হৃদয়ে সেগুলো সঞ্চয় করে রাখলেন ।\n\n  <verse number=\"20\" style=\"v\" />আর মেষপালকদের যেমন যেমন বলা হয়েছিল, তারা তেমনই সমস্ত কিছু দেখতে পেয়ে ঈশ্বরের প্রশংসা ও স্তবগান করতে করতে ফিরে গেল ।\n"
                };
                var splitVerses = chunker.splitVerses(versesChunk.content);
                assert.equal(splitVerses.length, 4);
            });
        });

        describe('@MakeUserChunks', function() {
            it('should not combine chapter headings with the first verse of each chapter', function(){
                var chunker = this.test.chunker;
                var chunks = [{
                    "chapter": "02",
                    "chunk": "title",
                    "content": "Chapter 2"
                },
                {
                    "chapter": "02",
                    "chunk": "01",
                    "content": "<para style=\"s\">a</para>\n\n<para style=\"p\">\n\n  <verse number=\"1\" style=\"v\" /> b \n\n  <verse number=\"2\" style=\"v\" /> c \n\n  <verse number=\"3\" style=\"v\" /> c \n"
                },
                {
                    "chapter": "02",
                    "chunk": "04",
                    "content": "  <verse number=\"4\" style=\"v\" /> d \n\n  <verse number=\"5\" style=\"v\" /> e \n"
                }];
                var newChunks = chunker.makeUserChunks(chunks);
                //console.log(newChunks);
                assert.equal(7, newChunks.length);
            });
        });

        describe('@MakeVerseChunksWithScheme', function(){
            it('user settings for displayed chunks should combine all verses into a single chunk', function(){
                var chunker = this.test.chunker;
                var verseChunk = {
                    "chapter": "02",
                    "chunk": "01",
                    "content": ["<para style=\"s\">a</para>\n\n<para style=\"p\">\n\n  <verse number=\"1\" style=\"v\" /> b \n\n  ",
                        "<verse number=\"2\" style=\"v\" /> c \n\n  ",
                        "<verse number=\"3\" style=\"v\" /> c \n"]
                };
                // This arrary represents the chunking of a chapter of Bookname
                var verseDivisions = [1]
                var actualChunks = chunker.makeVerseChunksWithScheme(verseChunk, verseDivisions);
                
                assert.equal(actualChunks.length, 1);
                var expectedChunks = [{
                    "chapter": "02",
                    "chunk": "01",
                    "content":"<para style=\"s\">a</para>\n\n<para style=\"p\">\n\n  <verse number=\"1\" style=\"v\" /> b \n\n  <verse number=\"2\" style=\"v\" /> c \n\n  <verse number=\"3\" style=\"v\" /> c \n"}];
                // assert.equal(actualChunks, expectedChunks);
                if(!_.isEqual(actualChunks, expectedChunks)){
                    throw new Error("Was expecting a single chunk with all verses combined.");
                };
            });
        });

        describe('@MakeVerseChunksWithScheme', function(){
            it('user settings for displayed chunks should make 2 chunks: (v1,v2) and (v3)', function(){
                var chunker = this.test.chunker;
                var verseChunk = {
                    "chapter": "02",
                    "chunk": "01",
                    "content": ["<para style=\"s\">a</para>\n\n<para style=\"p\">\n\n  <verse number=\"1\" style=\"v\" /> b \n\n  ",
                        "<verse number=\"2\" style=\"v\" /> c \n\n  ",
                        "<verse number=\"3\" style=\"v\" /> c \n"]
                };
                // This arrary represents the chunking of a chapter of Bookname
                var verseDivisions = [1,3]
                var actualChunks = chunker.makeVerseChunksWithScheme(verseChunk, verseDivisions);
                
                assert.equal(actualChunks.length, 2);
                var expectedChunks = [{
                    "chapter": "02",
                    "chunk": "01",
                    "content":"<para style=\"s\">a</para>\n\n<para style=\"p\">\n\n  <verse number=\"1\" style=\"v\" /> b \n\n  <verse number=\"2\" style=\"v\" /> c \n\n  "},
                    {
                    "chapter": "02",
                    "chunk": "03",
                    "content":"<verse number=\"3\" style=\"v\" /> c \n"}
                ];
                // assert.equal(actualChunks, expectedChunks);
                if(!_.isEqual(actualChunks, expectedChunks)){
                    throw new Error("Was expecting first chunk to hold verses 1 and 2 and second chunk to hold verse 3.");
                };
            });
        });

        describe('@LoadUserChunks', function(){
            it('should chunk the given chapter into these chunks: (book), (chapter heading), (vv1-2), (vv3-7), (vv8-10)', function(){
                var chunker = this.test.chunker;
                var chapterChunks = [
                    {
                        "chapter": "front",
                        "chunk": "title",
                        "content": "Bookname"
                    },
                    {
                        "chapter": "01",
                        "chunk": "title",
                        "content": "Chapter 1"
                    },
                    {
                        "chapter": "01",
                        "chunk": "01",
                        "content": "<verse number=\"1\" style=\"v\" /> VERSE ONE <verse number=\"2\" style=\"v\" /> VERSE TWO <verse number=\"3\" style=\"v\" /> VERSE THREE <verse number=\"4\" style=\"v\" /> VERSE FOUR "
                    },
                    {
                        "chapter": "01",
                        "chunk": "05",
                        "content": "<verse number=\"5\" style=\"v\" /> VERSE FIVE <verse number=\"6\" style=\"v\" /> VERSE SIX <verse number=\"7\" style=\"v\" /> VERSE SEVEN "
                    },
                    {
                        "chapter": "01",
                        "chunk": "08",
                        "content": "<verse number=\"8\" style=\"v\" /> VERSE EIGHT <verse number=\"9\" style=\"v\" /> VERSE NINE <verse number=\"10\" style=\"v\" /> VERSE TEN "
                    }
                ]
                
                // This arrary represents the chunking of a chapter of Bookname
                // It should chunk the given chapter into these chunks: 
                // (book), (chapter heading), (vv1-2), (vv3-7), (vv8-10)'
                var verseDivisions = {
                    'book':'Bookname',
                    'chapters':[
                        [1,3,8] // chapter 1 verse divisions
                    ]
                };
                var actualChunks = chunker.loadUserChunks(chapterChunks, verseDivisions);
                console.log(actualChunks);
                
                assert.equal(actualChunks.length, 5);
                var expectedChunks = [
                    {
                        "chapter": "front",
                        "chunk": "title",
                        "content": "Bookname"
                    },
                    {
                        "chapter": "01",
                        "chunk": "title",
                        "content": "Chapter 1"
                    },
                    {
                        "chapter": "01",
                        "chunk": "01",
                        "content": "<verse number=\"1\" style=\"v\" /> VERSE ONE <verse number=\"2\" style=\"v\" /> VERSE TWO "
                    },
                    {
                        "chapter": "01",
                        "chunk": "03",
                        "content": "<verse number=\"3\" style=\"v\" /> VERSE THREE <verse number=\"4\" style=\"v\" /> VERSE FOUR <verse number=\"5\" style=\"v\" /> VERSE FIVE <verse number=\"6\" style=\"v\" /> VERSE SIX <verse number=\"7\" style=\"v\" /> VERSE SEVEN "
                    },
                    {
                        "chapter": "01",
                        "chunk": "08",
                        "content": "<verse number=\"8\" style=\"v\" /> VERSE EIGHT <verse number=\"9\" style=\"v\" /> VERSE NINE <verse number=\"10\" style=\"v\" /> VERSE TEN "
                    }
                ];
                // assert.equal(actualChunks, expectedChunks);
                if(!_.isEqual(actualChunks, expectedChunks)){
                    throw new Error("Chunks were not correctly rechunked according to user's verse scheme.");
                };
            });
        });
    });

})();

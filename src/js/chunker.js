'use strict';

var _ = require('lodash')
// var fs = require('fs')

function ChunkManager() {

    this.getChunkingScheme = function(){
        // TODO: this is just to play around and get started.
        //  Actually read in from json with this same format.
        return [
            {'book':'Gen',
            'chapters':[
                [1,3,10],
                [1,10,15]
            ]}
        ]
    }

    this.makeChapterChunks = function(chunksArray){
        var newChunks = [];
        var started = false;
        var pushed = false;
        var newChunk = {}
        
        for (var i = 0; i < chunksArray.length; i++) {
            var chunk = chunksArray[i];
            // parse chunk text to get verses range
            var minVerse = parseInt(chunk.chunk);
            var maxVerse = null;
            if (i < chunksArray.length - 1){
                maxVerse = parseInt(chunksArray[i+1].chunk);
            }

            if (/[0-9]+/.test(chunk.chunk) && 
                    /[0-9]+/.test(newChunk.chunk) && 
                    chunk.chapter == newChunk.chapter){
                // add to the current chapter
                newChunk.content += chunk.content;
            } else {
                // start a new chunk
                if (started) {
                    newChunks.push(newChunk);
                    pushed = true;
                }
                started = true;
                newChunk = JSON.parse(JSON.stringify(chunk));
                pushed = false;
            }
        };
        // make sure the last copied chunk gets into the new array
        if (!pushed){
            newChunks.push(newChunk);
        }
        /*for (var x=46; x < chapter_chunks.length; x++){
            console.log(chapter_chunks[x]);
        }*/
        return newChunks;
    }
    
    // to be called per chapter, argument is all verse chunks in the same chapter
    // TODO: add this to the tests
    this.splitVerses = function(verseChunks){
        var versesArr = [];
        var markerExp = /(?=<verse number)/;
        for (var i = 0; i < verseChunks.length; i++) {
            var verses = verseChunks[i].content.split(markerExp);
            // don't loose characters at the beginning a chunk before that chunk's first verse marker
            if (verses.length > 1 && !markerExp.test(verses[0])) {
                verses[0] += verses[1];
                verses.splice(1, 1);
            }
            versesArr.push(verses);
        }
        return versesArr;
    }

    this.makeUserChunks = function(chunksArray){
        var inChunks = this.makeChapterChunks(chunksArray);
        // call getChunkingScheme
        // for each chunk, figure out if it's a verse chunk
        // if it's a verse chunk, call method splitVerses,
        //   which creates an arr you can then iterate over 
        //   to combine verses according to the scheme (just look up the correct chapter in the scheme)
        return inChunks; // TODO: replace this when ready
    }
    
}

module.exports.ChunkManager = ChunkManager;

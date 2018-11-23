'use strict';

var _ = require('lodash')
// var fs = require('fs')

function ChunkManager() {

    // TODO: consolidate functions? - maybe there's an easier way without creating so many arrays!
    // All you should need to do is parse through chunk by chunk and collect verses and follow scheme as you go.
    // The initial scheme can assume full chapter chunks - maybe set a flag to do this by default if no scheme is found to be loaded??

    this.getChunkingScheme = function(){
        // TODO: this is just to play around and get started.
        //  Actually read in from json with this same format.
        return {
            'book':'Gen',
            'chapters':[
                [1,3,10],
                [1,10,15]
            ]}
    }

    // TODO: add save chunking scheme

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
    
    // to be called per chapter, argument is a string of verses
    this.splitVerses = function(versesContent){
        var markerExp = /(?=<verse number)/;
        var verses = versesContent.split(markerExp);
        // don't loose characters at the beginning a chunk before that chunk's first verse marker
        if (verses.length > 1 && !markerExp.test(verses[0])) {
            verses[0] += verses[1];
            verses.splice(1, 1);
        }
        return verses;
    }

    // TODO: finish writing this function and add to tests
    // input: versesChunk is an object {chapter:str,chunk:str,content:arr of str} representing an entire chapter where content is an array of its verses
    // input: scheme is an arr of numbers representing the divisions of the given chapter
    this.makeVerseChunksWithScheme = function(versesChunk, verseDivisions) {
        var newChunks = []
        var verses = versesChunk.content;
        // TODO: test for a short chapter where scheme only asks for one verses chunk
        var newChunk = null;
        var content = "";
        var verseIndex = 0;

        for (var schemeIndex = 0; schemeIndex < verseDivisions.length; schemeIndex++) {
            var nextDivision = schemeIndex+1 < verseDivisions.length ? verseDivisions[schemeIndex+1] : -1;

            for (verseIndex;
                    (nextDivision == -1 || verseIndex+1 < nextDivision) && 
                        verseIndex < verses.length; 
                    verseIndex++) {
                content += verses[verseIndex];
                console.log(content);
            }
            
            // push chunk and start a new one
            newChunk = {
                "chapter": versesChunk.chapter,
                "chunk": versesChunk.chunk,
                "content": content
            }
            newChunks.push(newChunk);
            content = "";
        }
        return newChunks;
    }

    this.makeUserChunks = function(chunksArray){
        var chapterChunks = this.makeChapterChunks(chunksArray);
        // call getChunkingScheme
        var newChunks = []
        // for each chunk, figure out if it's a verse chunk
        for (var i = 0; i < chapterChunks.length; i++) {
            var chunk = chapterChunks[i];
            if (!/[0-9]+/.test(chunk.chunk)) {
                newChunks.push(chunk);
                continue;
            }
            var verses = this.splitVerses(chunk.content);
            chunk.content = verses;
            //console.log(verses);

            // combine verses according to the scheme in new function where you pass in the verses chunk and scheme array for that chapter
            this.makeVerseChunksWithScheme(chunk, [1, 2, 5]); // TODO: replace with real scheme later - this 2nd argument is just for testing

            newChunks.push(chunk);
        }
        // if it's a verse chunk, add the chunk to the group of verse chunks
        // when the next chapter is encountered call method splitVerses with group of verses passed in,
        // then add the chunk to the intermediary format
        //   which creates an arr you can then iterate over 
        //   to combine verses according to the scheme (just look up the correct chapter in the scheme)
        return newChunks; // TODO: replace this when ready
    }
    
}

module.exports.ChunkManager = ChunkManager;

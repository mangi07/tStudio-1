'use strict';

var _ = require('lodash')
// var fs = require('fs')

function ChunkManager() {

    // TODO: consolidate functions? - maybe there's an easier way without creating so many arrays!
    // All you should need to do is parse through chunk by chunk and collect verses and follow scheme as you go.
    // The initial scheme can assume full chapter chunks - maybe set a flag to do this by default if no scheme is found to be loaded??


    // If there is no passed-in chunking scheme, this function should be called to get the JSON object from file 
    this.getChunkingScheme = function(scheme){
        // TODO: this is just to play around and get started.
        //  Actually read in from json with this same format.

        return {
            'book':'Gen',
            'chapters':[
                [1,3,10] // chapter 1 verse divisions
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

    // input: versesChunk is an object {chapter:str,chunk:str,content:arr of str} representing an entire chapter where content is an array of its verses
    // input: scheme is an arr of numbers representing the divisions of the given chapter
    // returns: an array of new chunk objects that together represent all the verses of the given chapter
    this.makeVerseChunksWithScheme = function(versesChunk, verseDivisions) {
        var newChunks = []
        var verses = versesChunk.content;
        var newChunk = null;
        var content = "";
        var verseIndex = 0;

        for (var schemeIndex = 0; schemeIndex < verseDivisions.length; schemeIndex++) {
            var nextDivision = schemeIndex+1 < verseDivisions.length ? verseDivisions[schemeIndex+1] : -1;
            var verseStart = verseDivisions[schemeIndex];

            for (verseIndex;
                    (nextDivision == -1 || verseIndex+1 < nextDivision) && 
                        verseIndex < verses.length; 
                    verseIndex++) {
                content += verses[verseIndex];
            }
            // push chunk and start a new one
            newChunk = {
                "chapter": versesChunk.chapter,
                "chunk": verseStart < 10 ? "0" + verseStart : "" + verseStart,
                "content": content
            }
            newChunks.push(newChunk);
            content = "";
        }
        return newChunks;
    }

    
    // if it's a verse chunk, add the chunk to the group of verse chunks
    // when the next chapter is encountered call method splitVerses with group of verses passed in,
    // then add the chunk to the intermediary format
    //   which creates an arr you can then iterate over 
    //   to combine verses according to the scheme (just look up the correct chapter in the scheme)
    /**
     * chunksArray is the array of chunks as stored in the DB
     * Verse divisions takes the form of:
     *  {
            'book':'Gen',
            'chapters':[
                [1,3,10, 15, 17, 20, 22, 25, 29, 31], // chapter 1 verse divisions
                [1, 5, 7, 9, 11, 14, 19, 23], // chapter 2 verse divisions
                ...
            ]
        }
     */
    this.loadUserChunks = function(chunksArray, verseDivisions){
        var chapterChunks = this.makeChapterChunks(chunksArray);
        var scheme = [];
        if (verseDivisions) {
            scheme = verseDivisions.chapters;
        } else {
            scheme = this.getChunkingScheme();
        }
        var newChunks = [];
        
        for (var i = 0; i < chapterChunks.length; i++) {
            var chunk = chapterChunks[i];
            // for each chunk, figure out if it's a verse chunk
            if (/[0-9]+/.test(chunk.chunk)) {
                chunk.content = this.splitVerses(chunk.content);
                var chapter = parseInt(chunk.chapter);
                var verseChunks = this.makeVerseChunksWithScheme(chunk, scheme[chapter-1]);
                Array.prototype.push.apply(newChunks, verseChunks);
            } else {
                newChunks.push(chunk);
            }
        }
        return newChunks;
    }
    
}

module.exports.ChunkManager = ChunkManager;

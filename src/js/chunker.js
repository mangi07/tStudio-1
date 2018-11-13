'use strict';

var _ = require('lodash')
// var fs = require('fs')

function ChunkManager() {
     this.makeChapterChunks = function(chunksArray){
        var chapter_chunks = [];
        var started = false;
        var pushed = false;
        var curr_chunk = {}
        chunksArray.forEach(function(chunk){
            if (/[0-9]+/.test(chunk.chunk) && 
                    /[0-9]+/.test(curr_chunk.chunk) && 
                    chunk.chapter == curr_chunk.chapter){
                // add to the current chapter
                curr_chunk.content += chunk.content;
            } else {
                // start a new chunk
                if (started) {
                    chapter_chunks.push(curr_chunk);
                    pushed = true;
                }
                started = true;
                curr_chunk = JSON.parse(JSON.stringify(chunk));
                pushed = false;
            }
        });
        // make sure the last copied chunk gets into the new array
        if (!pushed){
            chapter_chunks.push(curr_chunk);
        }
        /*for (var x=46; x < chapter_chunks.length; x++){
            console.log(chapter_chunks[x]);
        }*/
        return chapter_chunks;
     }       
}

module.exports.ChunkManager = ChunkManager;

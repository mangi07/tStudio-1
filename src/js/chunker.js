'use strict';

var _ = require('lodash')
var fs = require('fs')

function ChunkManager() {
     this.makeChapterChunks = function(chunksArray){
         var curr_chapter = "";
         var chapter_chunks = [];
         var curr_chunk = {};
         var index = 0;
         chunksArray.forEach(function(chunk){
            if (/[0-9]+/.test(chunk.chunk) && 
                    curr_chunk != {} && /[0-9]+/.test(curr_chunk.chunk) && 
                    chunk.chapter == curr_chunk.chapter){
                // add to the current chapter
                curr_chunk.content += chunk.content;
            } else {
                // start a new chunk
                chapter_chunks.push(curr_chunk)
                curr_chunk = JSON.parse(JSON.stringify(chunk));
            }
         });
         for (var x=0; x < 5; x++){
            console.log(chapter_chunks[x]);
         }
         return chapter_chunks;
     }       
}

module.exports.ChunkManager = ChunkManager;

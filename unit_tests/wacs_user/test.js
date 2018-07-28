'use strict';

let _ = require('lodash');
let Gogs = require('./gogs-client'); // trying to using a local copy here (I think it does, but not sure)
let UserManager = require('../../src/js/user').UserManager;
let Configurator = require('../../src/js/configurator').Configurator;
let path = require('path');

let configurator;
let userManager;
let win;
let config;

const {app, BrowserWindow} = require("electron");

// TODO: may not even need an electron app since the testing is changed
// from storing config in working directory rather than through 
// the browser's window.localStorage
// needed to mimic the environment the actual app runs in
// also may need to factor out the setup code and make the test
// a module required by the setup (ie: electron app)

/*SETUP for testing*/
app.on('ready', setUp);

function runSetup(){ // pause execution to allow electron debugger to catch up
    console.log("setUp actually got called");

    //  This setup (and probably all testing) cannot access to the window object, 
    //  and all browser objects for that matter, because they are not accessable 
    //  via the electron main process, so for testing we change where storage is set: 
    //  c.setStorage(<something else here>)
    configurator = (function () {
        var c = new Configurator();
    
        // Trying to using a JSON object read/write from file here.
        // If this is similar to how localStorage works, it might just work here.
        //c.setStorage(window.localStorage); // original code in translationStudio
        config = require("./config.json");
        c.setStorage(config);

        // This file manually set up in same directory with initial contents "{}" (exluding quotes)
        let defaults = require('./defaults.json');
    
        try {
            let privateDefaults = require('../config/private.json');
            c.loadConfig(privateDefaults);
        } catch (e) {
            console.info('No private settings.');
        }
    
        //const DATA_PATH = ipcRenderer.sendSync('main-window', 'dataPath');
        // ...at this point in the electron code had been set to process.env.LOCALAPPDATA
        // on windows or something similar.
        // Here, for setup we can just use a local folder so we can examine downloads
        // while testing.
        var DATA_PATH = "./data";
        c.loadConfig(defaults);
        c.setValue('rootDir', DATA_PATH, {'mutable':false});
        c.setValue('targetTranslationsDir', path.join(DATA_PATH, 'targetTranslations'), {'mutable':false});
        c.setValue('tempDir', path.join(DATA_PATH, 'temp'), {'mutable':false});
        c.setValue('libraryDir', path.join(DATA_PATH, 'library'), {'mutable':false});
        c.setValue('indexDir', path.join(DATA_PATH, 'index'), {'mutable':false});
        return c;
    })();
    
    userManager = (function () {
        return new UserManager({
            token: configurator.getValue('gogs-token')
        });
    })();
    
    console.log("okay");

}

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 800, height: 600})

    // and load the index.html of the app.
    win.loadFile('index.html')
}

function setUp(){
    createWindow();
    setTimeout(runSetup, 3000); // allow debugger to catch up
}
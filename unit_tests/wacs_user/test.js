'use strict';

let _ = require('lodash');
let Gogs = require('./gogs-client'); // trying to using a local copy here (I think it does, but not sure)
let UserManager = require('../../src/js/user').UserManager;
let Configurator = require('../../src/js/configurator').Configurator;
let path = require('path');

let configurator;
let userManager;
let config;

// TODO: work this in:
// gitea token name granting access to test api: ts-studio
// token: see file ts-studio_token

// We do not even need an electron app since the testing is changed
// from storing config in working directory rather than through 
// the browser's window.localStorage
// The actual app config depends on window.localStorage,
// so it depends on electron to give it the required browser environment,
// but IMO we don't want to have to depend on electron just to test a git api!!
// TODO: factor out the setup code and make the test
// a module required by the setup

function getConfigurator(){
    var c = new Configurator();

    /*  This setup (and probably all testing) cannot access to the window object, 
      and all browser objects for that matter, because they are not part of node 
      and depend on a browser instance, so for testing we change where storage is set: 
      c.setStorage(<something else here>)

     Trying to using a JSON object read/write from file here.
     If this is similar to how localStorage works, it might just work here.
     c.setStorage(window.localStorage); // original code in translationStudio */
    config = require("./config.json");
    c.setStorage(config);

    /* This following line depends on defaults.json file manually set up 
    in same directory with initial contents "{}" (exluding quotes) */
    let defaults = require('./defaults.json');

    try {
        let privateDefaults = require('../config/private.json');
        c.loadConfig(privateDefaults);
    } catch (e) {
        console.info('No private settings.');
    }

    //const DATA_PATH = ipcRenderer.sendSync('main-window', 'dataPath');
    // ...at this point in the electron code had been set to process.env.LOCALAPPDATA
    // (on Windows OSes) or something similar.
    // But for setting up testing here, we can just use a local folder so we can examine downloads
    // while testing.
    var DATA_PATH = "./data";
    c.loadConfig(defaults);
    c.setValue('rootDir', DATA_PATH, {'mutable':false});
    c.setValue('targetTranslationsDir', path.join(DATA_PATH, 'targetTranslations'), {'mutable':false});
    c.setValue('tempDir', path.join(DATA_PATH, 'temp'), {'mutable':false});
    c.setValue('libraryDir', path.join(DATA_PATH, 'library'), {'mutable':false});
    c.setValue('indexDir', path.join(DATA_PATH, 'index'), {'mutable':false});
    return c;
}

function getUserManager(configurator){
    return new UserManager({
        token: configurator.getValue('gogs-token')
    });
}

function runSetup(){
    var promise = new Promise(function(resolve, reject){
        configurator = getConfigurator();
        resolve(); // ...and fail silently if reject called
    });    
    
    promise.then(function(result){
        userManager = getUserManager(configurator);
    });
}

let setup = new Promise(function(resolve, reject){
    runSetup();
    resolve(); // ...and fail silently if reject called
});

// 
setup.then(function(result){
    // do testing here with userManager
    console.log(userManager);
    // userManager.createAccount
});
//setTimeout(runSetup, 3000); // allow debugger to catch up

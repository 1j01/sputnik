/*
 * Downloads and prepares node-webkit runtime.
 */

"use strict";

var jetpack = require('fs-jetpack');
var runtimeDownload = require('./tasks/runtime-download');

var pkg = jetpack.read('../Sputnik/package.json', 'json');

// Get the name of OS we are on
var osMap = {
    "win32": "win",
    "darwin": "mac",
    "linux": "lnx",
};
var osName = osMap[process.platform];
var destDir = '../nw/' + osName;
var manifestPath = destDir + '/manifest.json';

var haveToInstall = false;

// Check if any runtime installed for this OS
try {
    var manifest = jetpack.read(manifestPath, 'json');
    // Might be installed but obsolete
    haveToInstall = (pkg.nw.version !== manifest.version);
} catch (err) {
    // Not installed at all
    haveToInstall = true;
}

if (haveToInstall) {
    console.log('Updating runtime...')
    
    jetpack.dir(destDir, { empty: true });
    
    var url = pkg.nw[osName];
    
    runtimeDownload(osName, destDir, url)
    .then(function () {
        // Write manifest for future checking
        jetpack.write(manifestPath, {
            version: pkg.nw.version
        });
       
       console.log('Runtime installed and up to date!');
    });
} else {
    console.log('Runtime is ok!');
}
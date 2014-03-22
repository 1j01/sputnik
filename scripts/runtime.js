/*
 * Downloads and prepares node-webkit runtime.
 */

"use strict";

var jetpack = require('fs-jetpack');
var pathUtil = require('path');

var pkg = jetpack.read('../Sputnik/package.json', 'json');

// Get the name of OS we are on
var osMap = {
    "win32": "win",
    "darwin": "mac",
    "linux": "lnx",
};
var osName = osMap[process.platform];
var destDir = pathUtil.resolve(__dirname, '../nw/', osName);
var manifestPath = pathUtil.join(destDir, 'manifest.json');

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
    var runtimeDownload = require('./tasks/runtime-download');
    
    console.log('Installing runtime...')
    
    var url = pkg.nw[osName];
    
    runtimeDownload(osName, destDir, url)
    .then(function () {
        // Write manifest for future checking
        jetpack.write(manifestPath, {
            version: pkg.nw.version
        });
       
       console.log('Runtime installed!');
    });
} else {
    console.log('Runtime is ok!');
}
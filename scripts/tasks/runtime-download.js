/**
 * Downloads node-webkit runtime for your OS and unpacks it into proper place inside the project.
 */

"use strict";

var fs = require('fs');
var pathUtil = require('path');
var jetpack = require('fs-jetpack');
var request = require('request');
var progress = require('request-progress');
var os = require('os');
var Q = require('q');
var childProcess = require('child_process');

function download(url) {
    var qd = Q.defer();
    var downloadDir = pathUtil.join(os.tmpdir(), 'nw-download');
    var fileName = url.substr(url.lastIndexOf('/'));
    var downloadFile = pathUtil.join(downloadDir, fileName);
    
    jetpack.dir(downloadDir, { empty: true });
    
    console.log('Downloading: ' + url);
    process.stdout.write('Progress: 0%');
    
    progress(request(url))
    .on('progress', function (state) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write('Progress: ' + state.percent + '%');
    })
    .on('error', function (err) {
        console.log('Download ERROR:');
        console.log(err);
    })
    .pipe(fs.createWriteStream(downloadFile))
    .on('error', function (err) {
        console.log('Write ERROR:');
        console.log(err);
    })
    .on('close', function () {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        console.log('Progress: 100%');
        qd.resolve(downloadFile);
    })
    
    return qd.promise;
}

function unpack(osName, downloadedFilePath, destDir) {
    var qd = Q.defer();
    
    process.stdout.write('Unpacking... ')
    
    function processCallback(error, stdout, stderr) {
        if (error || stderr) {
            console.log(error);
            console.log(stderr);
        } else {
            console.log('Done!');
            qd.resolve();
        }
    }
    
    var command;
    switch (osName) {
        case 'win':
            // Unzip with 7zip
            command = pathUtil.resolve(__dirname + "/../../os/win/7zip/7za.exe");
            childProcess.execFile(command,
                ["x", downloadedFilePath, "-o" + destDir],
                processCallback);
            break;
        case 'mac':
            command = "unzip " + downloadedFilePath + " -d " + destDir;
            childProcess.exec(command, processCallback);
            break;
        case 'lnx':
            // Untar the content of root directory (nw archive for linux is packed with directory inside)
            command = "tar -zxf " + downloadedFilePath + " --strip-components=1 -C " + destDir;
            childProcess.exec(command, processCallback);
            break;
    }
    
    return qd.promise;
}

module.exports = function (osName, destDir, url) {
    var qd = Q.defer();
    
    jetpack.dir(destDir, { empty: true });
    
    download(url)
    .then(function (downloadedFilePath) {
        return unpack(osName, downloadedFilePath, destDir);
    })
    .then(function () {
        // Remove temp dir
        return jetpack.dirAsync(downloadDir, { exists: false });
    })
    .then(qd.resolve);
    
    return qd.promise;
};
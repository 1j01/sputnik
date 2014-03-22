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

function unpack(osName, downloadedFilePath) {
    var qd = Q.defer();
    
    process.stdout.write('Unpacking... ')
    
    function processCallback(error, stdout, stderr) {
        if (error) {
            console.log(error);
        } else {
            console.log('Done!');
            qd.resolve();
        }
    }
    
    switch (osName) {
        case 'win':
            // Unzip with 7zip
            childProcess.execFile(__dirname + "/../../os/win/7zip/7za.exe",
                ["x", downloadedFilePath, "-o" + __dirname + "/../../nw/win"],
                processCallback);
            break;
        case 'mac':
            childProcess.execFile("unzip",
                [downloadedFilePath, "-d " + __dirname + "/../../nw/mac"],
                processCallback);
            break;
        case 'lnx':
            // Untar the content of root directory (nw archive for linux is packed with directory inside)
            childProcess.execFile("tar",
                ["-zxf", downloadedFilePath, "--strip-components=1", "-C", __dirname + "/../../nw/lnx"],
                processCallback);
            break;
    }
    
    return qd.promise;
}

module.exports = function (osName, destDir, url) {
    var qd = Q.defer();
    
    download(url)
    .then(function (downloadedFilePath) {
        return unpack(osName, downloadedFilePath);
    })
    /*.then(function () {
        // Remove temp dir
        return jetpack.dirAsync(downloadDir, { exists: false });
    })*/
    .then(qd.resolve);
    
    return qd.promise;
};
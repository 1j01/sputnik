"use strict";

var Q = require('q');
var lessTask = require('./less');

module.exports = function (src, dest) {
    var qd = Q.defer();
    
    dest = dest.cwd('mac');
    
    dest.dirAsync('.', { empty: true })
    .then(function () {
        // copy node-webkit runtime
        return dest.copyAsync(src.path('nw/mac/node-webkit.app'), 'Sputnik.app');
    })
    .then(function () {
        // copy /app dir
        return src.copyAsync('app', dest.path('Sputnik.app/Contents/Resources/app.nw'));
    })
    .then(function () {
        // build css
        return lessTask(src.path('styles/main.less'), dest.path('Sputnik.app/Contents/Resources/app.nw/styles/main.css'));
    })
    .then(function () {
        // remove default NW icon
        return dest.removeAsync('Contents/Resources/nw.icns');
    })
    .then(function () {
        // copy sputnik icon
        return src.copyAsync('install/mac/icon.icns', dest.path('/Contents/Resources/icon.icns'));
    })
    .then(function () {
        // prepare .plist file
        return src.readAsync('install/mac/Info.plist');
    })
    .then(function (plistData) {
        // inject version number into .plist
        plistData = plistData.replace('{{sputnikVersion}}', version);
        // write .plist file into destination dir
        return dest.writeAsync('Sputnik.app/Contents/Info.plist', plistData);
    })
    .then(qd.resolve);
    
    return qd.promise;
};
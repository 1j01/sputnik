"use strict";

var Q = require('q');
var lessTask = require('./less');

module.exports = function (src, dest) {
    var qd = Q.defer();
    
    dest = dest.cwd('win');
    
    dest.dirAsync('.', { empty: true })
    .then(function () {
        // copy /app dir
        return src.copyAsync('app', dest.path('app'));
    })
    .then(function () {
        // build css
        return lessTask(src.path('styles/main.less'), dest.path('app/styles/main.css'));
    })
    .then(function () {
        // copy node-webkit runtime
        return dest.copyAsync(src.path('nw/win/nw.exe'), 'Sputnik.exe');
    })
    .then(function () {
        return dest.copyAsync(src.path('nw/win/nw.pak'));
    })
    .then(function () {
        return dest.copyAsync(src.path('nw/win/icudt.dll'));
    })
    .then(qd.resolve)
    
    .catch(function (err) {
        console.log('Build task error:');
        console.log(err);
    });
    
    return qd.promise;
};
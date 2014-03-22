"use strict";

var Q = require('q');
var lessTask = require('./less');

module.exports = function (src, dest) {
    var qd = Q.defer();
    
    dest = dest.cwd('lnx');
    
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
        return dest.copyAsync(src.path('nw/lnx/nw'), 'Sputnik');
    })
    .then(function () {
        return dest.copyAsync(src.path('nw/win/nw.pak'));
    })
    .then(qd.resolve);
    
    return qd.promise;
};
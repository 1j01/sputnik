"use strict";

var Q = require('q');
var less = require('less');
var jetpack = require('fs-jetpack');

module.exports = function (srcPath, destPath) {
    var qd = Q.defer();
    var qLess = Q.denodeify(less.render);
    
    jetpack.readAsync(srcPath)
    .then(function (data) {
        return qLess(data);
    })
    .then(function (css) {
        return jetpack.fileAsync(destPath, { content: css });
    })
    .then(qd.resolve)
    
    .catch(function (err) {
        console.log('LESS task error:');
        console.log(err);
    });
    
    return qd.promise;
};
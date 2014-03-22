/**
 * Builds the app for all platforms (will detect the platform and build for this you are running on).
 */

"use strict";

var pathUtil = require('path');
var jetpack = require('fs-jetpack');

var buildWindows = require('./tasks/build-win');
var buildMac = require('./tasks/build-mac');
var buildLinux = require('./tasks/build-lnx');

var tasksMap = {
    "win32": buildWindows,
    "darwin": buildMac,
    "linux": buildLinux,
};

var src = jetpack.cwd(pathUtil.resolve(__dirname, '..'));
var dest = jetpack.cwd(pathUtil.resolve(__dirname, '..', 'build'));

var build = tasksMap[process.platform];

console.log('Starting build process...');

build(src, dest);
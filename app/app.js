'use strict';

var sputnik = angular.module('sputnik', ['ngRoute', 'ngSanitize', 'ngAnimate']);

sputnik.config(function ($provide, $routeProvider) {
    
    var config = initSputnikConfig();
    
    $provide.value('config', config);
    
    var feedsStorage = require('./models/feedsStorage');
    var dataPath = config.dataHomeFolder + '/feeds.json';
    $provide.value('feedsStorage', feedsStorage.make(dataPath));
    
    var articlesStorage = require('./models/articlesStorage');
    var dbPath = config.dataHomeFolder + '/articles.nedb';
    $provide.value('articlesStorage', articlesStorage.make(dbPath));
    
    $provide.value('feedsWaitingRoom', require('./helpers/feedsWaitingRoom').init(config.dataHomeFolder + '/feeds-waiting-room'));
    
    $provide.value('opml', require('./helpers/opml'));
    $provide.value('net', require('./helpers/net'));
    $provide.value('feedParser', require('./helpers/feedParser'));
    
    $routeProvider.when('/', {
        controller: 'ReadCtrl',
        templateUrl: 'views/read.html'
    }).when('/importExport', {
        controller: 'ImportExportCtrl',
        templateUrl: 'views/importExport.html'
    }).when('/add', {
        controller: 'AddFeedCtrl',
        templateUrl: 'views/addFeed.html'
    }).when('/organize', {
        controller: 'OrganizeCtrl',
        templateUrl: 'views/organize.html'
    }).when('/tags', {
        controller: 'TagsCtrl',
        templateUrl: 'views/tags.html'
    }).when('/settings', {
        controller: 'SettingsCtrl',
        templateUrl: 'views/settings.html'
    }).when('/about/:subview', {
        controller: 'AboutCtrl',
        templateUrl: 'views/about/main.html'
    });
});
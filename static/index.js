// bootstrap script

require('coffee-script').register();

window.resizeTo(1200, 600);
var $ = require('jquery');
$(function() {
  require('../src/keys');
  var Games = require('../src/games');
  var GamesView = require('../src/games-view');
  $('body').html(new GamesView(new Games()));
});
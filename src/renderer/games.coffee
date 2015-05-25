db = require './db_asar'
path = require 'path'
ipc = require 'ipc'
$ = require 'jquery'
_ = require 'underscore-plus'
Backbone = require 'backbone'
Backbone.$ = $

Game = Backbone.Model.extend
  getROM: ->
    new Promise (resolve, reject) =>
      stmt = "select Console.nointro_name as nointro_console, ROM.*
      from ROM join Console on ROM.console = Console.name where game = '#{@get 'name'}'"
      db.get stmt, (err, rom) ->
        if err or not rom
          reject err
        else
          resolve rom

Games = Backbone.Collection.extend
  model: Game
  comparator: 'title'
  addGame: (game) ->
    @add new @model game
  fetch: ->
    db.each 'select * from Game order by gameranking desc', (err, row) =>
      @addGame row

GameView = Backbone.View.extend
  tagName: 'li'
  events:
    click: 'play'
  template: _.template $('#game').html()
  initialize: ->
    @listenTo @model, 'change', @render
    @listenTo @model, 'destroy', @remove
    @listenTo @model, 'visible', @toggleVisible
  isHidden: ->
    false
  toggleVisible: ->
    @$el.toggleClass 'hidden', @isHidden()
  render: ->
    @toggleVisible()
    @$el.toggleClass 'game'
    @$el.html @template @model.toJSON()
    this
  play: ->
    @model.getROM().then (rom) ->
      ipc.send 'app:play', rom

GamesView = Backbone.View.extend
  el: '.games'
  limit: 20
  rendered: 0
  scrollTrigger: 100
  events:
    scroll: 'scroll'
  initialize: ->
    @listenTo @collection, 'add', @addOne
    @listenTo @collection, 'reset', @addAll
    @listenTo @collection, 'filter', @filterAll
  addOne: (game) ->
    if @rendered < @limit
      view = new GameView model: game
      @$el.append view.render().el
      @rendered += 1
  addAll: ->
    @$el.html ''
    @collection.each @addOne, @
  scroll: ->
    console.log $(window).scrollTop()
  filterOne: (game) ->
    game.trigger 'visible'
  filterAll: ->
    @collection.each @filterOne, @

games = new Games()
games.fetch()
new GamesView collection: games

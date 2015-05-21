app = require 'app'
fs = require 'fs'
ipc = require 'ipc'
path = require 'path'
os = require 'os'
net = require 'net'
url = require 'url'

{EventEmitter} = require 'events'
BrowserWindow = require 'browser-window'
_ = require 'underscore-plus'

module.exports =
class Player
  _.extend @prototype, EventEmitter.prototype

  constructor: (options) ->
    @loadSettings =
      bootstrapScript: require.resolve '../renderer/player'

    @loadSettings = _.extend(@loadSettings, options)

    windowOpts =
      width: 600
      height: 625
      title: "GameTime"
      center: true
      resizable: true
      show: true
      fullscreen: true
      'web-preferences':
        javascript: true
        webgl: true
        webaudio: true
        'subpixel-font-scaling': true
        'direct-write': true

    windowOpts = _.extend(windowOpts, @loadSettings)

    @window = new BrowserWindow(windowOpts)

    @window.on 'closed', (e) =>
      @emit 'closed', e

    @window.on 'close', (e) =>
      @emit 'close', e

    @window.on 'devtools-opened', (e) =>
      @window.webContents.send 'window:toggle-dev-tools', true

    @window.on 'devtools-closed', (e) =>
      @window.webContents.send 'window:toggle-dev-tools', false

  show: ->
    targetPath = path.resolve(__dirname, '..', '..', 'static', 'player.html')

    targetUrl = url.format
      protocol: 'file'
      pathname: targetPath
      slashes: true
      query: {loadSettings: JSON.stringify(@loadSettings)}

    @window.loadUrl targetUrl
    @window.show()

  reload: ->
    @window.webContents.reload()

  toggleFullScreen: ->
    @window.setFullScreen(not @window.isFullScreen())

  toggleDevTools: ->
    @window.toggleDevTools()

  close: ->
    @window.close()
    @window = null
import Phaser from 'phaser'

export const EVENT_INITIALIZED = 'poki:initialized'

export class PokiPlugin extends Phaser.Plugins.BasePlugin {
  init ({ loadingSceneKey, gameplaySceneKey, autoCommercialBreak }) {
    this._loadingSceneKey = loadingSceneKey
    this._gameplaySceneKey = gameplaySceneKey
    this._autoCommercialBreak = autoCommercialBreak

    this._scriptLoaded = false
    this._initializeHooks = []
    this._queue = []

    this.initialized = false
    this.hasAdblock = true

    const script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js')
    script.addEventListener('load', () => {
      this.sdk = window.PokiSDK

      this._scriptLoaded = true
      this._queue.forEach(f => f())

      this.sdk.init().then(() => {
        this.initialized = true
        this.hasAdblock = false

        this.game.events.emit(EVENT_INITIALIZED, this)
        this._initializeHooks.forEach(f => f(this))
        this._initializeHooks = undefined
      }).catch(err => {
        console.error('PokiSDK failed', err)
        this.hasAdblock = true
      })
    })
    script.addEventListener('error', (e) => {
      console.error('failed to load PokiSDK', e)
    })
    document.head.appendChild(script)

    this._currentScenes = []
  }

  runWhenInitialized (callback) {
    if (this.initialized) {
      callback(this) // eslint-disable-line node/no-callback-literal
    } else {
      this._initializeHooks.push(callback)
    }
  }

  // Called by Phaser, do not use
  start () {
    this.game.events.on('step', this._update, this)
  }

  // Called by Phaser, do not use
  stop () {
    this.game.events.off('step', this._update)
  }

  _update () {
    // Detect if new actives scenes are added or removed:
    const names = this.game.scene.getScenes(true).map(s => s.constructor.name)
    this._currentScenes.forEach(name => {
      if (names.indexOf(name) === -1) {
        this._currentScenes.splice(this._currentScenes.indexOf(name), 1)
        if (name === this._loadingSceneKey) {
          this.gameLoadingFinished()
        }
        if (name === this._gameplaySceneKey) {
          this.gameplayStop()
        }
      }
    })
    names.forEach(name => {
      if (this._currentScenes.indexOf(name) === -1) {
        this._currentScenes.push(name)
        if (name === this._loadingSceneKey) {
          this.gameLoadingStart()
        }
        if (name === this._gameplaySceneKey) {
          if (this._scriptLoaded && this._autoCommercialBreak && !this.hasAdblock) {
            this.commercialBreak().then(() => {
              this.gameplayStart()
            })
          } else {
            this.gameplayStart()
          }
        }
      }
    })
  }

  // Manually call the gameLoadedStart event in the PokiSDK, this is done
  // automatically if you've set the loadingSceneKey in the plugin data.
  gameLoadingStart () {
    if (this._scriptLoaded) {
      this.sdk.gameLoadingStart()
    } else {
      this._queue.push(() => {
        this.sdk.gameLoadingStart()
      })
    }
  }

  // Manually call the gameLoadingFinished event in the PokiSDK, this is done
  // automatically if you've set the loadingSceneKey in the plugin data.
  gameLoadingFinished () {
    if (this._scriptLoaded) {
      this.sdk.gameLoadingFinished()
    } else {
      this._queue.push(() => {
        this.sdk.gameLoadingFinished()
      })
    }
  }

  // Manually call the gameplayStart event in the PokiSDK, this is done
  // automatically if you've set the gameplaySceneKey in the plugin data.
  gameplayStart () {
    if (this._scriptLoaded) {
      this.sdk.gameplayStart()
    } else {
      this._queue.push(() => {
        this.sdk.gameplayStart()
      })
    }
  }

  // Manually call the gameplayStop event in the PokiSDK, this is done
  // automatically if you've set the gameplaySceneKey in the plugin data.
  gameplayStop () {
    if (this._scriptLoaded) {
      this.sdk.gameplayStop()
    } else {
      this._queue.push(() => {
        this.sdk.gameplayStop()
      })
    }
  }

  // Manually request a commercialBreak via the PokiSDK, this is done
  // automatically if you've set autoCommercialBreak to true in the plugin data
  // and the configured gameplayScene started/resumed.
  commercialBreak () {
    return this._break('commercial')
  }

  // Trigger a rewardedBreak via the PokiSDK when called.
  rewardedBreak () {
    return this._break('rewarded')
  }

  _break (type) {
    if (type !== 'commercial' && type !== 'rewarded') {
      throw new Error('type must be "commercial" or "rewarded"')
    }

    if (this.initialized && !this.hasAdblock) {
      return new Promise((resolve) => {
        const wasKeyboardEnbaled = this.game.input.keyboard.enabled
        this.game.input.keyboard.enabled = false

        const wasMuted = this.game.sound.mute
        this.game.sound.mute = true

        this.sdk[`${type}Break`]().then(() => {
          if (wasKeyboardEnbaled) {
            this.game.input.keyboard.enabled = true
          }

          if (!wasMuted) {
            this.game.sound.mute = false
          }

          resolve()
        })
      })
    }
    return Promise.resolve()
  }
}

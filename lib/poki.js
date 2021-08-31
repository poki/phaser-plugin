import Phaser from 'phaser'

export class PokiPlugin extends Phaser.Plugins.BasePlugin {
  init (data) {
    console.log('injecting Poki SDK')
    this._loadingScene = data.loadingScene
    this._gameplayScene = data.gameplayScene
    this._autoCommercialBreak = data.autoCommercialBreak

    this.ready = false
    this._queue = []

    this.adblock = true

    const script = document.createElement('script')
    script.setAttribute('crossOrigin', 'anonymous')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js')
    script.addEventListener('load', () => {
      console.log('PokiSDK loaded')
      this.sdk = window.PokiSDK
      this.sdk.setDebug(true)

      this.ready = true
      this._queue.forEach(f => f())

      this.game.events.emit('poki:ready', this)

      // this.sdk.init().then(() => {
      //   console.log("PokiSDK initialized")
      // }).catch(err => {
      //   console.log("PokiSDK failed", err)
      //   this.adblock = true
      // })
    })
    script.addEventListener('error', (e) => {
      console.error('failed to load PokiSDK', e)
    })
    document.head.appendChild(script)

    this._currentScenes = []
  }

  start() {
    this.game.events.on('step', this._update, this)
  }

  stop() {
    this.game.events.off('step', this._update)
  }

  _update() {
    // Detect if new actives scenes are added or removed:
    const names = this.game.scene.getScenes(true).map(s => s.constructor.name)
    this._currentScenes.forEach(name => {
      if (names.indexOf(name) === -1) {
        this._currentScenes.splice(this._currentScenes.indexOf(name), 1)
        if (name === this._loadingScene) {
          this.gameLoadingFinished()
        }
        if (name === this._gameplayScene) {
          this.gameplayStop()
        }
      }
    })
    names.forEach(name => {
      if (this._currentScenes.indexOf(name) === -1) {
        this._currentScenes.push(name)
        if (name === this._loadingScene) {
          this.gameLoadingStart()
        }
        if (name === this._gameplayScene) {
          this.gameplayStart()
        }
      }
    })
  }

  gameLoadingStart () {
    if (this.ready) {
      this.sdk.gameLoadingStart()
    } else {
      this._queue.push(() => {
        this.sdk.gameLoadingStart()
      })
    }
  }

  gameLoadingFinished () {
    if (this.ready) {
      this.sdk.gameLoadingFinished()
    } else {
      this._queue.push(() => {
        this.sdk.gameLoadingFinished()
      })
    }
  }

  gameplayStart () {
    if (this.ready) {
      this.sdk.gameplayStart()
    } else {
      this._queue.push(() => {
        this.sdk.gameplayStart()
      })
    }
  }

  gameplayStop () {
    if (this.ready) {
      this.sdk.gameplayStop()
    } else {
      this._queue.push(() => {
        this.sdk.gameplayStop()
      })
    }
  }

  commercialBreak () {
    if (this.ready) {
      return this.sdk.commercialBreak()
    } else {
      return new Promise((resolve) => {
        resolve()
      })
    }
  }

  rewardedBreak () {
    if (this.ready) {
      return this.sdk.rewardedBreak()
    } else {
      return new Promise((resolve) => {
        resolve(false)
      })
    }
  }
}

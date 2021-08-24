import Phaser from 'phaser'

export class PokiPlugin extends Phaser.Plugins.BasePlugin {
  init (data) {
    console.log('injecting Poki SDK')
    this.loadingScene = data.loadingScene
    this.gameplayScene = data.gameplayScene
    this.autoCommercialBreak = data.autoCommercialBreak

    const script = document.createElement('script')
    script.setAttribute('crossOrigin', 'anonymous')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js')
    script.addEventListener('load', () => {
      console.log('PokiSDK loaded')
      this.sdk = window.PokiSDK
      this.sdk.setDebug(true)
      // this.sdk.init()
    })
    script.addEventListener('error', (e) => {
      console.error('failed to load PokiSDK', e)
    })
    document.head.appendChild(script)

    this.currentScenes = []
  }

  start() {
    this.game.events.on('step', this.update, this)
  }

  stop() {
    this.game.events.off('step', this.update)
  }

  update() {
    // Detect if new actives scenes are added or removed:
    const names = this.game.scene.getScenes(true).map(s => s.constructor.name)
    this.currentScenes.forEach(name => {
      if (names.indexOf(name) === -1) {
        this.currentScenes.splice(this.currentScenes.indexOf(name), 1)
        console.log(`scene ${name} is removed`)
        this.onSceneDeactivate(name)
      }
    })
    names.forEach(name => {
      if (this.currentScenes.indexOf(name) === -1) {
        this.currentScenes.push(name)
        console.log('new scene', name)
        this.onSceneActivate(name)
      }
    })
  }

  onSceneActivate (name) {
    if (name === this.loadingScene) {
      this.sdk.gameLoadingStart()
    }
    if (name === this.gameplayScene) {
      this.sdk.gameplayStart()
    }
  }

  onSceneDeactivate (name) {
    if (name === this.loadingScene) {
      this.sdk.gameLoadingFinished()
    }
    if (name === this.gameplayScene) {
      this.sdk.gameplayStop()
    }
  }
}

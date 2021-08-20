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
  }

  start() {
    console.log('start')

    // When is loading started?
  }

  stop() {
    console.log('stop')
  }
}

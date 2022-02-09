import Phaser from 'phaser'

import { PokiPlugin } from '../lib'
// In this example we use '../lib' because it's in the same repository, in
// an actual project you should use:
//   import { PokiPlugin } from '@poki/phaser-3'

import LoadingScene from './scenes/loading'

const config = {
  parent: 'game',
  backgroundColor: '#f0f5fc',

  plugins: {
    global: [
      {
        plugin: PokiPlugin,
        key: 'poki',
        start: true,
        data: {
          loadingSceneKey: 'LoadingScene',
          gameplaySceneKey: 'PlayScene',
          autoCommercialBreak: true
        }
      }
    ]
  }
}

export default class Game extends Phaser.Game {
  start () {
    super.start()
    this.input.keyboard.addCapture('SPACE') // to prevent the page from scrolling

    this.scene.add('LoadingScene', LoadingScene, true)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game(config)
  window.game = game
})

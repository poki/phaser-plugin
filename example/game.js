import Phaser from 'phaser'

import { PokiPlugin } from '../lib'

import LoadingScene from './scenes/loading'

const config = {
  parent: 'game',
  backgroundColor: '#f0f5fc',

  plugins: {
    global: [
      {
        key: 'poki',
        plugin: PokiPlugin,
        start: true,
        data: {
          loadingScene: 'LoadingScene',
          gameplayScene: 'PlayScene',
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
  new Game(config)
})

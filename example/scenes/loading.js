import Phaser from 'phaser'

import MenuScene from './menu'
import PlayScene from './play'

export default class LoadingScene extends Phaser.Scene {
  create () {
    this.load.image('logo', 'textures/logo.png')
    this.load.audio('background', 'audio/bodenstaendig_2000_in_rock_4bit.mp3')

    this.load.once('complete', () => {
      console.log('Loading complete')

      this.scene.add('PlayScene', PlayScene, false)
      this.scene.add('MenuScene', MenuScene, false)
      this.scene.start('MenuScene')
    })

    this.load.start()
  }
}

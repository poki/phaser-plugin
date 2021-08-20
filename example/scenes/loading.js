import Phaser from 'phaser'

import PlayScene from './play'

export default class LoadingScene extends Phaser.Scene {
  create () {
    this.load.image('logo', 'textures/logo.png')

    this.load.once('complete', () => {
      console.log('Loading complete')

      this.scene.add('PlayScene', PlayScene, false)
      this.scene.start('PlayScene')
    })

    this.load.start()
  }
}

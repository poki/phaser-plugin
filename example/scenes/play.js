import Phaser from 'phaser'

export default class PlayScene extends Phaser.Scene {
  create () {
    this.logo = this.add.image(100, 100, 'logo')
    this.logo.setScale(0.2)

    this.input.keyboard.on('keyup-ESC', () => {
      this.scene.start('MenuScene')
    })
  }

  update (time, delta) {
    this.logo.x = 640 + Math.cos(time / 1000) * 100
  }
}

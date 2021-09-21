import Phaser from 'phaser'

export default class PlayScene extends Phaser.Scene {
  create () {
    this.logo = this.add.image(100, 100, 'logo')
    this.logo.setScale(0.2)

    this.counter = 0
    this.display = this.add.text(10, 10, '0', { color: 'black' })

    this.input.keyboard.on('keyup-ESC', () => {
      this.scene.start('MenuScene')
    })

    this.input.keyboard.on('keyup-ENTER', () => {
      this.counter++
      this.display.setText(`${this.counter}`)
    })
  }

  update (time, delta) {
    this.logo.x = 640 + Math.cos(time / 1000) * 100
  }
}

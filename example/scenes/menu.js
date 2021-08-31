import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
  create () {
    this.playButton = this.add.text(640, 460, 'Start!', {
      font: '48px Impact',
      fill: 'black'
    })
    this.playButton.setInteractive({ useHandCursor: true })
    this.playButton.addListener('pointerdown', () => {
      this.scene.start('PlayScene')
    })

    const poki = this.plugins.get('poki')
    if (poki.adblock) {
      this.add.text(10, 10, 'Adblock detected!', {
        fill: 'black'
      })
    }
  }
}

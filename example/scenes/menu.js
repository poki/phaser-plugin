import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
  create () {
    const poki = this.plugins.get('poki')
    if (poki.adblock) {
      this.add.text(10, 10, 'Adblock detected!', {
        fill: 'black'
      })
    }

    this.playButton = this.add.text(640, 460, 'Start!', {
      font: '48px Impact',
      fill: 'black'
    })
    this.playButton.setInteractive({ useHandCursor: true })
    this.playButton.addListener('pointerdown', () => {
      this.scene.start('PlayScene')
    })

    this.rewardButton = this.add.text(340, 560, 'Watch an AD for coins!!', {
      font: '48px Impact',
      fill: poki.adblock ? 'lightgrey' : 'black'
    })
    if (!poki.adblock) {
      this.rewardButton.setInteractive({ useHandCursor: true })
      this.rewardButton.addListener('pointerdown', () => {
        // This helper function will mute and disable keyboard input.
        poki.rewardedBreak().then((success) => {
          if (success) {
            // Give coins!
          }
        })
      })
    }
  }
}

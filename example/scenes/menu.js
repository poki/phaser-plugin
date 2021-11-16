import Phaser from 'phaser'

export default class MenuScene extends Phaser.Scene {
  create () {
    if (!this.sound.get('background')) {
      this.sound.play('background', {
        volume: 0.1
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
      fill: 'lightgrey'
    })

    const poki = this.plugins.get('poki')

    // Run the following code when the PokiSDK has been initialized, we need this
    // to determine if the player has an adblocker installed. When the PokiSDK
    // was already initialized the callback is ran immediately.
    poki.runInitialized((poki) => {
      console.log('runInitialized')
      if (poki.adblock) {
        this.add.text(10, 10, 'Adblock detected!', {
          fill: 'black'
        })
      }

      if (!poki.adblock) {
        this.rewardButton.setTint(0x000000)
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
    })
  }
}

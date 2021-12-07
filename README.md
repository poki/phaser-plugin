# Poki Phaser 3 Plugin

Hi! 👋 This is the official Poki Phaser Plugin for 
[Phaser 3](https://phaser.io/phaser3). This plugin will automate most of 
implementing the [Poki SDK](https://sdk.poki.com/) when making a game with 
Phaser.

### Features

- Inject & load the Poki SDK for you (asynchronously)
- Trigger _loadingStart/loadingFinished_ event when loading
- _gameplayStart/gameplayStop_ events fire automatically when your game scene 
  starts and stops
  - _commercialBreak_ is requested before _gameplayStart_ is fired
- Disable input and audio during video ads
- Give you easy/global access to the SDK using `scene.plugins.get('poki')` 
  so you can:
  - check if users have any adblock enabled;
  - request a _rewardedBreak_


## How to use/install

This is a quick step by step tutorial on how to use our plugin. You can also 
always check the example in the [/example](example/) directory.

### Add the dependency

First, you have to make sure to add the `poki-phaser-3` plugin as a dependency 
to  your project:
```bash
$ npm install --save-dev poki-phaser-3
# or
$ yarn add --dev poki-phaser-3
```
<small>(note: at the time of writing, not yet published to npm)</small>

### Install plugin to Phaser's configuration

Step two is to add the plugin to the plugins section of your Phaser 
configuration, for example:
```javascript
import { PokiPlugin } from 'poki-phaser-3'
// ...
const config = {
  // ...
  plugins: {
    global: [
      {
        plugin: PokiPlugin,
        key: 'poki',
        start: true, // must be true, in order to load
        data: {
          // This must be the name of your loading scene
          loadingScene: 'LoadingScene',

          // This must be the name of your game (gameplay) scene
          gameplayScene: 'PlayScene',

          // This will always request a commercialBreak when gameplay starts,
          // set to false to disable this behaviour (recommended to have true,
          // see Poki SDK docs for more details).
          autoCommercialBreak: true
        }
      }
    ]
  }
}
// ...
var game = new Phaser.Game(config)
```
(more info on Phaser's configuration 
[here](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/game/))


## Example

This repository contains an example on how to use the Poki Phaser 3 plugin in 
the [/example](example/) directory. The main configuration/setup is done in the
[example/game.js](example/game.js) file.

The example game consist of a Loading-, Menu-, and Playscene to show the way the
plugin works with the Poki 'gameplayStart' event etc.

Checkout the MenuScene for an extensive example of using this library where we 
wait for the Poki SDK to be completely initialized, check if an adblock is 
detected and allows players to watch a rewarded adbreak. You can find this 
[code here](example/scenes/menu.js#L27).

To run the example use the following command:
```bash
$ yarn watch
Server running at http://localhost:1234
```
And point your browser to http://localhost:1234


## TODO

This project is currently in an early development phase. These steps are still 
left before we can publish it for general use:

- [x] Get it to work localhost
- [x] Auto mute & Disable keyboard input
- [x] Extend example with buttons to show off all plugin features (e.g. rewarded 
      ad)
- [x] Write readme & instructions
- [ ] Go over all exposed function/variable names
- [ ] Package into downloadable .js and publish to npm
- [ ] Test it in an existing game

## Credits

Background music credits:
https://github.com/photonstorm/phaser-examples/blob/master/examples/assets/audio/bodenstaendig_2000_in_rock_4bit.mp3

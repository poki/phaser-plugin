# Poki Phaser 3 Plugin
A Phaser 3 plugin to easially integrate the Poki SDK

- - -

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

First, you have to make sure to add the `@poki/phaser-3` plugin as a dependency 
to your project:
```bash
$ npm install --save-dev @poki/phaser-3
# or
$ yarn add --dev @poki/phaser-3
```

### Install plugin to Phaser's configuration

Step two is to add the plugin to the plugins section of your Phaser 
configuration, for example:
```javascript
import { PokiPlugin } from '@poki/phaser-3'
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
          // This must be the key/name of your loading scene
          loadingSceneKey: 'LoadingScene',

          // This must be the key/name of your game (gameplay) scene
          gameplaySceneKey: 'PlayScene',

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


### Usage

#### Loading & Gameplay Events

The Poki Phaser plugin will automatically call `PokiSDK.gameLoadingStart()` and
`PokiSDK.gameLoadingStop();` if the _loadingSceneKey_ is configured. The same is
true for the set _gameplaySceneKey_.

If your game doesn't use multiple scenes for gameplay you can manually call
the events like so:

```javascript
const poki = scene.plugins.get('poki') // get the plugin from the Phaser PluginManager
poki.gameplayStart()
// ... start gameplay ...
scene.on('player_died', () => {
  poki.gameplayStop()
})
```

#### On Initialized

To run code only when the PokiSDK is initialized you can use the following 
interface:

```javascript
const poki = scene.plugins.get('poki') // get the plugin from the Phaser PluginManager
poki.runWhenInitialized((poki) => {
  // This is called after the PokiSDK is fully initialized, or immediately if
  // the PokiSDK has already been initialized.
  if (poki.hasAdblock) {
    console.log('😢')
  }
})
```


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

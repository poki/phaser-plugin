import { Plugins } from 'phaser'

export const EVENT_INITIALIZED = 'poki:initialized'
export const RewardedBreakSize = Object.freeze({
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
})

function createSdkUnavailableError (methodName) {
  return new Error(`PokiSDK.${methodName} is unavailable. Wait for runWhenInitialized() and ensure hasAdblock is false before calling it.`)
}

export class PokiPlugin extends Plugins.BasePlugin {
  init ({ loadingSceneKey, gameplaySceneKey, autoCommercialBreak } = {}) {
    this._loadingSceneKey = loadingSceneKey
    this._gameplaySceneKey = gameplaySceneKey
    this._autoCommercialBreak = autoCommercialBreak

    this._scriptLoaded = false
    this._sdkInitFinished = false
    this._sdkReady = false
    this._initializeHooks = []
    this._queue = []
    this._initializationError = null
    this._initializationPromise = new Promise((resolve) => {
      this._resolveInitialization = resolve
    })

    this.initialized = false
    this.hasAdblock = true

    const script = document.createElement('script')
    script.setAttribute('type', 'text/javascript')
    script.setAttribute('src', 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js')
    script.addEventListener('load', () => {
      this._handleScriptLoad()
    })
    script.addEventListener('error', (event) => {
      this._handleScriptError(event)
    })
    document.head.appendChild(script)

    this._currentScenes = []
  }

  runWhenInitialized (callback) {
    if (this.initialized) {
      callback(this) // eslint-disable-line node/no-callback-literal
    } else {
      this._initializeHooks.push(callback)
    }
  }

  // Called by Phaser, do not use
  start () {
    this.game.events.on('step', this._update, this)
  }

  // Called by Phaser, do not use
  stop () {
    this.game.events.off('step', this._update)
  }

  _handleScriptLoad () {
    this.sdk = window.PokiSDK
    this._scriptLoaded = true
    this._flushQueue()

    if (!this._hasSdkMethod('init')) {
      const error = createSdkUnavailableError('init')
      console.error('PokiSDK failed', error)
      this._finishInitialization(error)
      return
    }

    this.sdk.init().then(() => {
      this._sdkReady = true
      this.hasAdblock = false
      this._finishInitialization()
    }).catch((error) => {
      console.error('PokiSDK failed', error)
      this._finishInitialization(error)
    })
  }

  _handleScriptError (event) {
    console.error('failed to load PokiSDK', event)
    this._queue = []
    this._finishInitialization(new Error('PokiSDK script failed to load'))
  }

  _finishInitialization (error) {
    if (this._sdkInitFinished) {
      return
    }

    this._sdkInitFinished = true
    this.initialized = true
    this.hasAdblock = !this._sdkReady
    this._initializationError = error || null

    this.game.events.emit(EVENT_INITIALIZED, this)
    this._initializeHooks.forEach(f => f(this))
    this._initializeHooks = []

    if (this._resolveInitialization) {
      this._resolveInitialization(this)
      this._resolveInitialization = undefined
    }
  }

  _flushQueue () {
    const queue = this._queue
    this._queue = []
    queue.forEach(f => f())
  }

  _hasSdkMethod (methodName) {
    return Boolean(this.sdk) && typeof this.sdk[methodName] === 'function'
  }

  _hasReadySdkMethod (methodName) {
    return this._sdkReady && this._hasSdkMethod(methodName)
  }

  _runWhenScriptLoaded (callback) {
    if (this._scriptLoaded) {
      callback()
      return
    }

    if (!this._sdkInitFinished) {
      this._queue.push(callback)
    }
  }

  _callWhenScriptLoaded (methodName, args = []) {
    this._runWhenScriptLoaded(() => {
      if (this._hasSdkMethod(methodName)) {
        this.sdk[methodName](...args)
      }
    })
  }

  _waitForInitialization () {
    if (this._sdkInitFinished) {
      return Promise.resolve(this)
    }

    return this._initializationPromise
  }

  _callSdkAsync (methodName, args = []) {
    return this._waitForInitialization().then(() => {
      if (!this._hasReadySdkMethod(methodName)) {
        throw createSdkUnavailableError(methodName)
      }

      return this.sdk[methodName](...args)
    })
  }

  _runDuringBreak (callback) {
    const keyboard = this.game.input && this.game.input.keyboard
    const canToggleKeyboard = Boolean(keyboard) && typeof keyboard.enabled === 'boolean'
    const wasKeyboardEnabled = canToggleKeyboard ? keyboard.enabled : false

    if (canToggleKeyboard) {
      keyboard.enabled = false
    }

    const sound = this.game.sound
    const canMuteSound = Boolean(sound) && typeof sound.mute === 'boolean'
    const wasMuted = canMuteSound ? sound.mute : false

    if (canMuteSound) {
      sound.mute = true
    }

    const restore = () => {
      if (canToggleKeyboard) {
        keyboard.enabled = wasKeyboardEnabled
      }

      if (canMuteSound) {
        sound.mute = wasMuted
      }
    }

    let result

    try {
      result = callback()
    } catch (error) {
      restore()
      throw error
    }

    return Promise.resolve(result).then((value) => {
      restore()
      return value
    }, (error) => {
      restore()
      throw error
    })
  }

  _update () {
    // Detect if new actives scenes are added or removed:
    const names = this.game.scene.getScenes(true).map(s => s.constructor.name)
    this._currentScenes.forEach(name => {
      if (names.indexOf(name) === -1) {
        this._currentScenes.splice(this._currentScenes.indexOf(name), 1)
        if (name === this._loadingSceneKey) {
          this.gameLoadingFinished()
        }
        if (name === this._gameplaySceneKey) {
          this.gameplayStop()
        }
      }
    })
    names.forEach(name => {
      if (this._currentScenes.indexOf(name) === -1) {
        this._currentScenes.push(name)
        if (name === this._loadingSceneKey) {
          this.gameLoadingStart()
        }
        if (name === this._gameplaySceneKey) {
          if (this._scriptLoaded && this._autoCommercialBreak && !this.hasAdblock) {
            this.commercialBreak().then(() => {
              this.gameplayStart()
            })
          } else {
            this.gameplayStart()
          }
        }
      }
    })
  }

  // Manually call the gameLoadedStart event in the PokiSDK, this is done
  // automatically if you've set the loadingSceneKey in the plugin data.
  gameLoadingStart () {
    this._callWhenScriptLoaded('gameLoadingStart')
  }

  // Manually call the gameLoadingFinished event in the PokiSDK, this is done
  // automatically if you've set the loadingSceneKey in the plugin data.
  gameLoadingFinished () {
    this._callWhenScriptLoaded('gameLoadingFinished')
  }

  // Manually call the gameplayStart event in the PokiSDK, this is done
  // automatically if you've set the gameplaySceneKey in the plugin data.
  gameplayStart () {
    this._callWhenScriptLoaded('gameplayStart')
  }

  // Manually call the gameplayStop event in the PokiSDK, this is done
  // automatically if you've set the gameplaySceneKey in the plugin data.
  gameplayStop () {
    this._callWhenScriptLoaded('gameplayStop')
  }

  // Manually request a commercialBreak via the PokiSDK, this is done
  // automatically if you've set autoCommercialBreak to true in the plugin data
  // and the configured gameplayScene started/resumed.
  commercialBreak (onStart) {
    return this._waitForInitialization().then(() => {
      if (!this._hasReadySdkMethod('commercialBreak')) {
        return undefined
      }

      return this._runDuringBreak(() => this.sdk.commercialBreak(onStart))
    })
  }

  // Trigger a rewardedBreak via the PokiSDK when called.
  rewardedBreak (onStartOrParams) {
    return this._waitForInitialization().then(() => {
      if (!this._hasReadySdkMethod('rewardedBreak')) {
        return false
      }

      return this._runDuringBreak(() => this.sdk.rewardedBreak(onStartOrParams))
    })
  }

  displayAd (container, size, onCanDestroy, onDisplayRendered) {
    this._callWhenScriptLoaded('displayAd', [container, size, onCanDestroy, onDisplayRendered])
  }

  destroyAd (container) {
    this._callWhenScriptLoaded('destroyAd', [container])
  }

  shareableURL (params = {}) {
    return this._callSdkAsync('shareableURL', [params])
  }

  getURLParam (key) {
    if (this._hasReadySdkMethod('getURLParam')) {
      return this.sdk.getURLParam(key)
    }

    const params = new URLSearchParams(window.location.search)
    const value = params.get(key)
    return value === null ? '' : value
  }

  getLanguage () {
    if (this._hasReadySdkMethod('getLanguage')) {
      return this.sdk.getLanguage()
    }

    return ''
  }

  getUser () {
    return this._callSdkAsync('getUser')
  }

  getToken () {
    return this._callSdkAsync('getToken')
  }

  login () {
    return this._callSdkAsync('login')
  }

  captureError (error) {
    this._callWhenScriptLoaded('captureError', [error])
  }

  setDebug (toggle) {
    this._callWhenScriptLoaded('setDebug', [toggle])
  }

  setLogging (toggle) {
    this._callWhenScriptLoaded('setLogging', [toggle])
  }

  enableEventTracking (cmpIndex) {
    this._callWhenScriptLoaded('enableEventTracking', [cmpIndex])
  }

  openExternalLink (url) {
    this._callWhenScriptLoaded('openExternalLink', [url])
  }

  playtestSetCanvas (canvas) {
    this._callWhenScriptLoaded('playtestSetCanvas', [canvas])
  }

  playtestCaptureHtmlOnce () {
    this._callWhenScriptLoaded('playtestCaptureHtmlOnce')
  }

  playtestCaptureHtmlForce () {
    this._callWhenScriptLoaded('playtestCaptureHtmlForce')
  }

  playtestCaptureHtmlOn () {
    this._callWhenScriptLoaded('playtestCaptureHtmlOn')
  }

  playtestCaptureHtmlOff () {
    this._callWhenScriptLoaded('playtestCaptureHtmlOff')
  }

  movePill (topPercent, topPx) {
    this._callWhenScriptLoaded('movePill', [topPercent, topPx])
  }

  measure (category, what, action) {
    this._callWhenScriptLoaded('measure', [category, what, action])
  }
}

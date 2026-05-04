import Phaser = require('phaser')

export declare const EVENT_INITIALIZED: 'poki:initialized'

export declare const RewardedBreakSize: {
  readonly SMALL: 'small'
  readonly MEDIUM: 'medium'
  readonly LARGE: 'large'
}

export type RewardedBreakSize = typeof RewardedBreakSize[keyof typeof RewardedBreakSize]

export interface InitOptions {
  debug?: boolean
  logging?: boolean
}

export interface User {
  username: string
  avatarUrl: string
}

export interface RewardedBreakParams {
  onStart?: () => void
  size?: RewardedBreakSize
}

export interface PokiPluginConfig {
  loadingSceneKey?: string
  gameplaySceneKey?: string
  autoCommercialBreak?: boolean
}

export interface PokiSDKGlobal {
  init: (options?: InitOptions) => Promise<void>
  rewardedBreak: (onStartOrParams?: (() => void) | RewardedBreakParams) => Promise<boolean>
  commercialBreak: (onStart?: () => void) => Promise<void>
  displayAd: (
    container: HTMLElement,
    size?: string,
    onCanDestroy?: () => void,
    onDisplayRendered?: (isEmpty: boolean) => void
  ) => void
  destroyAd: (container: HTMLElement) => void
  shareableURL: (params?: object) => Promise<string>
  getURLParam: (key: string) => string
  getLanguage: () => string
  getUser: () => Promise<User>
  getToken: () => Promise<string>
  login: () => Promise<void>
  captureError: (error: string | Error) => void
  gameLoadingStart: () => void
  gameLoadingFinished: () => void
  gameplayStart: () => void
  gameplayStop: () => void
  setDebug: (toggle: boolean) => void
  setLogging: (toggle: boolean) => void
  enableEventTracking: (cmpIndex: number | undefined) => void
  openExternalLink: (url: string) => void
  playtestSetCanvas: (canvas: HTMLCanvasElement | HTMLCanvasElement[] | null) => void
  playtestCaptureHtmlOnce: () => void
  playtestCaptureHtmlForce: () => void
  playtestCaptureHtmlOn: () => void
  playtestCaptureHtmlOff: () => void
  movePill: (topPercent: number, topPx: number) => void
  measure: (category: string, what: string, action: string) => void
}

export declare class PokiPlugin extends Phaser.Plugins.BasePlugin {
  sdk?: PokiSDKGlobal
  initialized: boolean
  hasAdblock: boolean

  init(config?: PokiPluginConfig): void
  runWhenInitialized(callback: (poki: PokiPlugin) => void): void
  start(): void
  stop(): void

  gameLoadingStart(): void
  gameLoadingFinished(): void
  gameplayStart(): void
  gameplayStop(): void

  commercialBreak(onStart?: () => void): Promise<void>
  rewardedBreak(onStartOrParams?: (() => void) | RewardedBreakParams): Promise<boolean>

  displayAd(
    container: HTMLElement,
    size?: string,
    onCanDestroy?: () => void,
    onDisplayRendered?: (isEmpty: boolean) => void
  ): void
  destroyAd(container: HTMLElement): void

  shareableURL(params?: object): Promise<string>
  getURLParam(key: string): string
  getLanguage(): string
  getUser(): Promise<User>
  getToken(): Promise<string>
  login(): Promise<void>
  captureError(error: string | Error): void
  setDebug(toggle: boolean): void
  setLogging(toggle: boolean): void
  enableEventTracking(cmpIndex: number | undefined): void
  openExternalLink(url: string): void
  playtestSetCanvas(canvas: HTMLCanvasElement | HTMLCanvasElement[] | null): void
  playtestCaptureHtmlOnce(): void
  playtestCaptureHtmlForce(): void
  playtestCaptureHtmlOn(): void
  playtestCaptureHtmlOff(): void
  movePill(topPercent: number, topPx: number): void
  measure(category: string, what: string, action: string): void
}

declare global {
  interface Window {
    PokiSDK?: PokiSDKGlobal
  }
}

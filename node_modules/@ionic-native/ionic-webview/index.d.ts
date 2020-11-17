import { IonicNativePlugin } from '@ionic-native/core';
/**
 * @name Ionic Webview
 * @capacitorincompatible true
 * @description
 * Access Web View utilities.
 *
 * Requires the Cordova plugin: `cordova-plugin-ionic-webview` > 2.0. For more info, please see the [Ionic Web View](https://github.com/ionic-team/cordova-plugin-ionic-webview) repository.
 *
 * @usage
 * ```typescript
 * import { WebView } from '@ionic-native/ionic-webview/ngx';
 *
 *
 * constructor(private webview: WebView) { }
 *
 * ...
 *
 * img = this.webview.convertFileSrc('file:///Users/dan/camera-image-12345.png')
 *
 * ```
 */
export declare class WebViewOriginal extends IonicNativePlugin {
    /**
     * Convert a `file://` URL to a URL that is compatible with the local web server in the Web View plugin.
     */
    convertFileSrc: (url: string) => string;
}

export declare const WebView: WebViewOriginal;
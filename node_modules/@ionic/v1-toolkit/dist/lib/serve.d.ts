import { ConfigFileProxy } from './config';
export declare type Application = import('express').Application;
export declare type Request = import('express').Request;
export declare type Response = import('express').Response;
export declare type NextFunction = import('express').NextFunction;
export declare type ProxyMiddlewareConfig = import('http-proxy-middleware').Config;
export declare const WATCH_PATTERNS: string[];
export declare function proxyConfigToMiddlewareConfig(proxy: ConfigFileProxy): ProxyMiddlewareConfig;
export interface ProxyConfig extends ProxyMiddlewareConfig {
    mount: string;
}
export interface ServeOptions {
    host: string;
    port: number;
    livereload: boolean;
    consolelogs: boolean;
    devPort: number;
    livereloadPort: number;
    wwwDir: string;
    engine: string;
    platform?: string;
    watchPatterns: string[];
    proxies: ProxyConfig[];
}
export declare function runServer(options: ServeOptions): Promise<ServeOptions>;

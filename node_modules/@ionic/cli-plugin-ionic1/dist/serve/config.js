"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
exports.WATCH_PATTERNS = [
    'www/**/*',
    '!www/lib/**/*',
    '!www/**/*.map'
];
exports.LOGGER_DIR = '__ion-dev-server';
exports.IONIC_LAB_URL = '/ionic-lab';
exports.DEFAULT_ADDRESS = '0.0.0.0';
exports.DEFAULT_LIVERELOAD_PORT = 35729;
exports.DEFAULT_SERVER_PORT = 8100;
exports.IOS_PLATFORM_PATH = path.join('platforms', 'ios', 'www');
exports.ANDROID_PLATFORM_PATH = path.join('platforms', 'android', 'assets', 'www');

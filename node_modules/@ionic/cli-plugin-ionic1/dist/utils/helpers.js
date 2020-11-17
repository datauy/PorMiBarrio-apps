"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function stringToInt(value, defaultValue) {
    const result = parseInt(value, 10);
    if (isNaN(result)) {
        return defaultValue;
    }
    return result;
}
exports.stringToInt = stringToInt;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_framework_1 = require("@ionic/cli-framework");
const gulp_1 = require("../lib/gulp");
class BuildCommand extends cli_framework_1.Command {
    async getMetadata() {
        return {
            name: 'build',
            summary: '',
        };
    }
    async run(inputs, options) {
        if (await gulp_1.hasTask('ionic:build:before')) {
            await gulp_1.runTask('ionic:build:before');
        }
        await gulp_1.runTask('sass');
        if (await gulp_1.hasTask('ionic:build:after')) {
            await gulp_1.runTask('ionic:build:after');
        }
    }
}
exports.BuildCommand = BuildCommand;

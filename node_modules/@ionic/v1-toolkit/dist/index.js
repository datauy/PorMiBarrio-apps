"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_framework_1 = require("@ionic/cli-framework");
const commands_1 = require("./commands");
class IonicV1Namespace extends cli_framework_1.Namespace {
    async getMetadata() {
        return {
            name: 'ionic-v1',
            summary: '',
        };
    }
    async getCommands() {
        return new cli_framework_1.CommandMap([
            ['build', async () => new commands_1.BuildCommand(this)],
            ['serve', async () => new commands_1.ServeCommand(this)],
        ]);
    }
}
exports.IonicV1Namespace = IonicV1Namespace;
const namespace = new IonicV1Namespace();
async function run(argv, env) {
    await cli_framework_1.execute({ namespace, argv, env });
}
exports.run = run;

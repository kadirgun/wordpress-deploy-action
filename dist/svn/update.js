"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
async function update(params) {
    const args = ['update'];
    if (params.setDepth) {
        args.push('--set-depth', params.setDepth);
    }
    if (params.recursive) {
        args.push('--recursive');
    }
    if (params.ignoreExternals) {
        args.push('--ignore-externals');
    }
    if (params.changelist) {
        args.push('--changelist', params.changelist);
    }
    if (params.path) {
        args.push(params.path);
    }
    const output = await (0, exec_1.getExecOutput)('svn', args);
    if (output.exitCode !== 0) {
        throw new Error(output.stderr);
    }
    const statusRegex = /^[A-Z]\s+(.*)$/;
    return output.stdout.split('\n').filter(line => {
        return statusRegex.test(line);
    });
}
exports.default = update;
//# sourceMappingURL=update.js.map
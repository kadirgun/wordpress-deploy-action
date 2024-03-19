"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
async function checkout(url, params) {
    const args = ['checkout'];
    if (params.depth) {
        args.push('--depth', params.depth);
    }
    args.push(url);
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
exports.default = checkout;
//# sourceMappingURL=checkout.js.map
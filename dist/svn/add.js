"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
async function add(path, params) {
    const args = ['add'];
    if (params.depth) {
        args.push('--depth', params.depth);
    }
    if (params.force) {
        args.push('--force');
    }
    args.push(path);
    const output = await (0, exec_1.getExecOutput)('svn', args);
    if (output.exitCode !== 0) {
        throw new Error(output.stderr);
    }
    const statusRegex = /^[A-Z]\s+(.*)$/;
    return output.stdout.split('\n').filter(line => {
        return statusRegex.test(line);
    });
}
exports.default = add;
//# sourceMappingURL=add.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
async function propset(params) {
    const args = ['propset', params.name, params.value, params.path];
    const output = await (0, exec_1.getExecOutput)('svn', args);
    if (output.exitCode !== 0) {
        throw new Error(output.stderr);
    }
    return output.stdout;
}
exports.default = propset;
//# sourceMappingURL=propset.js.map
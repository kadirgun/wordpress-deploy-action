"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_1 = require("@actions/exec");
async function rsync(source, destination, params) {
    const args = [];
    if (params.recursive) {
        args.push('-r');
    }
    if (params.checksum) {
        args.push('--checksum');
    }
    if (params.delete) {
        args.push('--delete');
    }
    if (params.deleteExcluded) {
        args.push('--delete-excluded');
    }
    args.push(source, destination);
    const output = await (0, exec_1.getExecOutput)('rsync', args, { silent: true });
    if (output.exitCode !== 0) {
        throw new Error(output.stderr);
    }
    return output.stdout;
}
exports.default = rsync;
//# sourceMappingURL=rsync.js.map
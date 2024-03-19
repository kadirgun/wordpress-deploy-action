"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mimeTypes = exports.removeMissingFiles = exports.svnColorize = exports.statusRegex = void 0;
const colorette_1 = require("colorette");
const svn_1 = __importDefault(require("./svn"));
exports.statusRegex = /^(?<status>[A-Z!])\s+(?<file>.*)$/;
const svnColorize = (text) => {
    const colorMap = {
        A: colorette_1.green,
        M: colorette_1.blue,
        D: colorette_1.red,
        C: colorette_1.yellow
    };
    const match = exports.statusRegex.exec(text);
    if (!match) {
        return text;
    }
    const status = match.groups?.status;
    if (!status || !colorMap[status]) {
        return text;
    }
    return colorMap[status](text);
};
exports.svnColorize = svnColorize;
const removeMissingFiles = async (files) => {
    for (const file of files) {
        await svn_1.default.remove(file);
    }
};
exports.removeMissingFiles = removeMissingFiles;
exports.mimeTypes = {
    png: 'image/png',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    svg: 'image/svg+xml'
};
//# sourceMappingURL=utils.js.map
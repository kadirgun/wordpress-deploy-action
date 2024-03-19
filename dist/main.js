"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const svn_1 = __importDefault(require("./svn"));
const path_1 = __importDefault(require("path"));
const rsync_1 = __importDefault(require("./rsync"));
const fs_1 = require("fs");
const glob = __importStar(require("@actions/glob"));
const utils_1 = require("./utils");
const options = {
    slug: '',
    mode: 'all',
    svnDir: '',
    assetsDir: '',
    buildDir: '',
    workspace: ''
};
/**
 * The main function for the action.
 * @returns {Promise<void>}
 */
async function run() {
    try {
        options.slug = core.getInput('slug', { required: true });
        options.svnDir = `/tmp/${options.slug}-svn`;
        options.workspace = process.env.GITHUB_WORKSPACE || '';
        if (!options.workspace) {
            throw new Error('GITHUB_WORKSPACE not set');
        }
        options.buildDir = core.getInput('build-dir');
        options.buildDir = path_1.default.join(options.workspace, options.buildDir);
        core.info(`Checking out ${options.slug}`);
        await svn_1.default.checkout(`https://plugins.svn.wordpress.org/${options.slug}/`, {
            depth: 'immediates',
            path: options.svnDir
        });
        options.mode = core.getInput('mode');
        core.info(`Preparing for ${options.mode} mode`);
        if (options.mode === 'assets') {
            await main.prepareAssets();
        }
        else if (options.mode === 'readme') {
            await main.prepareReadme();
        }
        else if (options.mode === 'plugin') {
            await main.preparePlugin();
        }
        else if (options.mode === 'all') {
            await main.prepareAssets();
            await main.preparePlugin();
        }
        else {
            throw new Error(`Invalid mode: ${options.mode}`);
        }
        let status = await svn_1.default.status({
            path: options.svnDir
        });
        if (status.length === 0) {
            core.info('No changes to commit');
            return;
        }
        core.info('Adding new files to SVN');
        svn_1.default.add(options.svnDir, {
            force: true
        });
        status = await svn_1.default.status({
            path: options.svnDir
        });
        const missingFiles = status.filter(file => file.startsWith('!')).map(file => file.slice(1).trim());
        if (missingFiles.length > 0) {
            core.info('Removing missing files from SVN');
            await (0, utils_1.removeMissingFiles)(missingFiles);
        }
        core.info('Final status of SVN');
        status = await svn_1.default.status({
            path: options.svnDir
        });
        core.info((0, utils_1.svnColorize)(status));
    }
    catch (error) {
        if (error instanceof Error)
            core.setFailed(error.message);
    }
}
async function prepareAssets() {
    await svn_1.default.update({
        path: `${options.svnDir}/assets`,
        setDepth: 'infinity'
    });
    options.assetsDir = core.getInput('assets-dir', { required: true });
    options.assetsDir = path_1.default.join(options.workspace, options.assetsDir);
    await (0, rsync_1.default)(`${options.assetsDir}/`, `${options.svnDir}/assets/`, {
        delete: true,
        checksum: true,
        recursive: true,
        deleteExcluded: true
    });
    const patterns = Object.keys(utils_1.mimeTypes)
        .map(ext => `${options.assetsDir}/**/*.${ext}`)
        .join('\n');
    const globber = await glob.create(patterns, {
        matchDirectories: false
    });
    for await (const file of globber.globGenerator()) {
        const ext = path_1.default.extname(file);
        const mimeType = utils_1.mimeTypes[ext.slice(1)];
        await svn_1.default.propset({
            name: 'svn:mime-type',
            value: mimeType,
            path: file
        });
    }
}
async function prepareReadme() {
    const readme = core.getInput('readme-file', { required: true });
    const trunk = path_1.default.join(options.svnDir, 'trunk');
    await svn_1.default.update({
        path: trunk,
        setDepth: 'infinity'
    });
    (0, fs_1.copyFileSync)(path_1.default.join(options.buildDir, readme), path_1.default.join(trunk, 'readme.txt'));
}
async function preparePlugin() {
    const trunk = path_1.default.join(options.svnDir, 'trunk');
    await svn_1.default.update({
        path: trunk,
        setDepth: 'infinity'
    });
    await (0, rsync_1.default)(options.buildDir, trunk, {
        delete: true,
        checksum: true,
        recursive: true,
        deleteExcluded: true
    });
}
const main = { run, prepareAssets, prepareReadme, preparePlugin };
exports.default = main;
//# sourceMappingURL=main.js.map
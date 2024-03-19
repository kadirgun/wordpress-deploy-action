import * as core from '@actions/core'
import svn from '@/svn'
import path from 'path'
import rsync from './rsync'
import { copyFileSync } from 'fs'
import * as glob from '@actions/glob'
import { mimeTypes, removeMissingFiles, svnColorize } from './utils'

const options = {
  slug: '',
  mode: 'all',
  svnDir: '',
  assetsDir: '',
  buildDir: '',
  workspace: ''
}

/**
 * The main function for the action.
 * @returns {Promise<void>}
 */
async function run(): Promise<void> {
  try {
    options.slug = core.getInput('slug', { required: true })
    options.svnDir = `/tmp/${options.slug}-svn`

    options.workspace = process.env.GITHUB_WORKSPACE || ''

    if (!options.workspace) {
      throw new Error('GITHUB_WORKSPACE not set')
    }

    options.buildDir = core.getInput('build-dir')
    options.buildDir = path.join(options.workspace, options.buildDir)

    core.info(`Checking out ${options.slug}`)

    const checkout = await svn.checkout(`https://plugins.svn.wordpress.org/${options.slug}/`, {
      depth: 'immediates',
      path: options.svnDir
    })

    options.mode = core.getInput('mode')
    core.info(`Preparing for ${options.mode} mode`)

    if (options.mode === 'assets') {
      await main.prepareAssets()
    } else if (options.mode === 'readme') {
      await main.prepareReadme()
    } else if (options.mode === 'plugin') {
      await main.preparePlugin()
    } else if (options.mode === 'all') {
      await main.prepareAssets()
      await main.preparePlugin()
    } else {
      throw new Error(`Invalid mode: ${options.mode}`)
    }

    let status = await svn.status({
      path: options.svnDir
    })

    if (status.length === 0) {
      core.info('No changes to commit')
      return
    }

    core.info('Adding new files to SVN')
    svn.add(options.svnDir, {
      force: true
    })

    status = await svn.status({
      path: options.svnDir
    })

    const missingFiles = status.filter(file => file.startsWith('!')).map(file => file.slice(1).trim())
    if (missingFiles.length > 0) {
      core.info('Removing missing files from SVN')
      await removeMissingFiles(missingFiles)
    }

    core.info('Final status of SVN')

    status = await svn.status({
      path: options.svnDir
    })

    core.info(svnColorize(status))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/**
 * The main function for the action.
 * @returns {Promise<void>}
 */
async function prepareAssets(): Promise<void> {
  await svn.update({
    path: `${options.svnDir}/assets`,
    setDepth: 'infinity'
  })

  options.assetsDir = core.getInput('assets-dir', { required: true })
  options.assetsDir = path.join(options.workspace, options.assetsDir)

  await rsync(`${options.assetsDir}/`, `${options.svnDir}/assets/`, {
    delete: true,
    checksum: true,
    recursive: true,
    deleteExcluded: true
  })

  const patterns = Object.keys(mimeTypes)
    .map(ext => `${options.assetsDir}/**/*.${ext}`)
    .join('\n')

  const globber = await glob.create(patterns, {
    matchDirectories: false
  })

  for await (const file of globber.globGenerator()) {
    const ext = path.extname(file)
    const mimeType = mimeTypes[ext.slice(1) as keyof typeof mimeTypes]
    await svn.propset({
      name: 'svn:mime-type',
      value: mimeType,
      path: file
    })
  }
}

async function prepareReadme() {
  const readme = core.getInput('readme-file', { required: true })
  const trunk = path.join(options.svnDir, 'trunk')

  await svn.update({
    path: trunk,
    setDepth: 'infinity'
  })

  copyFileSync(path.join(options.buildDir, readme), path.join(trunk, 'readme.txt'))
}

async function preparePlugin() {
  const trunk = path.join(options.svnDir, 'trunk')

  await svn.update({
    path: trunk,
    setDepth: 'infinity'
  })

  await rsync(options.buildDir, trunk, {
    delete: true,
    checksum: true,
    recursive: true,
    deleteExcluded: true
  })
}

const main = { run, prepareAssets, prepareReadme, preparePlugin }

export default main

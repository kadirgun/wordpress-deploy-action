import * as core from '@actions/core'
import svn from './svn'
import path from 'path'
import rsync from './rsync'
import { copyFileSync, existsSync } from 'fs'
import * as glob from '@actions/glob'
import { getRevisionNumber, mimeTypes, readVersionFromMainFile, removeMissingFiles } from './utils'
import { green } from 'colorette'

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
    options.svnDir = `/tmp/svn/${options.slug}`

    options.workspace = process.cwd()

    options.buildDir = core.getInput('build-dir')
    options.buildDir = path.join(options.workspace, options.buildDir)

    core.info(`Checking out ${options.slug}`)

    await svn.checkout(`https://plugins.svn.wordpress.org/${options.slug}`, {
      depth: 'immediates',
      path: options.svnDir
    })

    options.mode = core.getInput('mode')
    core.info(`Preparing for mode ${options.mode}`)

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
    await svn.add(options.svnDir, {
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

    if (options.mode === 'plugin' || options.mode === 'all') {
      await main.createNewTag()
    }

    if (options.mode === 'assets' || options.mode === 'all') {
      core.info('Setting mime type for assets')
      await setMimeTypes()
    }

    const updateOutput = await svn.update({
      path: options.svnDir,
      notOnlyStatus: true
    })
    const revision = getRevisionNumber(updateOutput)
    core.setOutput('revision', revision.toString())

    core.info('Final status of SVN')

    const changes = await svn.status({
      path: options.svnDir,
      print: true
    })
    core.setOutput('changes', changes)

    const dryRun = core.getBooleanInput('dry-run')
    if (dryRun) {
      core.info('Dry run enabled, skipping commit')
      return
    }

    core.info('Committing to SVN')

    const username = core.getInput('svn-username', { required: true })
    const password = core.getInput('svn-password', { required: true })

    await svn.commit({
      path: options.svnDir,
      message: `Deploy from GitHub action with ${options.mode} mode`,
      noAuthCache: true,
      username,
      password
    })

    core.info(green(`Deployed to SVN revision ${revision}`))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function prepareAssets(): Promise<void> {
  await svn.update({
    path: `${options.svnDir}/assets`,
    setDepth: 'infinity'
  })

  options.assetsDir = core.getInput('assets-dir')
  options.assetsDir = path.join(options.workspace, options.assetsDir)

  core.info(`Copying assets from ${options.assetsDir} to ${options.svnDir}/assets`)

  await rsync(`${options.assetsDir}/`, `${options.svnDir}/assets/`, {
    delete: true,
    checksum: true,
    recursive: true,
    deleteExcluded: true
  })
}

async function setMimeTypes(): Promise<void> {
  const patterns = Object.keys(mimeTypes)
    .map(ext => `${options.svnDir}/assets/**/*.${ext}`)
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

async function prepareReadme(): Promise<void> {
  const readme = core.getInput('readme-name')
  const trunkDir = path.join(options.svnDir, 'trunk')

  await svn.update({
    path: trunkDir,
    setDepth: 'infinity'
  })

  core.info(`Copying readme from ${options.buildDir} to ${trunkDir}`)

  copyFileSync(path.join(options.buildDir, readme), path.join(trunkDir, readme))
}

async function preparePlugin(): Promise<void> {
  const trunkDir = path.join(options.svnDir, 'trunk')

  await svn.update({
    path: trunkDir,
    setDepth: 'infinity'
  })

  core.info(`Copying plugin from ${options.buildDir} to ${trunkDir}`)

  await rsync(`${options.buildDir}/`, `${trunkDir}/`, {
    delete: true,
    checksum: true,
    recursive: true,
    deleteExcluded: true
  })
}

async function createNewTag(): Promise<void> {
  const trunkDir = path.join(options.svnDir, 'trunk')

  let version = core.getInput('version')
  if (!version) {
    const mainFile = core.getInput('main-name', { required: true })
    const mainFilePath = path.join(trunkDir, mainFile)
    core.info(`Reading version from ${mainFilePath}`)
    version = readVersionFromMainFile(mainFilePath)
  }

  if (version.startsWith('v')) {
    version = version.slice(1)
  }

  core.setOutput('version', version)

  const tagDir = path.join(options.svnDir, 'tags', version)

  if (existsSync(tagDir)) {
    throw new Error(`Tag ${version} already exists`)
  }

  core.info(`Creating tag ${tagDir}`)
  await svn.copy({
    source: trunkDir,
    destination: tagDir
  })
}

const main = { run, prepareAssets, prepareReadme, preparePlugin, createNewTag, setMimeTypes }

export default main

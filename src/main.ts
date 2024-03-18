import * as core from '@actions/core'
import svn from '@/svn'
import path from 'path'
import rsync from './rsync'

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
export async function run(): Promise<void> {
  try {
    options.slug = core.getInput('slug', { required: true })
    options.svnDir = `/tmp/${options.slug}-svn`

    options.workspace = process.env.GITHUB_WORKSPACE || ''

    if (!options.workspace) {
      throw new Error('GITHUB_WORKSPACE is not set')
    }

    core.info(`Checking out ${options.slug}`)

    const checkout = await svn.checkout(
      `https://plugins.svn.wordpress.org/${options.slug}/`,
      {
        depth: 'immediates',
        path: options.svnDir
      }
    )

    core.info(`Checked out ${options.slug} ${checkout.length} files`)

    options.mode = core.getInput('mode')

    if (options.mode === 'assets') {
      await prepareAssets()
    } else if (options.mode === 'readme') {
      await prepareReadme()
    } else if (options.mode === 'plugin') {
      await preparePlugin()
    } else if (options.mode === 'all') {
      await prepareAssets()
      await preparePlugin()
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function prepareAssets() {
  await svn.update({
    path: `${options.svnDir}/assets`,
    setDepth: 'infinity'
  })

  options.assetsDir = core.getInput('assets_dir', { required: true })
  options.assetsDir = path.join(options.workspace, options.assetsDir)

  await rsync(options.assetsDir, `${options.svnDir}/assets`, {
    delete: true,
    checksum: true,
    recursive: true,
    deleteExcluded: true
  })
}

async function prepareReadme() {
  const readme = core.getInput('readme-file', { required: true })
}

async function preparePlugin() {}

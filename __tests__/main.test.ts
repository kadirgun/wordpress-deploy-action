import * as core from '@actions/core'
import main from '../src/main'
import svn from '../src/svn'
import * as rsync from '../src/rsync'
import { DefaultGlobber } from '@actions/glob/lib/internal-globber'
import * as utils from '../src/utils'
import { after } from 'node:test'
import fs from 'fs'

// Mock the action's main functions
const runMock = jest.spyOn(main, 'run')
let prepareAssetsMock: jest.SpiedFunction<typeof main.prepareAssets>
let prepareReadmeMock: jest.SpiedFunction<typeof main.prepareReadme>
let preparePluginMock: jest.SpiedFunction<typeof main.preparePlugin>
let rsyncMock: jest.SpiedFunction<typeof rsync.default>

// Mock the GitHub Actions core library
let infoMock: jest.SpiedFunction<typeof core.info>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>
let getBooleanInputMock: jest.SpiedFunction<typeof core.getBooleanInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let svnCheckoutMock: jest.SpiedFunction<typeof svn.checkout>
let svnUpdateMock: jest.SpiedFunction<typeof svn.update>
let svnPropsetMock: jest.SpiedFunction<typeof svn.propset>
let svnAddMock: jest.SpiedFunction<typeof svn.add>
let svnStatusMock: jest.SpiedFunction<typeof svn.status>
let svnRemoveMock: jest.SpiedFunction<typeof svn.remove>
let svnCommitMock: jest.SpiedFunction<typeof svn.commit>
let svnCopyMock: jest.SpiedFunction<typeof svn.copy>
let readVersionFromMainFileMock: jest.SpiedFunction<typeof utils.readVersionFromMainFile>
let existsSyncMock: jest.SpiedFunction<typeof fs.existsSync>

const workspace = process.cwd()

let options: Record<string, string>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    options = {
      slug: 'plugin-slug',
      mode: 'all',
      'assets-dir': '.wordpress.org',
      'build-dir': 'build',
      'main-file': 'plugin.php'
    }

    infoMock = jest.spyOn(core, 'info').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation(name => options[name])
    getBooleanInputMock = jest.spyOn(core, 'getBooleanInput').mockReturnValue(false)

    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()

    prepareAssetsMock = jest.spyOn(main, 'prepareAssets')
    prepareReadmeMock = jest.spyOn(main, 'prepareReadme')
    preparePluginMock = jest.spyOn(main, 'preparePlugin')

    // Mock the SVN functions
    svnCheckoutMock = jest.spyOn(svn, 'checkout').mockResolvedValue(['A /some/path'])
    svnUpdateMock = jest.spyOn(svn, 'update').mockResolvedValue(['Updating .', 'A /some/path', 'At revision 3054689.'])
    svnAddMock = jest.spyOn(svn, 'add').mockResolvedValue(['A /some/path'])
    svnStatusMock = jest.spyOn(svn, 'status').mockResolvedValue(['A /some/path'])
    svnRemoveMock = jest.spyOn(svn, 'remove').mockResolvedValue(['D /some/path'])
    svnPropsetMock = jest.spyOn(svn, 'propset').mockResolvedValue(['property set on /some/path'])
    svnCommitMock = jest.spyOn(svn, 'commit').mockResolvedValue(['Committed revision 123.'])
    svnCopyMock = jest.spyOn(svn, 'copy').mockResolvedValue(['A /some/path'])

    rsyncMock = jest.spyOn(rsync, 'default').mockReturnValue(Promise.resolve(''))
    readVersionFromMainFileMock = jest.spyOn(utils, 'readVersionFromMainFile').mockReturnValue('1.0.0')
    existsSyncMock = jest.spyOn(fs, 'existsSync').mockReturnValue(false)

    // AsyncGenerator<string, void>
    jest.spyOn(DefaultGlobber.prototype, 'globGenerator').mockReturnValue(
      (async function* () {
        yield '/path/to/file1.png'
        yield '/path/to/file2.jpg'
      })()
    )
  })

  after(() => {
    jest.clearAllMocks()
  })

  it('checkout runs when slug exists', async () => {
    await main.run()
    expect(runMock).toHaveReturned()
    expect(svnCheckoutMock).toHaveBeenCalled()
  })

  it('prepareAssets runs when mode is assets', async () => {
    options.mode = 'assets'
    getInputMock.mockImplementationOnce(name => options[name])
    prepareAssetsMock.mockResolvedValueOnce()

    await main.run()
    expect(runMock).toHaveBeenCalled()
    expect(prepareAssetsMock).toHaveBeenCalled()
  })

  it('prepareReadme runs when mode is readme', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'slug':
          return 'plugin-slug'
        case 'mode':
          return 'readme'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(prepareReadmeMock).toHaveBeenCalled()
  })

  it('preparePlugin runs when mode is plugin', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'slug':
          return 'plugin-slug'
        case 'mode':
          return 'plugin'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(preparePluginMock).toHaveBeenCalled()
    expect(setOutputMock).toHaveBeenCalled()
  })

  it('prepareAssets and preparePlugin run when mode is all', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'slug':
          return 'plugin-slug'
        case 'mode':
          return 'all'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(prepareAssetsMock).toHaveBeenCalled()
    expect(preparePluginMock).toHaveBeenCalled()
  })

  it('all works', async () => {
    getInputMock.mockImplementation(name => {
      return options[name] || ''
    })

    svnStatusMock.mockResolvedValue(['! /some/missing/path'])

    await main.run()
    expect(runMock).toHaveReturned()
    expect(setFailedMock).not.toHaveBeenCalled()

    expect(svnUpdateMock).toHaveBeenCalledWith({
      path: `/tmp/svn/${options['slug']}/assets`,
      setDepth: 'infinity'
    })

    expect(rsyncMock).toHaveBeenCalledWith(
      `${workspace}/${options['assets-dir']}/`,
      `/tmp/svn/${options['slug']}/assets/`,
      {
        delete: true,
        checksum: true,
        recursive: true,
        deleteExcluded: true
      }
    )

    expect(svnPropsetMock).toHaveBeenCalledWith({
      name: 'svn:mime-type',
      value: 'image/png',
      path: '/path/to/file1.png'
    })

    expect(svnUpdateMock).toHaveBeenCalledWith({
      path: `/tmp/svn/${options['slug']}/assets`,
      setDepth: 'infinity'
    })

    expect(rsyncMock).toHaveBeenCalledWith(
      `${workspace}/${options['build-dir']}/`,
      `/tmp/svn/${options['slug']}/trunk/`,
      {
        delete: true,
        checksum: true,
        recursive: true,
        deleteExcluded: true
      }
    )

    expect(readVersionFromMainFileMock).toHaveBeenCalledWith(
      `/tmp/svn/${options['slug']}/trunk/${options['main-file']}`
    )

    expect(svnCopyMock).toHaveBeenCalledWith({
      source: `/tmp/svn/${options['slug']}/trunk`,
      destination: '/tmp/svn/plugin-slug/tags/1.0.0'
    })

    expect(svnAddMock).toHaveBeenCalledWith('/tmp/svn/plugin-slug', {
      force: true
    })

    expect(svnStatusMock).toHaveBeenCalledWith({
      path: '/tmp/svn/plugin-slug'
    })

    expect(svnRemoveMock).toHaveBeenCalledWith('/some/missing/path')

    expect(svnCommitMock).toHaveBeenCalled()

    // do not commit when dry-run is true
    {
      svnCommitMock.mockClear()
      getBooleanInputMock.mockReturnValue(true)

      await main.run()

      expect(svnStatusMock).toHaveBeenCalledWith({
        path: '/tmp/svn/plugin-slug',
        print: true
      })
      expect(svnCommitMock).not.toHaveBeenCalled()
    }

    // do not commit when no changes
    {
      svnStatusMock.mockResolvedValue([])

      await main.run()

      expect(svnStatusMock).toHaveBeenCalledWith({
        path: '/tmp/svn/plugin-slug'
      })

      expect(infoMock).toHaveBeenCalledWith('No changes to commit')
    }
  })

  it('if version starts with v', async () => {
    options.version = 'v2.0.0'

    getInputMock.mockImplementation(name => {
      return options[name] || ''
    })

    await main.run()

    expect(svnCopyMock).toHaveBeenCalledWith({
      source: `/tmp/svn/${options['slug']}/trunk`,
      destination: '/tmp/svn/plugin-slug/tags/2.0.0'
    })
  })

  it('tag already exists', async () => {
    existsSyncMock.mockReturnValue(true)

    await main.run()

    expect(readVersionFromMainFileMock).toHaveBeenCalled()
    expect(existsSyncMock).toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalled()
  })

  it('invalid mode', async () => {
    options.mode = 'invalid'
    getInputMock.mockImplementation(name => options[name])

    await main.run()

    expect(setFailedMock).toHaveBeenCalled()
  })
})

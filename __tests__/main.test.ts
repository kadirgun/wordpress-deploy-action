/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import main from '../src/main'
import svn from '../src/svn'
import * as rsync from '../src/rsync'
import { Globber } from '@actions/glob'
import { DefaultGlobber } from '@actions/glob/lib/internal-globber'

// Mock the action's main functions
const runMock = jest.spyOn(main, 'run')
let prepareAssetsMock: jest.SpiedFunction<typeof main.prepareAssets>
let prepareReadmeMock: jest.SpiedFunction<typeof main.prepareReadme>
let preparePluginMock: jest.SpiedFunction<typeof main.preparePlugin>
let rsyncMock: jest.SpiedFunction<typeof rsync.default>
let globGeneratorMock: jest.SpiedFunction<Globber['globGenerator']>

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>
let svnCheckoutMock: jest.SpiedFunction<typeof svn.checkout>
let svnUpdateMock: jest.SpiedFunction<typeof svn.update>
let svnPropsetMock: jest.SpiedFunction<typeof svn.propset>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    prepareAssetsMock = jest.spyOn(main, 'prepareAssets')
    prepareReadmeMock = jest.spyOn(main, 'prepareReadme')
    preparePluginMock = jest.spyOn(main, 'preparePlugin')
    svnCheckoutMock = jest
      .spyOn(svn, 'checkout')
      .mockResolvedValue(['A /some/path'])
    svnUpdateMock = jest
      .spyOn(svn, 'update')
      .mockResolvedValue(['A /some/path'])
    svnPropsetMock = jest.spyOn(svn, 'propset').mockResolvedValue('')

    rsyncMock = jest
      .spyOn(rsync, 'default')
      .mockReturnValue(Promise.resolve(''))

    // AsyncGenerator<string, void>
    globGeneratorMock = jest
      .spyOn(DefaultGlobber.prototype, 'globGenerator')
      .mockReturnValue(
        (async function* () {
          yield '/path/to/file1.png'
          yield '/path/to/file2.jpg'
        })()
      )
    process.env.GITHUB_WORKSPACE = '/tmp/workspace'
  })

  it('checkout runs when slug exists', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'slug':
          return 'plugin-slug'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    expect(svnCheckoutMock).toHaveBeenCalled()
  })

  it('fails when GITHUB_WORKSPACE not set', async () => {
    delete process.env.GITHUB_WORKSPACE
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'slug':
          return 'plugin-slug'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(getInputMock).toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalled()
  })

  it('fails when slug empty', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'slug':
          throw new Error('Input required')
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(getInputMock).toHaveBeenCalled()
    expect(setFailedMock).toHaveBeenCalled()
  })

  it('prepareAssets runs when mode is assets', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'slug':
          return 'plugin-slug'
        case 'mode':
          return 'assets'
        case 'assets-dir':
          return 'assets-dir'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveBeenCalled()
    expect(svnUpdateMock).toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()
    expect(rsyncMock).toHaveBeenCalledWith(
      `/tmp/workspace/assets-dir/`,
      '/tmp/plugin-slug-svn/assets/',
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
})

import { existsSync, rmSync } from 'fs'
import main from '../src/main'
import * as core from '@actions/core'
import * as exec from '../src/svn/exec'
import * as rsync from '../src/rsync'

jest.mock('@actions/core')

const coreMock = core as jest.Mocked<typeof core>
const execMock = jest.spyOn(exec, 'default')
const rsyncMock = jest.spyOn(rsync, 'default')

const options: Record<string, string> = {
  slug: 'akismet',
  mode: 'all',
  'build-dir': 'wordpress/build',
  'assets-dir': 'wordpress/.wordpress.org',
  'main-file': 'main.php'
}

describe('deploy', () => {
  afterAll(() => {
    rmSync('/tmp/svn/akismet', { recursive: true, force: true })
  })

  beforeAll(() => {
    rmSync('/tmp/svn/akismet', { recursive: true, force: true })
  })

  it('real', async () => {
    coreMock.getInput.mockImplementation((name: string) => options[name] || '')
    const workspace = process.cwd()

    await main.run()

    expect(coreMock.setFailed).toHaveBeenCalledWith(expect.stringContaining('svn commit'))

    // svn checkout --depth immediates https://plugins.svn.wordpress.org/akismet /tmp/svn/akismet
    expect(execMock).toHaveBeenCalledWith(
      ['checkout', '--depth', 'immediates', 'https://plugins.svn.wordpress.org/akismet', '/tmp/svn/akismet'],
      expect.anything()
    )

    // prepareAssets
    {
      expect(existsSync('/tmp/svn/akismet/assets')).toBe(true)

      // svn update --set-depth infinity /tmp/svn/akismet/assets
      expect(execMock).toHaveBeenCalledWith(
        ['update', '--set-depth', 'infinity', '/tmp/svn/akismet/assets'],
        expect.anything()
      )

      // rsync -r --checksum --delete --delete-excluded ./wordpress/.wordpress.org/ /tmp/svn/akismet/assets/
      expect(rsyncMock).toHaveBeenCalledWith(
        `${workspace}/wordpress/.wordpress.org/`,
        '/tmp/svn/akismet/assets/',
        expect.anything()
      )
    }

    // preparePlugin
    {
      expect(existsSync('/tmp/svn/akismet/trunk')).toBe(true)

      expect(execMock).toHaveBeenCalledWith(
        ['update', '--set-depth', 'infinity', '/tmp/svn/akismet/trunk'],
        expect.anything()
      )

      expect(rsyncMock).toHaveBeenCalledWith(
        `${workspace}/wordpress/build/`,
        '/tmp/svn/akismet/trunk/',
        expect.anything()
      )
    }

    expect(execMock).toHaveBeenCalledWith(['add', '--force', '/tmp/svn/akismet'], expect.anything())

    expect(execMock).toHaveBeenCalledWith(['status', '/tmp/svn/akismet'], expect.anything())

    // createNewTag
    {
      expect(execMock).toHaveBeenCalledWith(
        ['copy', '/tmp/svn/akismet/trunk', '/tmp/svn/akismet/tags/0.0.0'],
        expect.anything()
      )

      expect(core.setOutput).toHaveBeenCalledWith('version', '0.0.0')
    }

    expect(execMock).toHaveBeenCalledWith(expect.arrayContaining(['commit', '/tmp/svn/akismet']), expect.anything())
  }, 1000000)
})

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
  slug: 'hello-dolly',
  mode: 'all',
  'build-dir': 'wordpress/build',
  'assets-dir': 'wordpress/.wordpress.org',
  'main-file': 'main.php'
}

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('deploy', () => {
  afterAll(() => {
    rmSync('/tmp/svn/hello-dolly', { recursive: true, force: true })
  })

  beforeAll(() => {
    rmSync('/tmp/svn/hello-dolly', { recursive: true, force: true })
  })

  it('real', async () => {
    coreMock.getInput.mockImplementation((name: string) => options[name] || '')
    const workspace = process.cwd()

    await main.run()

    expect(coreMock.setFailed).toHaveBeenCalledWith(expect.stringContaining('svn commit'))

    // svn checkout --depth immediates https://plugins.svn.wordpress.org/hello-dolly /tmp/svn/hello-dolly
    expect(execMock).toHaveBeenCalledWith(
      ['checkout', '--depth', 'immediates', 'https://plugins.svn.wordpress.org/hello-dolly', '/tmp/svn/hello-dolly'],
      expect.anything()
    )

    // prepareAssets
    {
      expect(existsSync('/tmp/svn/hello-dolly/assets')).toBe(true)

      // svn update --set-depth infinity /tmp/svn/hello-dolly/assets
      expect(execMock).toHaveBeenCalledWith(
        ['update', '--set-depth', 'infinity', '/tmp/svn/hello-dolly/assets'],
        expect.anything()
      )

      // rsync -r --checksum --delete --delete-excluded ./wordpress/.wordpress.org/ /tmp/svn/hello-dolly/assets/
      expect(rsyncMock).toHaveBeenCalledWith(
        `${workspace}/wordpress/.wordpress.org/`,
        '/tmp/svn/hello-dolly/assets/',
        expect.anything()
      )
    }

    // preparePlugin
    {
      expect(existsSync('/tmp/svn/hello-dolly/trunk')).toBe(true)

      expect(execMock).toHaveBeenCalledWith(
        ['update', '--set-depth', 'infinity', '/tmp/svn/hello-dolly/trunk'],
        expect.anything()
      )

      expect(rsyncMock).toHaveBeenCalledWith(
        `${workspace}/wordpress/build/`,
        '/tmp/svn/hello-dolly/trunk/',
        expect.anything()
      )
    }

    expect(execMock).toHaveBeenCalledWith(['add', '--force', '/tmp/svn/hello-dolly'], expect.anything())

    expect(execMock).toHaveBeenCalledWith(['status', '/tmp/svn/hello-dolly'], expect.anything())

    // createNewTag
    {
      expect(execMock).toHaveBeenCalledWith(
        ['copy', '/tmp/svn/hello-dolly/trunk', '/tmp/svn/hello-dolly/tags/0.0.0'],
        expect.anything()
      )

      expect(core.setOutput).toHaveBeenCalledWith('version', '0.0.0')
    }

    expect(execMock).toHaveBeenCalledWith(expect.arrayContaining(['commit', '/tmp/svn/hello-dolly']), expect.anything())
  }, 1000000)
})

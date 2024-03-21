import main from '../src/main'
import * as core from '@actions/core'
import * as exec from '../src/svn/exec'
import * as rsync from '../src/rsync'
import fs from 'fs'

jest.mock('@actions/core')

const coreMock = core as jest.Mocked<typeof core>
const execMock = jest.spyOn(exec, 'default')
const rsyncMock = jest.spyOn(rsync, 'default')
const copyFileSync = jest.spyOn(fs, 'copyFileSync')

const options: Record<string, string> = {
  slug: 'hello-dolly',
  mode: 'all',
  'build-dir': 'wordpress/build',
  'assets-dir': 'wordpress/.wordpress.org',
  'main-name': 'main.php',
  'readme-name': 'README.txt'
}

describe('deploy', () => {
  afterAll(() => {
    fs.rmSync(`/tmp/svn/${options.slug}`, { recursive: true, force: true })
  })

  beforeAll(() => {
    fs.rmSync(`/tmp/svn/${options.slug}`, { recursive: true, force: true })
  })

  const workspace = process.cwd()

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip(
    'all',
    async () => {
      options.mode = 'all'
      coreMock.getInput.mockImplementation((name: string) => options[name] || '')
      await main.run()

      expect(coreMock.setFailed).toHaveBeenCalledWith(expect.stringContaining('svn commit'))

      // svn checkout --depth immediates https://plugins.svn.wordpress.org/hello-dolly /tmp/svn/hello-dolly
      expect(execMock).toHaveBeenCalledWith(
        [
          'checkout',
          '--depth',
          'immediates',
          `https://plugins.svn.wordpress.org/${options.slug}`,
          `/tmp/svn/${options.slug}`
        ],
        expect.anything()
      )

      // prepareAssets
      {
        expect(fs.existsSync(`/tmp/svn/${options.slug}/assets`)).toBe(true)

        // svn update --set-depth infinity /tmp/svn/hello-dolly/assets
        expect(execMock).toHaveBeenCalledWith(
          ['update', '--set-depth', 'infinity', `/tmp/svn/${options.slug}/assets`],
          expect.anything()
        )

        // rsync -r --checksum --delete --delete-excluded ./wordpress/.wordpress.org/ /tmp/svn/hello-dolly/assets/
        expect(rsyncMock).toHaveBeenCalledWith(
          `${workspace}/wordpress/.wordpress.org/`,
          `/tmp/svn/${options.slug}/assets/`,
          expect.anything()
        )
      }

      // preparePlugin
      {
        expect(fs.existsSync(`/tmp/svn/${options.slug}/trunk`)).toBe(true)

        expect(execMock).toHaveBeenCalledWith(
          ['update', '--set-depth', 'infinity', `/tmp/svn/${options.slug}/trunk`],
          expect.anything()
        )

        expect(rsyncMock).toHaveBeenCalledWith(
          `${workspace}/wordpress/build/`,
          '/tmp/svn/${options.slug}/trunk/',
          expect.anything()
        )
      }

      expect(execMock).toHaveBeenCalledWith(['add', '--force', `/tmp/svn/${options.slug}`], expect.anything())

      expect(execMock).toHaveBeenCalledWith(['status', `/tmp/svn/${options.slug}`], expect.anything())

      // createNewTag
      {
        expect(execMock).toHaveBeenCalledWith(
          ['copy', `/tmp/svn/${options.slug}/trunk`, `/tmp/svn/${options.slug}/tags/0.0.0`],
          expect.anything()
        )

        expect(core.setOutput).toHaveBeenCalledWith('version', '0.0.0')
      }

      expect(execMock).toHaveBeenCalledWith(
        expect.arrayContaining(['commit', `/tmp/svn/${options.slug}`]),
        expect.anything()
      )
    },
    20 * 1000
  )

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip(
    'assets',
    async () => {
      options.mode = 'assets'
      coreMock.getInput.mockImplementation((name: string) => options[name] || '')
      await main.run()

      expect(execMock).toHaveBeenCalledWith(
        [
          'checkout',
          '--depth',
          'immediates',
          `https://plugins.svn.wordpress.org/${options.slug}`,
          `/tmp/svn/${options.slug}`
        ],
        expect.anything()
      )

      expect(fs.existsSync(`/tmp/svn/${options.slug}/assets`)).toBe(true)

      // svn update --set-depth infinity /tmp/svn/hello-dolly/assets
      expect(execMock).toHaveBeenCalledWith(
        ['update', '--set-depth', 'infinity', `/tmp/svn/${options.slug}/assets`],
        expect.anything()
      )

      // rsync -r --checksum --delete --delete-excluded ./wordpress/.wordpress.org/ /tmp/svn/hello-dolly/assets/
      expect(rsyncMock).toHaveBeenCalledWith(
        `${workspace}/wordpress/.wordpress.org/`,
        `/tmp/svn/${options.slug}/assets/`,
        expect.anything()
      )

      expect(execMock).toHaveBeenCalledWith(['add', '--force', `/tmp/svn/${options.slug}`], expect.anything())

      expect(execMock).toHaveBeenCalledWith(['status', `/tmp/svn/${options.slug}`], expect.anything())

      expect(execMock).toHaveBeenCalledWith(
        expect.arrayContaining(['commit', `/tmp/svn/${options.slug}`]),
        expect.anything()
      )
    },
    20 * 1000
  )

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip(
    'readme',
    async () => {
      options.mode = 'readme'
      coreMock.getInput.mockImplementation((name: string) => options[name] || '')
      await main.run()

      // svn update --set-depth infinity /tmp/svn/hello-dolly/trunk
      expect(execMock).toHaveBeenCalledWith(
        ['update', '--set-depth', 'infinity', `/tmp/svn/${options.slug}/trunk`],
        expect.anything()
      )

      expect(copyFileSync).toHaveBeenCalledWith(
        `${workspace}/${options['build-dir']}/${options['readme-name']}`,
        expect.anything()
      )

      expect(execMock).toHaveBeenCalledWith(
        expect.arrayContaining(['status', `/tmp/svn/${options.slug}`]),
        expect.anything()
      )

      expect(execMock).toHaveBeenCalledWith(['add', '--force', `/tmp/svn/${options.slug}`], expect.anything())
    },
    20 * 1000
  )
})

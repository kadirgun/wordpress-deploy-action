import svn from '../src/svn'
import * as exec from '@actions/exec'

const execMock = jest.spyOn(exec, 'getExecOutput')

describe('svn', () => {
  it('checkout', async () => {
    execMock.mockResolvedValueOnce({
      stdout: 'A /some/path',
      stderr: '',
      exitCode: 0
    })

    await svn.checkout('https://plugins.svn.wordpress.org/plugin-slug/', {
      depth: 'immediates',
      path: '/path/to/checkout'
    })

    expect(execMock).toHaveBeenCalledWith(
      'svn',
      [
        'checkout',
        '--depth',
        'immediates',
        'https://plugins.svn.wordpress.org/plugin-slug/',
        '/path/to/checkout'
      ],
      expect.anything()
    )
  })

  it('add', async () => {
    execMock.mockResolvedValueOnce({
      stdout: 'A /some/path',
      stderr: '',
      exitCode: 0
    })

    await svn.add('/path/to/add', {
      depth: 'immediates',
      force: true
    })

    expect(execMock).toHaveBeenCalledWith(
      'svn',
      ['add', '--depth', 'immediates', '--force', '/path/to/add'],
      expect.anything()
    )
  })

  it('update', async () => {
    execMock.mockResolvedValueOnce({
      stdout: 'A /some/path',
      stderr: '',
      exitCode: 0
    })

    await svn.update({
      setDepth: 'immediates',
      recursive: true,
      ignoreExternals: true,
      changelist: 'test',
      path: '/path/to/update'
    })

    expect(execMock).toHaveBeenCalledWith(
      'svn',
      [
        'update',
        '--set-depth',
        'immediates',
        '--recursive',
        '--ignore-externals',
        '--changelist',
        'test',
        '/path/to/update'
      ],
      expect.anything()
    )
  })

  it('status', async () => {
    execMock.mockResolvedValueOnce({
      stdout: 'A /some/path',
      stderr: '',
      exitCode: 0
    })

    await svn.status({ path: '/path/to/status' })

    expect(execMock).toHaveBeenCalledWith(
      'svn',
      ['status', '/path/to/status'],
      expect.anything()
    )
  })
})

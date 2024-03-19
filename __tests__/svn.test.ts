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

    expect(execMock).toHaveBeenCalledWith('svn', [
      'checkout',
      '--depth',
      'immediates',
      'https://plugins.svn.wordpress.org/plugin-slug/',
      '/path/to/checkout'
    ])
  })

  it('add', async () => {
    execMock.mockResolvedValueOnce({
      stdout: 'A /some/path\nA /some/other/path',
      stderr: '',
      exitCode: 0
    })

    await expect(
      svn.add('/path/to/add', {
        depth: 'immediates',
        force: true
      })
    ).resolves.toEqual(['A /some/path', 'A /some/other/path'])

    expect(execMock).toHaveBeenCalledWith('svn', ['add', '--depth', 'immediates', '--force', '/path/to/add'])
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

    expect(execMock).toHaveBeenCalledWith('svn', [
      'update',
      '--set-depth',
      'immediates',
      '--recursive',
      '--ignore-externals',
      '--changelist',
      'test',
      '/path/to/update'
    ])
  })

  it('status', async () => {
    execMock.mockResolvedValueOnce({
      stdout: 'A /some/path',
      stderr: '',
      exitCode: 0
    })

    await svn.status({ path: '/path/to/status' })
    expect(execMock).toHaveBeenCalledWith('svn', ['status', '/path/to/status'])

    await svn.status()
    expect(execMock).toHaveBeenCalledWith('svn', ['status'])
  })

  it('propset', async () => {
    execMock.mockResolvedValueOnce({
      stdout: 'property set',
      stderr: '',
      exitCode: 0
    })

    await svn.propset({
      name: 'svn:mime-type',
      value: 'text/plain',
      path: '/path/to/propset'
    })

    expect(execMock).toHaveBeenCalledWith('svn', ['propset', 'svn:mime-type', 'text/plain', '/path/to/propset'])
  })

  it('remove', async () => {
    execMock.mockResolvedValueOnce({
      stdout: 'D /some/path',
      stderr: '',
      exitCode: 0
    })

    await svn.remove('/path/to/remove')

    expect(execMock).toHaveBeenCalledWith('svn', ['remove', '/path/to/remove'])
  })

  it('error', async function () {
    execMock.mockResolvedValue({
      stdout: '',
      stderr: 'svn error',
      exitCode: 1
    })

    await expect(
      svn.checkout('https://plugins.svn.wordpress.org/plugin-slug/', {
        depth: 'immediates',
        path: '/path/to/checkout'
      })
    ).rejects.toThrow()

    await expect(
      svn.add('/path/to/add', {
        depth: 'immediates',
        force: true
      })
    ).rejects.toThrow()

    await expect(
      svn.update({
        setDepth: 'immediates',
        recursive: true,
        ignoreExternals: true,
        changelist: 'test',
        path: '/path/to/update'
      })
    ).rejects.toThrow()

    await expect(svn.status({ path: '/path/to/status' })).rejects.toThrow()

    await expect(svn.remove('/path/to/remove', { force: true })).rejects.toThrow()

    await expect(
      svn.propset({
        name: 'svn:mime-type',
        value: 'text/plain',
        path: '/path/to/propset'
      })
    ).rejects.toThrow()
  })
})

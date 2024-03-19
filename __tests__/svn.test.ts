import svn from '../src/svn'
import * as exec from '../src/svn/exec'

const execMock = jest.spyOn(exec, 'default')

describe('svn', () => {
  it('checkout', async () => {
    execMock.mockResolvedValueOnce(['A /some/path'])

    await svn.checkout('https://plugins.svn.wordpress.org/plugin-slug/', {
      depth: 'immediates',
      path: '/path/to/checkout'
    })

    expect(execMock).toHaveBeenCalledWith(
      ['checkout', '--depth', 'immediates', 'https://plugins.svn.wordpress.org/plugin-slug/', '/path/to/checkout'],
      {
        silent: true,
        onlyStatus: true
      }
    )
  })

  it('add', async () => {
    execMock.mockResolvedValueOnce(['A /some/path'])

    await expect(
      svn.add('/path/to/add', {
        depth: 'immediates',
        force: true
      })
    ).resolves.toEqual(['A /some/path'])

    expect(execMock).toHaveBeenCalledWith(['add', '--depth', 'immediates', '--force', '/path/to/add'], {
      silent: true,
      onlyStatus: true
    })
  })

  it('update', async () => {
    execMock.mockResolvedValueOnce(['A /some/path'])

    await svn.update({
      setDepth: 'immediates',
      recursive: true,
      ignoreExternals: true,
      changelist: 'test',
      path: '/path/to/update'
    })

    expect(execMock).toHaveBeenCalledWith(
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
      {
        silent: true,
        onlyStatus: true
      }
    )
  })

  it('status', async () => {
    execMock.mockResolvedValueOnce(['A /some/path'])

    await svn.status({ path: '/path/to/status' })
    expect(execMock).toHaveBeenCalledWith(['status', '/path/to/status'], {
      silent: true,
      onlyStatus: true
    })

    await svn.status()
    expect(execMock).toHaveBeenCalledWith(['status'], {
      silent: true,
      onlyStatus: true
    })
  })

  it('propset', async () => {
    execMock.mockResolvedValueOnce(['property set on /some/path'])

    await svn.propset({
      name: 'svn:mime-type',
      value: 'text/plain',
      path: '/path/to/propset'
    })

    expect(execMock).toHaveBeenCalledWith(['propset', 'svn:mime-type', 'text/plain', '/path/to/propset'], {
      silent: true
    })
  })

  it('remove', async () => {
    execMock.mockResolvedValueOnce(['A /some/path'])

    await svn.remove('/path/to/remove')

    expect(execMock).toHaveBeenCalledWith(['remove', '/path/to/remove'], {
      silent: true,
      onlyStatus: true
    })
  })

  it('error', async function () {
    execMock.mockRejectedValue(new Error('error'))

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

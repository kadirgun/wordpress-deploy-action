import rsync from '../src/rsync'
import * as exec from '@actions/exec'

const execMock = jest.spyOn(exec, 'getExecOutput')

describe('rsync', () => {
  it('rsync', async () => {
    execMock.mockResolvedValueOnce({
      stdout: 'rsync output',
      stderr: '',
      exitCode: 0
    })

    await rsync('/path/to/source', '/path/to/destination', {
      recursive: true,
      checksum: true,
      delete: true,
      deleteExcluded: true
    })

    expect(execMock).toHaveBeenCalledWith(
      'rsync',
      [
        '-r',
        '--checksum',
        '--delete',
        '--delete-excluded',
        '/path/to/source',
        '/path/to/destination'
      ],
      expect.anything()
    )
  })
})

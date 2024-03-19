import * as originalExec from '@actions/exec'
import * as core from '@actions/core'
import exec from '../src/svn/exec'
import { svnColorize } from '../src/utils'

const execMock = jest.spyOn(originalExec, 'exec')
const infoMock = jest.spyOn(core, 'info').mockImplementation(jest.fn())
let line = 'test line'

describe('exec', () => {
  it('success', async () => {
    execMock.mockImplementation(
      async (commandLine: string, args?: string[] | undefined, options?: originalExec.ExecOptions | undefined) => {
        options?.listeners?.stdline?.(line)

        return 0
      }
    )

    await exec(['status'], {})
    expect(execMock).toHaveBeenCalledWith('svn', ['status'], expect.any(Object))
    expect(infoMock).toHaveBeenCalledWith(line)

    infoMock.mockReset()
    await exec(['status'], { onlyStatus: true })
    expect(infoMock).not.toHaveBeenCalled()

    infoMock.mockReset()
    line = 'M       test.txt'
    await exec(['status'], { colorize: true })
    expect(infoMock).toHaveBeenCalledWith(svnColorize(line))

    await exec(['status'])
    expect(infoMock).toHaveBeenCalledWith(line)
  })

  it('error', async () => {
    execMock.mockImplementation(
      async (commandLine: string, args?: string[] | undefined, options?: originalExec.ExecOptions | undefined) => {
        options?.listeners?.errline?.('error line')

        return 1
      }
    )

    await expect(exec(['status'], {})).rejects.toThrow('error line')

    expect(execMock).toHaveBeenCalledWith('svn', ['status'], expect.any(Object))
  })
})

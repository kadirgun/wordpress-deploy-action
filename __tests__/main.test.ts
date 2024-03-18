/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import svn from '../src/svn'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>

let svnCheckoutMock = jest.spyOn(svn, 'checkout').mockResolvedValue([])

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('checkout runs when slug exists', async () => {
    process.env.GITHUB_WORKSPACE = '/tmp/workspace'

    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'slug':
          return 'akismet'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    expect(svnCheckoutMock).toHaveBeenCalled()
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
})

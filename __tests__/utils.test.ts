import * as utils from '../src/utils'
import { blue, red, green, yellow } from 'colorette'
import { after } from 'node:test'
import fs from 'fs'

const { svnColorize, readVersionFromMainFile, getRevisionNumber } = utils

const readFileSyncMock = jest.spyOn(fs, 'readFileSync')
const readVersionFromMainFileMock = jest.spyOn(utils, 'readVersionFromMainFile')

describe('utils', () => {
  after(() => {
    jest.clearAllMocks()
  })

  it('svnColorize', () => {
    expect(svnColorize('A /some/path')).toBe(green('A /some/path'))
    expect(svnColorize('M /some/path')).toBe(blue('M /some/path'))
    expect(svnColorize('D /some/path')).toBe(red('D /some/path'))
    expect(svnColorize('C /some/path')).toBe(yellow('C /some/path'))
    expect(svnColorize('X /some/path')).toBe('X /some/path')
    expect(svnColorize('test')).toBe('test')
  })

  it('readVersionFromMainFile', () => {
    readFileSyncMock.mockReturnValue('/*\n * version: 1.0.0\n */')
    expect(readVersionFromMainFile('path')).toEqual('1.0.0')
    expect(readVersionFromMainFileMock).not.toThrow()

    readFileSyncMock.mockReturnValue('/*\n * version: x.x.x\n */')
    expect(readVersionFromMainFileMock).toThrow()
  })

  it('getRevisionNumber', () => {
    expect(() => getRevisionNumber([])).toThrow()
    expect(() => getRevisionNumber(['test'])).toThrow()
    expect(getRevisionNumber(['Committed revision 123.'])).toEqual(123)
  })
})

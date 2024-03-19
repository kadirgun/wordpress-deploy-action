import * as utils from '../src/utils'
import { blue, red, green, yellow } from 'colorette'

describe('utils', () => {
  it('svnColorize', () => {
    expect(utils.svnColorize('A /some/path')).toBe(green('A /some/path'))
    expect(utils.svnColorize('M /some/path')).toBe(blue('M /some/path'))
    expect(utils.svnColorize('D /some/path')).toBe(red('D /some/path'))
    expect(utils.svnColorize('C /some/path')).toBe(yellow('C /some/path'))
    expect(utils.svnColorize('X /some/path')).toBe('X /some/path')
    expect(utils.svnColorize('test')).toBe('test')
  })
})

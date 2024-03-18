/**
 * Unit tests for the action's entrypoint, src/index.ts
 */

import { rmSync } from 'fs'
import svn from '../src/svn'
import * as exec from '@actions/exec'

const checkoutMock = jest.spyOn(svn, 'checkout')
const execMock = jest.spyOn(exec, 'getExecOutput')

describe('svn', () => {
  it('checkout success', async () => {
    const output = await svn
      .checkout('https://plugins.svn.wordpress.org/akismet/', {
        depth: 'immediates',
        path: '/tmp/svn-checkout-test'
      })
      .finally(() => {
        rmSync('/tmp/svn-checkout-test', { recursive: true, force: true })
      })

    expect(output.length).toBeGreaterThan(0)

    expect(checkoutMock).toHaveBeenCalledWith(
      'https://plugins.svn.wordpress.org/akismet/',
      {
        depth: 'immediates',
        path: '/tmp/svn-checkout-test'
      }
    )
  })

  it('checkout failure', async () => {
    await expect(
      svn.checkout('https://plugins.svn.wordpress.org/', {
        depth: 'immediates'
      })
    ).rejects.toThrow()

    expect(checkoutMock).toHaveBeenCalledWith(
      'https://plugins.svn.wordpress.org/',
      {
        depth: 'immediates'
      }
    )
  })
})

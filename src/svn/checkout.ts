import { getExecOutput } from '@actions/exec'

export type CheckoutParams = {
  /**
   * Limit operation by depth
   */
  depth?: 'empty' | 'files' | 'immediates' | 'infinity'
  /**
   * If PATH is omitted, the basename of the URL will be used as
   * the destination. If multiple URLs are given each will be checked
   * out into a sub-directory of PATH, with the name of the sub-directory
   * being the basename of the URL.
   */
  path?: string
}

export default async (url: string, params: CheckoutParams) => {
  const args = ['checkout']

  if (params.depth) {
    args.push('--depth', params.depth)
  }

  args.push(url)

  if (params.path) {
    args.push(params.path)
  }

  const output = await getExecOutput('svn', args)

  if (output.exitCode !== 0) {
    throw new Error(output.stderr)
  }

  const statusRegex = /^[A-Z]\s+(.*)$/

  return output.stdout.split('\n').filter(line => {
    return statusRegex.test(line)
  })
}

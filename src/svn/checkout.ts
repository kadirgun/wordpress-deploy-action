import exec from './exec'

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

async function checkout(url: string, params: CheckoutParams): Promise<string[]> {
  const args = ['checkout']

  if (params.depth) {
    args.push('--depth', params.depth)
  }

  args.push(url)

  if (params.path) {
    args.push(`${params.path}`)
  }

  return exec(args, {
    silent: true,
    onlyStatus: true
  })
}

export default checkout

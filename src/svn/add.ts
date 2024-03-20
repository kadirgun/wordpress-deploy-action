import exec from './exec'

export type AddParams = {
  depth?: 'empty' | 'files' | 'immediates' | 'infinity'
  force?: boolean
}
async function add(path: string, params: AddParams = {}): Promise<string[]> {
  const args = ['add']

  if (params.depth) {
    args.push('--depth', params.depth)
  }

  if (params.force) {
    args.push('--force')
  }

  args.push(`${path}`)

  return exec(args, {
    silent: true,
    onlyStatus: true
  })
}

export default add

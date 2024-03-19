import exec from './exec'

export type RemoveParams = {
  force?: boolean
}

async function remove(path: string, params?: RemoveParams): Promise<string[]> {
  const args = ['remove']

  params = params || {}

  if (params.force) {
    args.push('--force')
  }

  args.push(path)

  return exec(args, {
    silent: true,
    onlyStatus: true
  })
}

export default remove

import exec from './exec'

export type StatusParams = {
  path?: string
}

async function status(params?: StatusParams): Promise<string[]> {
  const args = ['status']

  params = params || {}

  if (params.path) {
    args.push(params.path)
  }

  return exec(args, {
    silent: true,
    onlyStatus: true
  })
}

export default status

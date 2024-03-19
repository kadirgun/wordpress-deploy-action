import exec from './exec'

export type UpdateParams = {
  setDepth?: 'empty' | 'files' | 'immediates' | 'infinity'
  recursive?: boolean
  ignoreExternals?: boolean
  changelist?: string
  path?: string
  notOnlyStatus?: boolean
}

async function update(params: UpdateParams): Promise<string[]> {
  const args = ['update']

  if (params.setDepth) {
    args.push('--set-depth', params.setDepth)
  }

  if (params.recursive) {
    args.push('--recursive')
  }

  if (params.ignoreExternals) {
    args.push('--ignore-externals')
  }

  if (params.changelist) {
    args.push('--changelist', params.changelist)
  }

  if (params.path) {
    args.push(params.path)
  }

  return await exec(args, {
    silent: true,
    onlyStatus: !params.notOnlyStatus
  })
}

export default update

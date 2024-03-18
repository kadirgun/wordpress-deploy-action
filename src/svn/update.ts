import { getExecOutput } from '@actions/exec'

export type UpdateParams = {
  setDepth?: 'empty' | 'files' | 'immediates' | 'infinity'
  recursive?: boolean
  ignoreExternals?: boolean
  changelist?: string
  path?: string
}

export default async (params: UpdateParams) => {
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

  const output = await getExecOutput('svn', args, { silent: true })

  const statusRegex = /^[A-Z]\s+(.*)$/

  return output.stdout.split('\n').filter(line => {
    return statusRegex.test(line)
  })
}

import { getExecOutput } from '@actions/exec'

export type UpdateParams = {
  setDepth?: 'empty' | 'files' | 'immediates' | 'infinity'
  recursive?: boolean
  ignoreExternals?: boolean
  changelist?: string
  path?: string
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

  const output = await getExecOutput('svn', args)

  if (output.exitCode !== 0) {
    throw new Error(output.stderr)
  }

  const statusRegex = /^[A-Z]\s+(.*)$/

  return output.stdout.split('\n').filter(line => {
    return statusRegex.test(line)
  })
}

export default update

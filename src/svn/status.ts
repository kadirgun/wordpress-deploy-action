import { getExecOutput } from '@actions/exec'

export type StatusParams = {
  path?: string
}

export default async (params: StatusParams) => {
  const args = ['status']

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

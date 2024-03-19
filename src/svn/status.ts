import { getExecOutput } from '@actions/exec'

export type StatusParams = {
  path?: string
}

async function status(params?: StatusParams): Promise<string[]> {
  const args = ['status']

  params = params || {}

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

export default status

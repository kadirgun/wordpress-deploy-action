import { getExecOutput } from '@actions/exec'

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

  const output = await getExecOutput('svn', args)

  if (output.exitCode !== 0) {
    throw new Error(output.stderr)
  }

  const statusRegex = /^[A-Z]\s+(.*)$/

  return output.stdout.split('\n').filter(line => {
    return statusRegex.test(line)
  })
}

export default remove

import { getExecOutput } from '@actions/exec'

export type AddParams = {
  depth?: 'empty' | 'files' | 'immediates' | 'infinity'
  force?: boolean
}
async function add(path: string, params: AddParams): Promise<string[]> {
  const args = ['add']

  if (params.depth) {
    args.push('--depth', params.depth)
  }

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

export default add

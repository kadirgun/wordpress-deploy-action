import { getExecOutput } from '@actions/exec'

export type RsyncParams = {
  recursive?: boolean
  checksum?: boolean
  delete?: boolean
  deleteExcluded?: boolean
}

async function rsync(source: string, destination: string, params: RsyncParams): Promise<string> {
  const args: string[] = []

  if (params.recursive) {
    args.push('-r')
  }

  if (params.checksum) {
    args.push('--checksum')
  }

  if (params.delete) {
    args.push('--delete')
  }

  if (params.deleteExcluded) {
    args.push('--delete-excluded')
  }

  args.push(source, destination)

  const output = await getExecOutput('rsync', args, { silent: true })

  if (output.exitCode !== 0) {
    throw new Error(output.stderr)
  }

  return output.stdout
}

export default rsync

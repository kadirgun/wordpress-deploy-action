import { getExecOutput } from '@actions/exec'

export type RsyncParams = {
  recursive?: boolean
  checksum?: boolean
  delete?: boolean
  deleteExcluded?: boolean
}

export default async (
  source: string,
  destination: string,
  params: RsyncParams
) => {
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

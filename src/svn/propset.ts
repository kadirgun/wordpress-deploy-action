import { getExecOutput } from '@actions/exec'

export type PropSetParams = {
  name: 'svn:mime-type' | 'svn:executable' | 'svn:keywords' | 'svn:eol-style'
  value: string
  path: string
}

export default async function propset(params: PropSetParams) {
  const args = ['propset', params.name, params.value, params.path]

  const output = await getExecOutput('svn', args)

  if (output.exitCode != 0) {
    throw new Error(output.stderr)
  }

  return output.stdout
}

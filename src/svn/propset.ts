import exec from './exec'

export type PropSetParams = {
  name: 'svn:mime-type' | 'svn:executable' | 'svn:keywords' | 'svn:eol-style'
  value: string
  path: string
}

async function propset(params: PropSetParams): Promise<string[]> {
  const args = ['propset', params.name, params.value, `${params.path}`]

  return exec(args, {
    silent: true
  })
}

export default propset

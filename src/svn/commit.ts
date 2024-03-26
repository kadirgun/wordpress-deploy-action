import exec from './exec'

export type CommitParams = {
  noAuthCache?: boolean
  username?: string
  password?: string
  message?: string
  path?: string
}

async function commit(params: CommitParams): Promise<string[]> {
  const args = ['commit', '--non-interactive']

  if (params.noAuthCache) {
    args.push('--no-auth-cache')
  }

  if (params.username) {
    args.push('--username', `'${params.username}'`)
  }

  if (params.password) {
    args.push('--password', `'${params.password}'`)
  }

  if (params.message) {
    args.push('-m', `'${params.message}'`)
  }

  if (params.path) {
    args.push(`${params.path}`)
  }

  return exec(args, { silent: true })
}

export default commit

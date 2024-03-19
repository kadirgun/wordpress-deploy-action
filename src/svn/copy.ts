import exec from './exec'

export type CopyParams = {
  source: string
  destination: string
}

async function copy(params: CopyParams): Promise<string[]> {
  const args = ['copy', params.source, params.destination]

  return exec(args, { silent: true })
}

export default copy

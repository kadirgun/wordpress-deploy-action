import { exec as execute } from '@actions/exec'
import * as core from '@actions/core'
import { statusRegex, svnColorize } from '../utils'

export type SvnExecOptions = {
  silent?: boolean
  colorize?: boolean
  onlyStatus?: boolean
}

async function exec(args: string[], options: SvnExecOptions = {}): Promise<string[]> {
  const output: string[] = []

  const statusCode = await execute('svn', args, {
    silent: true,
    ignoreReturnCode: true,
    listeners: {
      stdline: (line: string) => {
        if (options.onlyStatus && !statusRegex.test(line)) {
          return
        }

        output.push(line)

        if (options.colorize) {
          line = svnColorize(line)
        }

        if (!options.silent) {
          core.info(line)
        }
      },
      errline: (line: string) => {
        output.push(line)
      }
    }
  })

  if (statusCode !== 0) {
    throw new Error([['svn', ...args].join(' '), ...output].join('\n'))
  }

  return output
}

export default exec

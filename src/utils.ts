import { blue, red, yellow, green } from 'colorette'
import svn from './svn'
import { readFileSync } from 'fs'
import { last } from 'lodash'

export const statusRegex = /^(?<status>[A-Z!])\s+(?<file>.*)$/

export const svnColorize = (text: string): string => {
  const colorMap: Record<string, typeof green> = {
    A: green,
    M: blue,
    D: red,
    C: yellow
  }

  const match = statusRegex.exec(text)

  if (!match) {
    return text
  }

  const status = match.groups?.status

  if (!status || !colorMap[status]) {
    return text
  }

  return colorMap[status](text)
}

export const removeMissingFiles = async (files: string[]): Promise<void> => {
  for (const file of files) {
    await svn.remove(file)
  }
}

export function readVersionFromMainFile(path: string): string {
  const content = readFileSync(path, 'utf8')

  const match = content.match(/\*\s*version\s*:\s+?(?<version>[0-9.]+)/i)

  if (!match || !match.groups) {
    throw new Error('Could not find version in main file')
  }

  return match.groups.version
}

export function getRevisionNumber(output: string[]): number {
  const revision = last(output)

  if (!revision) {
    throw new Error('Could not parse revision number')
  }

  const match = revision.match(/(\d+)/)

  if (!match) {
    throw new Error(`Could not parse revision number from: ${revision}`)
  }

  return parseInt(match[0], 10)
}

export const mimeTypes = {
  png: 'image/png',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml'
}

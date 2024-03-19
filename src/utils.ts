import { blue, red, yellow, green } from 'colorette'
import svn from './svn'

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

export const mimeTypes = {
  png: 'image/png',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml'
}

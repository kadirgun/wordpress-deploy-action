import { blue, red, yellow, green, bold } from 'colorette'
import svn from './svn'

export const svnColorize = (lines: string[]): string => {
  const statusRegex = /^([A-Z])\s+(.+)/
  const colorMap = {
    A: green,
    M: blue,
    D: red,
    C: yellow
  }

  return lines
    .map(line => {
      const match = line.match(statusRegex)
      if (match) {
        const [, status, file] = match
        const color = colorMap[status as keyof typeof colorMap]
        return color(`${bold(status)} ${file}`)
      }

      return line
    })
    .join('\n')
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

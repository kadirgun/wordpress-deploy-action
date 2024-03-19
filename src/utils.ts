import { blue, red, yellow, green, bold } from 'colorette'

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
        const [_, status, file] = match
        const color = colorMap[status as keyof typeof colorMap]
        return color(`${bold(status)} ${file}`)
      }

      return line
    })
    .join('\n')
}

export const mimeTypes = {
  png: 'image/png',
  gif: 'image/gif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml'
}

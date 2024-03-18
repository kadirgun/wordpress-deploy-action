import * as core from '@actions/core'
import svn from '@/svn'

/**
 * The main function for the action.
 * @returns {Promise<void>}
 */
export async function run(): Promise<void> {
  try {
    const slug = core.getInput('slug', { required: true })

    await svn.checkout(`https://plugins.svn.wordpress.org/${slug}/`, {
      depth: 'immediates'
    })
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

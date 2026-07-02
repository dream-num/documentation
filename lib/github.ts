'use server'

import { unstable_cache } from 'next/cache'

const getCachedRepoStarsAndForks = unstable_cache(
  async (owner: string, repo: string) => {
    const endpoint = `https://api.github.com/repos/${owner}/${repo}`
    const headers = new Headers({
      'Content-Type': 'application/json',
    })

    const response = await fetch(endpoint, {
      headers,
      next: {
        revalidate: 86400,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return { stars: 0, forks: 0 }
      }
      const message = await response.text()
      throw new Error(`Failed to fetch repository data: ${message}`)
    }

    const data = await response.json()
    return {
      stars: data.stargazers_count as number,
      forks: data.forks_count as number,
    }
  },
  ['github-repo-stats'],
  {
    revalidate: 86400,
  },
)

export async function getRepoStarsAndForks(
  owner: string,
  repo: string,
) {
  return await getCachedRepoStarsAndForks(owner, repo)
}

export async function getGuidesEditUrl(path: string) {
  return `https://github.com/dream-num/univer-documentation/tree/dev/content/guides/${path}`
}

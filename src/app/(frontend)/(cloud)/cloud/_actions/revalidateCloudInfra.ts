'use server'

import { uuidTags } from '@uuid'

import { revalidateCache } from './revalidateCache'

export type RevalidateCloudInfraArgs = {
  deploymentRecordId?: null | number | string
  projectRecordId: number | string
  projectSlug?: null | string
}

/** Align RSC `fetch` tags with Cloud polling / deployment logs when infra state changes. */
export async function revalidateCloudInfraCache(args: RevalidateCloudInfraArgs): Promise<void> {
  const tags = new Set<string>([
    uuidTags.cloud.projects,
    ...uuidTags.cloud.projectDetailRevalidateTags({
      id: args.projectRecordId,
      slug: args.projectSlug,
    }),
  ])
  const dep = args.deploymentRecordId
  if (dep != null && String(dep) !== '') {
    tags.add(uuidTags.cloud.deploymentById(dep))
  }
  await revalidateCache({ tags: [...tags] })
}

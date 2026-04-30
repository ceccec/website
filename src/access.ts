import type { Project, User } from './payload-cloud-types'

export const checkRole = (allRoles: User['roles'], user: User): boolean => {
  if (user) {
    if (
      (allRoles || []).some((role) => {
        return user?.roles?.some((individualRole) => {
          return individualRole === role
        })
      })
    ) {
      return true
    }
  }

  return false
}

export const canUserMangeProject = ({
  project,
  user,
}: {
  project: null | Project | undefined
  user: null | undefined | User
}): boolean => {
  if (!user) {
    return false
  }

  if (checkRole(['admin'], user)) {
    return true
  }

  const userTeams = user?.teams || []

  const team = project?.team
  const projectTeamId =
    typeof team === 'object' && team !== null && 'id' in team ? team.id : team

  if (!projectTeamId) {
    return false
  }

  const isTeamOwner = userTeams.find(({ roles, team }) => {
    const userTeamId = typeof team === 'object' && 'id' in team ? team.id : team
    const userIsOnTeam = userTeamId === projectTeamId
    return userIsOnTeam && (roles || []).includes('owner')
  })

  return Boolean(isTeamOwner)
}

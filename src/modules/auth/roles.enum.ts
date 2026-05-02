export enum RoleIds {
  ADMIN = 1,
  USER = 2,
}

export const RoleNames: Record<RoleIds, string> = {
    [RoleIds.ADMIN]: 'administrador',
    [RoleIds.USER]: 'usuario',
};
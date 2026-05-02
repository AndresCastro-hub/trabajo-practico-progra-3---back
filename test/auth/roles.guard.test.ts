import { RolesGuard } from '../../src/modules/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RoleIds } from '../../src/modules/auth/roles.enum';

const mockReflector = { getAllAndOverride: jest.fn() };

const mockExecutionContext = (rolId: number): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user: { id: 1, email: 'juan@mail.com', rolId } }),
    }),
  } as unknown as ExecutionContext);

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(mockReflector as unknown as Reflector);
    jest.clearAllMocks();
  });

  it('debería permitir el acceso si no hay roles requeridos', () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);
    expect(guard.canActivate(mockExecutionContext(RoleIds.USER))).toBe(true);
  });

  it('debería permitir el acceso si el rol del usuario está incluido', () => {
    mockReflector.getAllAndOverride.mockReturnValue([RoleIds.ADMIN]);
    expect(guard.canActivate(mockExecutionContext(RoleIds.ADMIN))).toBe(true);
  });

  it('debería lanzar ForbiddenException si el rol no está incluido', () => {
    mockReflector.getAllAndOverride.mockReturnValue([RoleIds.ADMIN]);
    expect(() => guard.canActivate(mockExecutionContext(RoleIds.USER))).toThrow(ForbiddenException);
  });
});
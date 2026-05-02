import { JwtStrategy } from '../../src/modules/auth/jwt.strategy';
import { ConfigService } from '@nestjs/config';

const mockConfigService = (secret: string | undefined) =>
  ({ get: jest.fn().mockReturnValue(secret) } as unknown as ConfigService);

describe('JwtStrategy', () => {
  it('debería instanciarse correctamente con JWT_SECRET definido', () => {
    expect(() => new JwtStrategy(mockConfigService('supersecret'))).not.toThrow();
  });

  it('debería lanzar Error si JWT_SECRET no está definido', () => {
    expect(() => new JwtStrategy(mockConfigService(undefined))).toThrow(
      'La variable de entorno JWT_SECRET no está definida.',
    );
  });

  it('validate debería retornar el payload con id, email y rolId, rolName y name', () => {
    const strategy = new JwtStrategy(mockConfigService('supersecret'));
    const result = strategy.validate({ id: 1, email: 'juan@mail.com', rolId: 2, name: 'Juan' });
    expect(result).toEqual({ id: 1, email: 'juan@mail.com', rolId: 2, rolName: 'usuario', name: 'Juan' });
  });
});
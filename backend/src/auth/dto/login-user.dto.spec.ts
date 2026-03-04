import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginUserDto } from './login-user.dto';

function make(data: object): LoginUserDto {
  return plainToInstance(LoginUserDto, data);
}

describe('LoginUserDto', () => {
  it('passes with valid email and password', async () => {
    const errors = await validate(make({ email: 'user@example.com', password: 'password123' }));
    expect(errors).toHaveLength(0);
  });

  it('fails on invalid email', async () => {
    const errors = await validate(make({ email: 'not-an-email', password: 'password123' }));
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('fails when both fields are missing', async () => {
    const errors = await validate(make({}));
    expect(errors.some((e) => e.property === 'email')).toBe(true);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });
});

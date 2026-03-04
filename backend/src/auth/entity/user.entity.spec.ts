import { UserEntity } from './user.entity';

describe('UserEntity', () => {
  describe('hashPassword', () => {
    it('hashes the password before insert', async () => {
      const user = new UserEntity();
      user.password = 'plain_password';
      await user.hashPassword();
      expect(user.password).toMatch(/^\$2b\$/);
      expect(user.password).not.toBe('plain_password');
    });
  });
});

import { hashPassword, getFilterParams } from './utils';

describe('Utils', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hashedPassword = await hashPassword(password);

      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword).not.toBe(password);

      expect(hashedPassword.startsWith('$2b$')).toBe(true);
    });

    it('should hash different passwords into different hashes', async () => {
      const password1 = 'password123';
      const password2 = 'password456';

      const hashedPassword1 = await hashPassword(password1);
      const hashedPassword2 = await hashPassword(password2);

      expect(hashedPassword1).not.toBe(hashedPassword2);
    });
  });

  describe('getFilterParams', () => {
    it('should return an empty object if no filterParams are provided', () => {
      expect(getFilterParams(undefined)).toEqual({});
      expect(getFilterParams(null)).toEqual({});
    });

    it('should return an object with only defined values', () => {
      const filterParams = {
        name: 'Luke Skywalker',
        age: undefined,
        species: 'Human',
      };

      expect(getFilterParams(filterParams)).toEqual({
        name: 'Luke Skywalker',
        species: 'Human',
      });
    });

    it('should handle an empty filterParams object', () => {
      const filterParams = {};

      expect(getFilterParams(filterParams)).toEqual({});
    });
  });
});

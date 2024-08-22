import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const SALT = bcrypt.genSaltSync();
  return await bcrypt.hash(password, SALT);
};

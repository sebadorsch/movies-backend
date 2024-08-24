import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const SALT = bcrypt.genSaltSync();
  return await bcrypt.hash(password, SALT);
};

export const getFilterParams = (filterParams) => {
  const filters = {};

  if (filterParams) {
    for (const [key, value] of Object.entries(filterParams)) {
      if (value !== undefined) filters[key] = value;
    }
  }

  return filters;
};

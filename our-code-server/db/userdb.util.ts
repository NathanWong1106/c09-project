import db from "./dbConn";

export const getUserByEmail = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  return user;
};

export const getUserById = async (id: number) => {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  return user;
};

export const createUser = async (email: string) => {
  const user = await db.user.create({
    data: {
      email,
    },
  });

  return user;
};

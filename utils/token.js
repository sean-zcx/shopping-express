import jwt from "jsonwebtoken";

export const generateTokens = (user) => {
  const access_token = jwt.sign(
    { guid: user.guid, email: user.email },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: `${process.env.TOKEN_EXPIRES_IN}s` }
  );

  const refresh_token = jwt.sign(
    { guid: user.guid, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { access_token, refresh_token };
};

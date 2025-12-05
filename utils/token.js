import jwt from "jsonwebtoken";

export const generateTokens = (uid) => {
  console.log('[token] generatetokens: uid', JSON.stringify(uid, null, 2))
  const access_token = jwt.sign(
    {uid},
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: `${process.env.TOKEN_EXPIRES_IN}s` }
  );

  const refresh_token = jwt.sign(
    {uid},
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { access_token, refresh_token };
};

export const generateAdminTokens = (email) => {
  console.log('[token] generateAdminTokens: email', JSON.stringify(email, null, 2))
  const access_token = jwt.sign(
    {email},
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: `${process.env.TOKEN_ADMIN_EXPIRES_IN}s` }
  );

  const refresh_token = jwt.sign(
    {email},
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { access_token, refresh_token };
};

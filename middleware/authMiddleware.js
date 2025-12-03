import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const header = req.headers["authorization"];
  console.log('header in authMiddleware: ', JSON.stringify(header, null, 2))
  if (!header) return res.status(401).json({ msg: "No token provided" });

  const token = header.split(" ")[1];

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Invalid or expired token" , err});
    console.log('decoded:', JSON.stringify(decoded, null, 2));
    req.auth = decoded;
    next();
  });
};

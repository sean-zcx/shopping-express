import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ msg: "No token provided" });

  const token = header.split(" ")[1];

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Invalid or expired token" });

    req.user = decoded;
    next();
  });
};

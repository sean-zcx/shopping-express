import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import AppError from '../utils/AppError.js';

export default async function adminAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No token provided', 401));
    }

    const token = authHeader.split(' ')[1];

    // 解码 JWT
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (!decoded || !decoded.email) {
      return next(new AppError('Invalid token', 401));
    }

    // 检查 admin 是否存在
    const admin = await Admin.findOne({ email: decoded.email });
    if (!admin) {
      return next(new AppError('Admin account not found', 401));
    }

    console.log('[adminAuthMiddleware] admin authenticated:', JSON.stringify(admin, null, 2));

    // 附加身份
    req.admin = admin;

    next();
  } catch (err) {
    console.error('AdminAuth Error:', err);
    next(new AppError('Authentication failed', 401));
  }
}

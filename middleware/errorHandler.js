import AppError from "../utils/AppError.js";

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 ERROR:", err);

  // 自定义 AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      result_code: err.errorCode,
      result_msg: err.message,
      data: null,
    });
  }

  // JWT 错误（token 无效 / 过期）
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      result_code: "AUTH_INVALID_TOKEN",
      result_msg: "Invalid token",
      data: null,
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      result_code: "AUTH_TOKEN_EXPIRED",
      result_msg: "Token expired",
      data: null,
    });
  }

  // ValidationError (例如 mongoose)
  if (err.name === "ValidationError") {
    return res.status(422).json({
      result_code: "VALIDATION_ERROR",
      result_msg: err.message,
      data: null,
    });
  }

  // 其他意料外的错误 → 500
  return res.status(500).json({
    result_code: "SERVER_ERROR",
    result_msg: "Internal Server Error",
    data: null,
  });
};

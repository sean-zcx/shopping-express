export default class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = "999999") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;

    // 保持 Error 堆栈信息
    Error.captureStackTrace(this, this.constructor);
  }
}

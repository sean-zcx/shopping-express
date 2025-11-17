export const responseWrapper = (req, res, next) => {
  res.sendSuccess = (data) => {
    res.json({
      result_code: "000000",
      result_msg: "OK",
      data,
    });
  };

  res.sendError = (msg = "ERROR", code = "999999") => {
    res.json({
      result_code: code,
      result_msg: msg,
      data: null,
    });
  };

  next();
};

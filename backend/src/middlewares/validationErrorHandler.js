import { validationResult } from "express-validator";

export default function validationErrorHandler(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    message: "Dữ liệu không hợp lệ.",
    errors: result.array().map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
}

export default function errorHandler(error, _req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 && process.env.NODE_ENV === "production"
      ? "Hệ thống đang bận, vui lòng thử lại."
      : error.message || "Đã xảy ra lỗi hệ thống.";

  return res.status(statusCode).json({ message });
}

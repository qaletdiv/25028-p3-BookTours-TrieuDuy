import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/token.js";

export default function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    next(new ApiError(401, "Bạn cần đăng nhập để tiếp tục."));
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, email: payload.email };
    next();
  } catch {
    next(new ApiError(401, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."));
  }
}

import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, findUserById } from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";
import { signToken } from "../utils/token.js";

function mapUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    address: user.address || "",
  };
}

export async function registerAccount({ fullName, email, phone, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new ApiError(409, "Email này đã được đăng ký.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ fullName, email, phone, passwordHash });
  return mapUser(user);
}

export async function loginAccount({ email, password }) {
  const user = await findUserByEmail(email);
  const matched = user ? await bcrypt.compare(password, user.password_hash) : false;
  if (!user || !matched) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng.");
  }

  return {
    token: signToken(user),
    user: mapUser(user),
  };
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(401, "Không tìm thấy tài khoản.");
  }
  return mapUser(user);
}

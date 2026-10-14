import { getCurrentUser, loginAccount, registerAccount } from "../services/authService.js";

export async function register(req, res, next) {
  try {
    await registerAccount(req.body);
    res.status(201).json({ message: "Đăng ký thành công. Vui lòng đăng nhập." });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    res.json(await loginAccount(req.body));
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    res.json(await getCurrentUser(req.user.id));
  } catch (error) {
    next(error);
  }
}

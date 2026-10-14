import { body } from "express-validator";

const phonePattern = /^0\d{9}$/;

export const registerRules = [
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Họ và tên phải từ 2 đến 120 ký tự."),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Email không hợp lệ.")
    .normalizeEmail(),
  body("phone")
    .trim()
    .matches(phonePattern)
    .withMessage("Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0."),
  body("password")
    .isLength({ min: 6, max: 72 })
    .withMessage("Mật khẩu phải từ 6 đến 72 ký tự."),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Mật khẩu nhập lại không khớp.");
      }
      return true;
    }),
];

export const loginRules = [
  body("email").trim().isEmail().withMessage("Email không hợp lệ.").normalizeEmail(),
  body("password").notEmpty().withMessage("Vui lòng nhập mật khẩu."),
];

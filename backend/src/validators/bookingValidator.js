import { body, param } from "express-validator";

const phonePattern = /^0\d{9}$/;

export const createBookingRules = [
  body("tourSlug")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Tour không hợp lệ."),
  body("departureId").isInt({ min: 1 }).withMessage("Vui lòng chọn ngày khởi hành."),
  body("fullName")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Họ tên người liên hệ phải từ 2 đến 120 ký tự."),
  body("phone")
    .trim()
    .matches(phonePattern)
    .withMessage("Số điện thoại liên hệ phải gồm 10 chữ số và bắt đầu bằng 0."),
  body("email").trim().isEmail().withMessage("Email liên hệ không hợp lệ.").normalizeEmail(),
  body("address")
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage("Địa chỉ phải từ 5 đến 255 ký tự."),
  body("adults").isInt({ min: 1, max: 20 }).withMessage("Cần ít nhất 1 người lớn."),
  body("children").isInt({ min: 0, max: 20 }).withMessage("Số trẻ em không hợp lệ."),
  body("passengers")
    .isArray({ min: 1, max: 40 })
    .withMessage("Danh sách hành khách không hợp lệ.")
    .custom((passengers, { req }) => {
      const expected = Number(req.body.adults) + Number(req.body.children);
      if (passengers.length !== expected) {
        throw new Error("Số hành khách phải khớp với số người lớn và trẻ em.");
      }
      return true;
    }),
  body("passengers.*.fullName")
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Mỗi hành khách cần họ tên từ 2 đến 120 ký tự."),
  body("passengers.*.type")
    .isIn(["adult", "child"])
    .withMessage("Loại hành khách không hợp lệ."),
  body("paymentMethod")
    .isIn(["bank_transfer", "credit_card"])
    .withMessage("Phương thức thanh toán không hợp lệ."),
  body("cardName")
    .if(body("paymentMethod").equals("credit_card"))
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Vui lòng nhập tên chủ thẻ."),
  body("cardNumber")
    .if(body("paymentMethod").equals("credit_card"))
    .trim()
    .matches(/^\d{16}$/)
    .withMessage("Số thẻ mô phỏng phải gồm 16 chữ số."),
  body("cardExpiry")
    .if(body("paymentMethod").equals("credit_card"))
    .trim()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage("Ngày hết hạn phải có dạng MM/YY."),
  body("cardCvv")
    .if(body("paymentMethod").equals("credit_card"))
    .trim()
    .matches(/^\d{3}$/)
    .withMessage("CVV phải gồm 3 chữ số."),
];

export const bookingCodeRules = [
  param("code")
    .matches(/^BT\d{12}$/)
    .withMessage("Mã booking không hợp lệ."),
];

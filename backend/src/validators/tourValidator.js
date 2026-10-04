import { param, query } from "express-validator";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugMessage = "Giá trị phải có định dạng slug hợp lệ.";

export const listTourRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Trang phải là số nguyên lớn hơn 0."),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage("Số tour mỗi trang phải từ 1 đến 24."),
  query("destination").optional().matches(slugPattern).withMessage(slugMessage),
  query("departure").optional().matches(slugPattern).withMessage(slugMessage),
  query("type").optional().matches(slugPattern).withMessage(slugMessage),
  query("region")
    .optional()
    .isIn(["domestic", "international"])
    .withMessage("Khu vực tour không hợp lệ."),
  query("keyword")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Từ khóa không được vượt quá 100 ký tự."),
  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Giá thấp nhất phải là số không âm."),
  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Giá cao nhất phải là số không âm.")
    .custom((value, { req }) => {
      if (req.query.minPrice && Number(value) < Number(req.query.minPrice)) {
        throw new Error("Giá cao nhất phải lớn hơn hoặc bằng giá thấp nhất.");
      }
      return true;
    }),
  query("minDays")
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage("Số ngày tối thiểu phải từ 1 đến 30."),
  query("maxDays")
    .optional()
    .isInt({ min: 1, max: 30 })
    .withMessage("Số ngày tối đa phải từ 1 đến 30.")
    .custom((value, { req }) => {
      if (req.query.minDays && Number(value) < Number(req.query.minDays)) {
        throw new Error("Số ngày tối đa phải lớn hơn hoặc bằng số ngày tối thiểu.");
      }
      return true;
    }),
  query("startDate")
    .optional()
    .isISO8601({ strict: true })
    .withMessage("Ngày khởi hành không hợp lệ."),
  query("sort")
    .optional()
    .isIn(["newest", "price_asc", "price_desc", "name_asc", "name_desc"])
    .withMessage("Kiểu sắp xếp không hợp lệ."),
];

export const suggestionRules = [
  query("q")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Từ khóa gợi ý phải có từ 2 đến 100 ký tự."),
];

export const tourSlugRules = [
  param("slug").matches(slugPattern).withMessage("Slug tour không hợp lệ."),
];

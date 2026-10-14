import jwt from "jsonwebtoken";

function secret() {
  return process.env.JWT_SECRET || "booktours-dev-secret";
}

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, secret(), { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, secret());
}

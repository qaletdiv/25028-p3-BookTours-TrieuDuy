import "dotenv/config";
import app from "./app.js";
import { checkDatabaseConnection } from "./config/db.js";

const port = Number(process.env.PORT || 5000);

try {
  await checkDatabaseConnection();
  app.listen(port, () => {
    console.log(`BookTours API: http://localhost:${port}`);
  });
} catch (error) {
  console.error("Không thể kết nối MySQL:", error.message);
  process.exit(1);
}

import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { prisma } from "./lib/prisma.js";
import { execSync } from "child_process";
import authorRouter from "./routes/authors.route.js";
import withdrawalRouter from "./routes/withdrawals.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("combined"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/authors", authorRouter);
app.use("/withdrawals", withdrawalRouter);

async function ensureDatabase() {
  try {
    execSync("npx prisma migrate deploy", {
      stdio: "inherit",
      cwd: rootDir,
      env: process.env,
    });
    const authorCount = await prisma.author.count();
    if (authorCount === 0) {
      execSync("node prisma/seed.js", {
        stdio: "inherit",
        cwd: rootDir,
        env: process.env,
      });
    }
  } catch (e) {
    console.error("Database setup failed:", e.message);
    process.exit(1);
  }
}

ensureDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`BookLeaf API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

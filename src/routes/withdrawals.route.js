import express from "express";
import { prisma } from "../lib/prisma.js";

const withdrawalRouter = express.Router();

const MIN_WITHDRAWAL = 500;

withdrawalRouter.post("/", async (req, res) => {
  const authorId =
    req.body.author_id != null ? parseInt(req.body.author_id, 10) : NaN;

  const amount =
    typeof req.body.amount === "number"
      ? req.body.amount
      : parseInt(req.body.amount, 10);

  if (Number.isNaN(authorId)) {
    return res
      .status(400)
      .json({ error: "author_id is required and must be a number" });
  }

  if (Number.isNaN(amount) || amount < 0) {
    return res
      .status(400)
      .json({ error: "amount is required and must be a positive number" });
  }

  if (amount < MIN_WITHDRAWAL) {
    return res.status(400).json({
      error: "Minimum withdrawal is ₹500",
    });
  }

  try {
    const author = await prisma.author.findUnique({
      where: {
        id: authorId,
      },
      select: {
        id: true,
      },
    });

    if (!author) {
      return res.status(404).json({
        error: "Author not found",
      });
    }

    const sales = await prisma.sale.findMany({
      where: {
        book: { authorId },
      },
      include: {
        book: {
          select: { royaltyPerSale: true },
        },
      },
    });

    const totalEarnings = sales.reduce(
      (sum, s) => sum + s.quantity * s.book.royaltyPerSale,
      0,
    );

    const withdrawnResult = await prisma.withdrawal.aggregate({
      where: {
        authorId,
      },
      _sum: { amount: true },
    });

    const totalWithdrawn = withdrawnResult._sum.amount ?? 0;
    const currentBalance = totalEarnings - totalWithdrawn;

    if (amount > currentBalance) {
      return res.status(400).json({
        error: `Amount cannot exceed current balance (₹${currentBalance})`,
      });
    }

    const withdrawal = await prisma.withdrawal.create({
      data: {
        authorId,
        amount,
        status: "pending",
      },
    });

    res.status(201).json({
      id: withdrawal.id,
      author_id: authorId,
      amount: withdrawal.amount,
      status: withdrawal.status,
      created_at: withdrawal.createdAt.toISOString(),
      new_balance: currentBalance - amount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default withdrawalRouter;

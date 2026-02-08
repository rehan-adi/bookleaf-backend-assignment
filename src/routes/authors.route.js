import express from "express";
import { prisma } from "../lib/prisma.js";

const authorRouter = express.Router();

authorRouter.get("/", async (req, res) => {
  try {
    const authors = await prisma.author.findMany({ orderBy: { id: "asc" } });

    const books = await prisma.books.findMany({
      select: {
        id: true,
        authorId: true,
        royaltyPerSale: true,
      },
    });

    const sales = await prisma.sale.findMany({
      where: { bookId: { in: books.map((b) => b.id) } },
      select: { bookId: true, quantity: true },
    });

    const withdrawals = await prisma.withdrawal.findMany({
      select: { authorId: true, amount: true },
    });

    const bookMap = new Map(books.map((b) => [b.id, b]));
    const earningsByAuthor = new Map(authors.map((a) => [a.id, 0]));

    for (const s of sales) {
      const book = bookMap.get(s.bookId);
      if (!book) continue;
      const current = earningsByAuthor.get(book.authorId) ?? 0;
      earningsByAuthor.set(
        book.authorId,
        current + s.quantity * book.royaltyPerSale,
      );
    }

    const withdrawnByAuthor = new Map();
    for (const w of withdrawals) {
      withdrawnByAuthor.set(
        w.authorId,
        (withdrawnByAuthor.get(w.authorId) ?? 0) + w.amount,
      );
    }

    const list = authors.map((a) => {
      const totalEarnings = earningsByAuthor.get(a.id) ?? 0;
      const totalWithdrawn = withdrawnByAuthor.get(a.id) ?? 0;
      return {
        id: a.id,
        name: a.name,
        total_earnings: totalEarnings,
        current_balance: totalEarnings - totalWithdrawn,
      };
    });
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
    return;
  }
});

authorRouter.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid author id" });
  }
  try {
    const author = await prisma.author.findUnique({
      where: { id },
      include: { books: { include: { sales: true } } },
    });

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }

    const withdrawalsSum = await prisma.withdrawal.aggregate({
      where: { authorId: id },
      _sum: { amount: true },
    });

    const totalWithdrawn = withdrawalsSum._sum.amount ?? 0;
    let totalEarnings = 0;

    const books = author.books.map((b) => {
      const totalSold = b.sales.reduce((sum, s) => sum + s.quantity, 0);
      const totalRoyalty = totalSold * b.royaltyPerSale;
      totalEarnings += totalRoyalty;
      return {
        id: b.id,
        title: b.title,
        royalty_per_sale: b.royaltyPerSale,
        total_sold: totalSold,
        total_royalty: totalRoyalty,
      };
    });
    res.json({
      id: author.id,
      name: author.name,
      email: author.email,
      current_balance: totalEarnings - totalWithdrawn,
      total_earnings: totalEarnings,
      total_books: author.books.length,
      books,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
    return;
  }
});

authorRouter.get("/:id/sales", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid author id" });
  }

  try {
    const author = await prisma.author.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }

    const sales = await prisma.sale.findMany({
      where: { book: { authorId: id } },
      include: { book: { select: { title: true, royaltyPerSale: true } } },
      orderBy: { saleDate: "desc" },
    });

    res.json(
      sales.map((s) => ({
        book_title: s.book.title,
        quantity: s.quantity,
        royalty_earned: s.quantity * s.book.royaltyPerSale,
        sale_date: s.saleDate.toISOString().split("T")[0],
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

authorRouter.get("/:id/withdrawals", async (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id)) {
    return res.status(400).json({
      error: "Invalid author id",
    });
  }
  try {
    const author = await prisma.author.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!author) {
      return res.status(404).json({ error: "Author not found" });
    }
    const withdrawals = await prisma.withdrawal.findMany({
      where: { authorId: id },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      withdrawals.map((w) => ({
        id: w.id,
        amount: w.amount,
        status: w.status,
        created_at: w.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default authorRouter;

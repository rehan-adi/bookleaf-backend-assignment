import "dotenv/config";

import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./data/dev.db";
}

const prisma = new PrismaClient();

async function main() {
  await prisma.withdrawal.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.books.deleteMany();
  await prisma.author.deleteMany();

  await prisma.author.createMany({
    data: [
      {
        id: 1,
        name: "Priya Sharma",
        email: "priya@email.com",
        bankAccount: "1234567890",
        ifscCode: "HDFC0001234",
      },
      {
        id: 2,
        name: "Rahul Verma",
        email: "rahul@email.com",
        bankAccount: "0987654321",
        ifscCode: "ICIC0005678",
      },
      {
        id: 3,
        name: "Anita Desai",
        email: "anita@email.com",
        bankAccount: "5678901234",
        ifscCode: "SBIN0009012",
      },
    ],
  });

  await prisma.books.createMany({
    data: [
      { id: 1, title: "The Silent River", authorId: 1, royaltyPerSale: 45 },
      { id: 2, title: "Midnight in Mumbai", authorId: 1, royaltyPerSale: 60 },
      { id: 3, title: "Code & Coffee", authorId: 2, royaltyPerSale: 75 },
      { id: 4, title: "Startup Diaries", authorId: 2, royaltyPerSale: 50 },
      { id: 5, title: "Poetry of Pain", authorId: 2, royaltyPerSale: 30 },
      { id: 6, title: "Garden of Words", authorId: 3, royaltyPerSale: 40 },
    ],
  });

  await prisma.sale.createMany({
    data: [
      { bookId: 1, quantity: 25, saleDate: new Date("2025-01-05") },
      { bookId: 1, quantity: 40, saleDate: new Date("2025-01-12") },
      { bookId: 2, quantity: 15, saleDate: new Date("2025-01-08") },
      { bookId: 3, quantity: 60, saleDate: new Date("2025-01-03") },
      { bookId: 3, quantity: 45, saleDate: new Date("2025-01-15") },
      { bookId: 4, quantity: 30, saleDate: new Date("2025-01-10") },
      { bookId: 5, quantity: 20, saleDate: new Date("2025-01-18") },
      { bookId: 6, quantity: 10, saleDate: new Date("2025-01-20") },
    ],
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

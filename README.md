# BookLeaf Backend - Author Royalty System

A REST API for managing author royalties, book sales, and withdrawals.

## Tech Stack

**Node.js + Express + Prisma + SQLite**

I chose this stack for rapid development and simplicity. Express provides a lightweight framework, Prisma offers type-safe database access with easy migrations, and SQLite requires zero configuration—perfect for a technical assignment that needs to be deployed quickly without managing external databases.

## Assumptions

1. **Currency**: All amounts are in INR (₹)
2. **Minimum withdrawal**: ₹500 as per requirements
3. **Withdrawal validation**: Authors can only withdraw up to their current balance
4. **Sales are final**: No refunds or cancellations implemented
5. **Single currency**: No multi-currency support needed
6. **Author-Book relationship**: One-to-many (an author can have multiple books)
7. **Royalty calculation**: Stored per sale at the time of sale (handles potential future royalty rate changes)
8. **Database migrations**: Run automatically on server start (`migrate deploy`)
9. **Seeding**: Happens automatically on first run if database is empty

## Time Spent

**Approximately 5-6 hours**

- Initial setup & schema design: 1 hour
- API implementation: 3 hours
- Testing & debugging: 1 hour
- Deployment & documentation: 30-50 minutes

## Setup & Run

```bash
# Install dependencies
npm install

# Run locally
npm start
```

## API Endpoints

| Method | Endpoint                   | Description                                              |
| ------ | -------------------------- | -------------------------------------------------------- |
| GET    | `/authors`                 | List all authors with total earnings and current balance |
| GET    | `/authors/:id`             | Single author with their books                           |
| GET    | `/authors/:id/sales`       | Sales history for an author's books                      |
| GET    | `/authors/:id/withdrawals` | Withdrawal history for an author                         |
| POST   | `/withdrawals`             | Create a withdrawal (min ₹500, max = balance)            |

### Example Request

```bash
curl -X POST https://bookleaf-backend-assignment.onrender.com/withdrawals \
  -H "Content-Type: application/json" \
  -d '{"author_id": 1, "amount": 1000}'
```

## Deployment

Deployed on Render: https://bookleaf-backend-assignment.onrender.com

**Build Command**: `npm install`  
**Start Command**: `npm start`

The deployment automatically runs migrations and seeds the database on first start.

## Environment Variables

```
PORT=3000
DATABASE_URL="file:./data/dev.db"
```

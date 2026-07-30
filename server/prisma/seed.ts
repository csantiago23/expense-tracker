import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Expense Tracker database...');

  // Clean up existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  // Create Demo User
  const passwordHash = await bcrypt.hash('password123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@expensetracker.com',
      name: 'Alex Johnson',
      passwordHash,
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      theme: 'dark',
    },
  });

  console.log(`Created user: ${demoUser.email} (password: password123)`);

  // Categories
  const categoriesData = [
    { name: 'Salary', type: 'INCOME', color: '#10b981', icon: 'Banknote', isDefault: true },
    { name: 'Freelance / Investments', type: 'INCOME', color: '#06b6d4', icon: 'TrendingUp', isDefault: true },
    { name: 'Housing', type: 'EXPENSE', color: '#8b5cf6', icon: 'Home', isDefault: true },
    { name: 'Utilities', type: 'EXPENSE', color: '#3b82f6', icon: 'Zap', isDefault: true },
    { name: 'Food & Dining', type: 'EXPENSE', color: '#f59e0b', icon: 'Utensils', isDefault: true },
    { name: 'Transportation', type: 'EXPENSE', color: '#ef4444', icon: 'Car', isDefault: true },
    { name: 'Entertainment', type: 'EXPENSE', color: '#ec4899', icon: 'Film', isDefault: true },
    { name: 'Shopping', type: 'EXPENSE', color: '#14b8a6', icon: 'ShoppingBag', isDefault: true },
    { name: 'Healthcare', type: 'EXPENSE', color: '#e11d48', icon: 'HeartPulse', isDefault: true },
    { name: 'Education', type: 'EXPENSE', color: '#6366f1', icon: 'GraduationCap', isDefault: true },
    { name: 'Travel', type: 'EXPENSE', color: '#f97316', icon: 'Plane', isDefault: true },
    { name: 'Miscellaneous', type: 'EXPENSE', color: '#64748b', icon: 'MoreHorizontal', isDefault: true },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: { ...cat, userId: demoUser.id },
    });
    categoriesMap[cat.name] = created.id;
  }

  // Accounts
  const checking = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'Main Checking',
      type: 'CHECKING',
      currentBalance: 4250.0,
      color: '#3b82f6',
      institution: 'Chase Bank',
      isDefault: true,
    },
  });

  const savings = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'High-Yield Savings',
      type: 'SAVINGS',
      currentBalance: 12800.0,
      color: '#10b981',
      institution: 'Ally Financial',
    },
  });

  const creditCard = await prisma.account.create({
    data: {
      userId: demoUser.id,
      name: 'Sapphire Credit Card',
      type: 'CREDIT_CARD',
      currentBalance: -620.5,
      color: '#f59e0b',
      institution: 'Chase',
    },
  });

  // Tags
  const tagNames = ['Essential', 'Subscription', 'Personal', 'Tax-Deductible', 'Vacation'];
  for (const name of tagNames) {
    await prisma.tag.create({
      data: { userId: demoUser.id, name, color: '#6366f1' },
    });
  }

  // Transactions over past 60 days
  const now = new Date();
  const generateDate = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d;
  };

  const sampleTransactions = [
    {
      accountId: checking.id,
      categoryId: categoriesMap['Salary'],
      amount: 4500.0,
      type: 'INCOME',
      date: generateDate(1),
      description: 'Monthly Salary Deposit',
      paymentMethod: 'Bank Transfer',
      tags: JSON.stringify(['Essential']),
    },
    {
      accountId: checking.id,
      categoryId: categoriesMap['Freelance / Investments'],
      amount: 850.0,
      type: 'INCOME',
      date: generateDate(12),
      description: 'UI/UX Freelance Project Payment',
      paymentMethod: 'Bank Transfer',
      tags: JSON.stringify(['Tax-Deductible']),
    },
    {
      accountId: checking.id,
      categoryId: categoriesMap['Housing'],
      amount: 1650.0,
      type: 'EXPENSE',
      date: generateDate(2),
      description: 'Apartment Rent Payment',
      paymentMethod: 'Bank Transfer',
      tags: JSON.stringify(['Essential']),
    },
    {
      accountId: creditCard.id,
      categoryId: categoriesMap['Food & Dining'],
      amount: 145.2,
      type: 'EXPENSE',
      date: generateDate(3),
      description: 'Whole Foods Market',
      paymentMethod: 'Card',
      tags: JSON.stringify(['Essential']),
    },
    {
      accountId: creditCard.id,
      categoryId: categoriesMap['Food & Dining'],
      amount: 68.5,
      type: 'EXPENSE',
      date: generateDate(5),
      description: 'Italian Bistro Dinner',
      paymentMethod: 'Card',
      tags: JSON.stringify(['Personal']),
    },
    {
      accountId: creditCard.id,
      categoryId: categoriesMap['Transportation'],
      amount: 45.0,
      type: 'EXPENSE',
      date: generateDate(6),
      description: 'Shell Gas Station Fill-up',
      paymentMethod: 'Card',
      tags: JSON.stringify(['Essential']),
    },
    {
      accountId: creditCard.id,
      categoryId: categoriesMap['Utilities'],
      amount: 120.0,
      type: 'EXPENSE',
      date: generateDate(8),
      description: 'Electric & Gas Bill',
      paymentMethod: 'Online',
      tags: JSON.stringify(['Essential', 'Subscription']),
    },
    {
      accountId: creditCard.id,
      categoryId: categoriesMap['Entertainment'],
      amount: 18.99,
      type: 'EXPENSE',
      date: generateDate(10),
      description: 'Netflix Monthly Subscription',
      paymentMethod: 'Card',
      tags: JSON.stringify(['Subscription']),
    },
    {
      accountId: creditCard.id,
      categoryId: categoriesMap['Shopping'],
      amount: 210.0,
      type: 'EXPENSE',
      date: generateDate(14),
      description: 'New Running Shoes',
      paymentMethod: 'Card',
      tags: JSON.stringify(['Personal']),
    },
    {
      accountId: creditCard.id,
      categoryId: categoriesMap['Healthcare'],
      amount: 75.0,
      type: 'EXPENSE',
      date: generateDate(18),
      description: 'Pharmacy & Co-pay',
      paymentMethod: 'Card',
      tags: JSON.stringify(['Essential']),
    },
    {
      accountId: checking.id,
      toAccountId: savings.id,
      amount: 500.0,
      type: 'TRANSFER',
      date: generateDate(4),
      description: 'Monthly Savings Transfer',
      paymentMethod: 'Bank Transfer',
      tags: JSON.stringify(['Personal']),
    },
  ];

  for (const tx of sampleTransactions) {
    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        ...tx,
      },
    });
  }

  // Budgets for current month
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const budgetsToCreate = [
    { categoryName: 'Food & Dining', amount: 600.0 },
    { categoryName: 'Housing', amount: 1700.0 },
    { categoryName: 'Transportation', amount: 250.0 },
    { categoryName: 'Entertainment', amount: 150.0 },
    { categoryName: 'Shopping', amount: 300.0 },
  ];

  for (const b of budgetsToCreate) {
    if (categoriesMap[b.categoryName]) {
      await prisma.budget.create({
        data: {
          userId: demoUser.id,
          categoryId: categoriesMap[b.categoryName],
          amount: b.amount,
          month: currentMonth,
          year: currentYear,
        },
      });
    }
  }

  // Bills
  await prisma.bill.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'High-Speed Internet',
        amount: 79.99,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 28),
        isPaid: false,
        isRecurring: true,
        reminderDays: 3,
        categoryId: categoriesMap['Utilities'],
      },
      {
        userId: demoUser.id,
        name: 'Car Insurance Premium',
        amount: 135.0,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 30),
        isPaid: false,
        isRecurring: true,
        reminderDays: 5,
        categoryId: categoriesMap['Transportation'],
      },
      {
        userId: demoUser.id,
        name: 'Gym Membership',
        amount: 49.0,
        dueDate: new Date(now.getFullYear(), now.getMonth(), 25),
        isPaid: true,
        isRecurring: true,
        reminderDays: 2,
        categoryId: categoriesMap['Healthcare'],
      },
    ],
  });

  // Savings Goals
  await prisma.savingsGoal.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Emergency Fund (6 Months)',
        targetAmount: 15000.0,
        currentAmount: 12800.0,
        deadline: new Date(now.getFullYear(), 11, 31),
        color: '#10b981',
        category: 'Emergency',
      },
      {
        userId: demoUser.id,
        name: 'Japan Vacation 2027',
        targetAmount: 5000.0,
        currentAmount: 2200.0,
        deadline: new Date(now.getFullYear() + 1, 4, 1),
        color: '#f59e0b',
        category: 'Travel',
      },
      {
        userId: demoUser.id,
        name: 'Tech Upgrade (MacBook)',
        targetAmount: 2500.0,
        currentAmount: 1950.0,
        deadline: new Date(now.getFullYear(), 8, 30),
        color: '#3b82f6',
        category: 'Gadgets',
      },
    ],
  });

  // Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        type: 'BILL_REMINDER',
        title: 'Upcoming Bill: High-Speed Internet',
        message: 'Your bill of $79.99 is due on the 28th of this month.',
        isRead: false,
      },
      {
        userId: demoUser.id,
        type: 'BUDGET_ALERT',
        title: 'Food & Dining Budget Notice',
        message: 'You have spent 72% of your $600 monthly Food & Dining budget.',
        isRead: false,
      },
    ],
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

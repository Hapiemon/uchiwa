import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create seed users
  const user1 = await prisma.user.upsert({
    where: { email: "alice@example.com" },
    update: {},
    create: {
      email: "alice@example.com",
      name: "Alice",
      displayName: "Alice💕",
      hashedPassword: await bcrypt.hash("password123", 12),
      bio: "Hello, I am Alice!",
      timezone: "Asia/Tokyo",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "bob@example.com" },
    update: {},
    create: {
      email: "bob@example.com",
      name: "Bob",
      displayName: "Bob🎵",
      hashedPassword: await bcrypt.hash("password123", 12),
      bio: "Hi, I am Bob!",
      timezone: "Asia/Tokyo",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    },
  });

  console.log("Created seed users:", { user1, user2 });

  // Create a direct conversation
  const conversation = await prisma.conversation.create({
    data: {
      isDirect: true,
      participants: {
        create: [{ userId: user1.id }, { userId: user2.id }],
      },
    },
  });

  console.log("Created conversation:", conversation);

  // Create anniversary entries
  const anniversary = await prisma.anniversary.create({
    data: {
      userId: user1.id,
      title: "Our first meeting 💕",
      date: new Date("2024-01-15"),
      repeatInterval: "YEARLY",
      notes: "The day we met!",
    },
  });

  console.log("Created anniversary:", anniversary);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

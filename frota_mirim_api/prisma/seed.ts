import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

const prisma = new PrismaClient();

async function main() {
  const email = "eduardo@frotamirim.com";
  const password = "Admin@123";
  const passwordHash = await bcrypt.hash(password, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        firstName: "Eduardo",
        lastName: "Vilas Boas",
        email,
        passwordHash,
        role: "admin",
        isActive: true,
      },
    });

    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️ Admin user already exists");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

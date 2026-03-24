import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.reservation.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.roomType.deleteMany();

  await prisma.roomType.createMany({
    data: [
      {
        name: "Standard Room",
        price: 120,
        capacity: 3,
      },
      {
        name: "Deluxe Room",
        price: 220,
        capacity: 2,
      },
      {
        name: "Executive Suite",
        price: 320,
        capacity: 1,
      },
    ],
  });

  await prisma.offer.create({
    data: {
      title: "Summer Discount",
      discount: 15,
    },
  });

  console.log("Seed data inserted successfully");
}

main()
  .catch((error) => {
    console.error("Error while seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
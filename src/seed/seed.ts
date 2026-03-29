import { prisma } from "../db/prisma";

async function main() {
  await prisma.organization.create({
    data: {
      name: "Demo Hospital",
    },
  });
}

main();
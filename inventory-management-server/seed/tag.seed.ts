import process from "node:process";
import { prisma } from "../src/lib/prisma.js";

const tags = [
  { name: "hr" },
  { name: "ceo" },
  { name: "project" },
  { name: "task" },
  { name: "optional" },
  { name: "manager" },
  { name: "client" },
  { name: "doc" },
  { name: "utility" },
];

const result = await prisma.tag.createMany({
  data: tags,
  skipDuplicates: true,
});

console.log("Tags seeded successfully");
console.log(result);
process.exit(0);

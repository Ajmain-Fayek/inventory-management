import process from "node:process";
import { prisma } from "../src/lib/prisma.js";

const categories = [
  { name: "electronics" },
  { name: "furniture" },
  { name: "computer" },
  { name: "books" },
  { name: "files" },
  { name: "office equipments" },
  { name: "computer" },
  { name: "laptop" },
  { name: "mobile" },
];

const result = await prisma.category.createMany({
  data: categories,
  skipDuplicates: true,
});

console.log("Categories seeded successfully");
console.log(result);
process.exit(0);

export const getInventoryColumns = async (inventory: any) => {
  const data = [];
  for (let i = 0; i < 3; i++) {
    if (inventory[`customString${i + 1}State`]) {
      data.push(`customString${i + 1}Value`);
    }
  }
  for (let i = 0; i < 3; i++) {
    if (inventory[`customText${i + 1}State`]) {
      data.push(`customText${i + 1}Value`);
    }
  }
  for (let i = 0; i < 3; i++) {
    if (inventory[`customInt${i + 1}State`]) {
      data.push(`customInt${i + 1}Value`);
    }
  }
  for (let i = 0; i < 3; i++) {
    if (inventory[`customBool${i + 1}State`]) {
      data.push(`customBool${i + 1}Value`);
    }
  }

  return data;
};

import { prisma } from "@/lib/prisma.js";

const getUser = async (user: string) => {
  const result = await prisma.user.findMany({
    where: {
      email: {
        contains: user,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  return result;
};

const getProfileData = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerified: true,
      inventory_creator: {
        include: {
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      writeAccesses: {
        include: {
          inventory: {
            include: {
              creator: { select: { name: true } },
              _count: { select: { items: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
    },
    ownedInventories: user.inventory_creator.map((inv) => ({
      ...inv,
      itemCount: inv._count.items,
    })),
    writeAccessInventories: user.writeAccesses.map((wa) => ({
      ...wa.inventory,
      creator: wa.inventory.creator.name,
      itemCount: wa.inventory._count.items,
    })),
  };
};

const getAdminDashboardData = async () => {
  const [users, inventories] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inventory.findMany({
      include: {
        creator: { select: { name: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    users,
    inventories: inventories.map((inv) => ({
      ...inv,
      creator: inv.creator.name,
      itemCount: inv._count.items,
    })),
  };
};

const updateUsersByAdmin = async (
  userIds: string[],
  action: "BLOCK" | "UNBLOCK" | "MAKE_ADMIN" | "REMOVE_ADMIN" | "DELETE",
) => {
  if (userIds.length === 0) {
    return { count: 0 };
  }

  switch (action) {
    case "BLOCK":
      return prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { status: "BLOCKED" },
      });
    case "UNBLOCK":
      return prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { status: "ACTIVE" },
      });
    case "MAKE_ADMIN":
      return prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { role: "ADMIN" },
      });
    case "REMOVE_ADMIN":
      return prisma.user.updateMany({
        where: { id: { in: userIds } },
        data: { role: "USER" },
      });
    case "DELETE":
      return prisma.user.deleteMany({
        where: { id: { in: userIds } },
      });
    default:
      return { count: 0 };
  }
};

export const UserService = {
  getUser,
  getProfileData,
  getAdminDashboardData,
  updateUsersByAdmin,
};

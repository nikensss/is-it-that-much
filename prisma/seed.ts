import { db } from "../src/server/db";

async function main() {
  await db.expense.deleteMany({});
  await db.usersGroups.deleteMany({});
  await db.group.deleteMany({});
  await db.user.deleteMany({});

  await db.user.createMany({
    data: Array.from({ length: 10 }).map((_, i) => ({ name: `user${i}` })),
  });

  const users = await db.user.findMany();

  for (let i = 0; i < 3; i++) {
    await db.group.create({
      data: { name: `group${i}`, createdBy: { connect: users[i] } },
    });
  }

  const groups = await db.group.findMany();

  // add all to group0
  for (const user of users) {
    await db.usersGroups.create({
      data: {
        user: { connect: user },
        group: { connect: groups[0] },
      },
    });
  }

  // add odd to group1
  for (let i = 1; i < users.length; i += 2) {
    await db.usersGroups.create({
      data: {
        user: { connect: users[i] },
        group: { connect: groups[1] },
      },
    });
  }

  // add even to group2
  for (let i = 0; i < users.length; i += 2) {
    await db.usersGroups.create({
      data: {
        user: { connect: users[i] },
        group: { connect: groups[2] },
      },
    });
  }

  const usersWithGroups = await db.user.findMany({
    include: {
      UserGroup: {
        select: {
          group: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  for (let i = 0; i < 25; i++) {
    const userIndex = Math.floor(Math.random() * usersWithGroups.length);
    const user = usersWithGroups[userIndex];
    if (!user) throw new Error(`undefined user ${userIndex}`);
    if (!user.UserGroup) throw new Error(`user ${user.name} has no groups`);
    if (user.UserGroup.length <= 0) {
      throw new Error(`user ${user.name} has no groups`);
    }

    const groupIndex = Math.floor(Math.random() * user.UserGroup.length);
    const { group } = user.UserGroup[groupIndex] ?? {};
    if (!group) {
      throw new Error(`group ${groupIndex} undefined for user ${user.name}`);
    }

    await db.expense.create({
      data: {
        name: `expense${i}`,
        amount: Math.floor(Math.random() * 100),
        createdById: user.id,
        groupId: group.id,
      },
    });
  }
}

main()
  .then(async () => {
    await db.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });

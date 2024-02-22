import { TransactionType } from '@prisma/client';
import { db } from '../src/server/db';

async function main() {
  await db.transactionsTags.deleteMany({});
  await db.tag.deleteMany({});
  await db.transactionSplit.deleteMany({});
  await db.sharedTransaction.deleteMany({});
  await db.personalTransaction.deleteMany({});
  await db.transaction.deleteMany({});
  await db.category.deleteMany({});
  await db.usersGroups.deleteMany({});
  await db.group.deleteMany({});
  await db.user.deleteMany({});

  await db.user.createMany({
    data: Array.from({ length: 10 }).map((_, i) => {
      return { username: `user${i}`, externalId: `${9837 + i}`, email: `user_${i}@email.com` };
    }),
  });

  const users = await db.user.findMany();

  for (let i = 0; i < 3; i++) {
    const userId = users[i]?.id;
    if (!userId) throw new Error(`no user at index ${i}`);

    await db.group.create({ data: { name: `group${i}`, createdById: userId } });
  }

  const groups = await db.group.findMany();

  // add all to group0
  for (const { id: userId } of users) {
    const groupId = groups[0]?.id;
    if (!groupId) throw new Error('no group id at group[0]');

    await db.usersGroups.create({ data: { userId, groupId } });
  }

  // add odd to group1
  for (let i = 1; i < users.length; i += 2) {
    const groupId = groups[1]?.id;
    if (!groupId) throw new Error('no group id at group[1]');

    const userId = users[i]?.id;
    if (!userId) throw new Error(`no user id for user at index ${i}`);

    await db.usersGroups.create({ data: { userId, groupId } });
  }

  // add even to group2
  for (let i = 0; i < users.length; i += 2) {
    const groupId = groups[2]?.id;
    if (!groupId) throw new Error('no group id at group[1]');

    const userId = users[i]?.id;
    if (!userId) throw new Error(`no user id for user at index ${i}`);

    await db.usersGroups.create({ data: { userId, groupId } });
  }

  // get users with groups (but get only the group id)
  const usersWithGroups = await db.user.findMany({
    include: {
      UserGroup: {
        select: {
          group: { select: { id: true } },
        },
      },
    },
  });

  // with the current setup, users only have two groups: everybody has group0,
  // and then "even" users have group2 and "odd" users have group1;
  // doing `user.UserGroup[i % user.UserGroup.length]` resulted in only using
  // group0 and group1, so we have this array that says "user the first group,
  // then the second group, and then the second group again"
  const groupIndices = [0, 1, 1]; // we do this to make sure all groups have expenses
  for (let i = 0; i < 25; i++) {
    const user = usersWithGroups[i % usersWithGroups.length];

    if (!user) throw new Error(`no user at index ${i % usersWithGroups.length}`);
    if (!user.UserGroup) throw new Error(`user ${user.username} has no groups`);
    if (user.UserGroup.length <= 0) throw new Error(`user ${user.username} has no groups`);

    const groupIndex = groupIndices[i % groupIndices.length];
    if (typeof groupIndex !== 'number') throw new Error(`invalid group index ${groupIndex}`);
    const { group } = user.UserGroup[groupIndex] ?? {};
    if (!group) throw new Error(`group ${i % user.UserGroup.length} undefined for user ${user.username}`);

    const amount = (100 - i * Math.PI) * 100; // amount in cents
    const transaction = await db.transaction.create({
      data: {
        date: new Date(),
        description: `expense${i}`,
        amount,
        type: TransactionType.EXPENSE,
      },
    });
    await db.sharedTransaction.create({
      data: {
        transactionId: transaction.id,
        groupId: group.id,
        createdById: user.id,
      },
    });
  }

  const sharedTransactions = await db.sharedTransaction.findMany({
    where: { transaction: { type: TransactionType.EXPENSE } },
    include: {
      group: {
        include: {
          UserGroup: {
            include: {
              user: true,
            },
          },
        },
      },
      transaction: true,
    },
  });

  for (const sharedTransaction of sharedTransactions) {
    const {
      transaction: { amount },
      group,
    } = sharedTransaction;
    if ((group?.UserGroup?.length || 0) <= 0) throw new Error(`group ${group?.id} has no users`);

    // 1/3+1/6+1/8+3/8
    const splits = [1 / 3, 1 / 6, 1 / 8, 3 / 8].map((proportion) => proportion * amount);
    if (splits.reduce((a, c) => a + c) - amount > 0.01) throw new Error('total amount mismatch');
    const totalUsers = group.UserGroup.length;

    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];
      if (!split) throw new Error(`no split at index ${i}`);

      const userIndex = Math.floor((i / splits.length) * totalUsers);
      const user = group.UserGroup[userIndex]?.user;
      if (!user) throw new Error(`no user at index ${userIndex}`);

      await db.transactionSplit.create({
        data: {
          date: new Date(),
          sharedTransactionId: sharedTransaction.id,
          userId: user.id,
          amount: split,
        },
      });
    }
  }
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });

import { db } from '~/server/db';

export async function reset() {
  await db.friendRequest.deleteMany({});
  await db.settlement.deleteMany({});
  await db.usernameLocks.deleteMany({});
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
}

reset()
  .then(() => console.log('Database reset'))
  .catch((e) => console.error(e));

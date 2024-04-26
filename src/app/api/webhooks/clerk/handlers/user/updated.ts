import type { UserJSON } from '@clerk/backend';
import { log } from 'next-axiom';
import { db } from '~/server/db';

export async function processUserUpdated(user: UserJSON) {
  const email = user.email_addresses.find((e) => e.id === user.primary_email_address_id)?.email_address;
  const emailParts = email?.split('@') ?? [];
  const emailLocalPart = emailParts.slice(0, -1).join('@').toLowerCase();

  const userData = {
    username: user.username,
    externalId: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    imageUrl: user.image_url,
    email,
    emailLocalPart,
  };

  if ((await db.user.count({ where: { email: userData.email } })) > 0) {
    log.debug('user does not exist in db, waiting for "user.created" hook');
    return;
  }

  log.debug('updating user in db');
  await db.user.update({ where: { email: userData.email }, data: userData });
  log.debug('user updated in db');
}

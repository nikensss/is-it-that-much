import type { UserJSON } from '@clerk/nextjs/server';
import { log } from 'next-axiom';
import { db } from '~/server/db';

export async function processUserUpdated(user: UserJSON) {
  const email = user.email_addresses[0]?.email_address;
  const emailParts = email?.split('@') ?? [];
  emailParts.pop();
  const emailLocalPart = emailParts.join('@').toLowerCase();

  const userData = {
    username: user.username,
    externalId: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    imageUrl: user.image_url,
    email,
    emailLocalPart,
  };

  log.debug('updating user in db');
  await db.user.update({ where: { email: userData.email }, data: userData });
  log.debug('user updated in db');
}

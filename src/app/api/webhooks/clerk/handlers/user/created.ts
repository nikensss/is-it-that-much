import type { UserJSON } from '@clerk/nextjs/server';
import { log } from 'next-axiom';
import { createUserInDatabase } from '~/lib/utils.server';

export async function processUserCreated(user: UserJSON): Promise<void> {
  await createUserInDatabase(user.id);
  log.debug('user created in db');
}

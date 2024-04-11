import { Webhook } from 'svix';
import { headers } from 'next/headers';
import type { WebhookEvent } from '@clerk/nextjs/server';
import { env } from '~/env';
import { processUserCreated } from '~/app/api/webhooks/clerk/handlers/user/created';
import { processUserUpdated } from '~/app/api/webhooks/clerk/handlers/user/updated';
import { log } from 'next-axiom';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOKS_SECRET;
  if (!WEBHOOK_SECRET) throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  const body = JSON.stringify(await req.json());
  const wh = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    log.error('Error verifying webhook:', { err, body });
    return new Response('Error occured', { status: 400 });
  }

  switch (event.type) {
    case 'user.created':
      log.debug('processing user.created event');
      await processUserCreated(event.data);
      break;
    case 'user.updated':
      log.debug('processing user.updated event');
      await processUserUpdated(event.data);
      break;
    default:
      log.warn('Unknown event type:', { evt: event });
  }

  return new Response('ok', { status: 200 });
}

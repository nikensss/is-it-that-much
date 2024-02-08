import { withAxiom } from 'next-axiom';
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import('./src/env.js');

/** @type {import("next").NextConfig} */
const config = {
  redirects: () => {
    return Promise.resolve([
      {
        source: '/dashboard',
        destination: '/dashboard/my-expenses',
        permanent: true,
      },
    ]);
  },
};

export default withAxiom(config);

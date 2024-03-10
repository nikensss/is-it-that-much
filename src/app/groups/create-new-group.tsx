import Link from 'next/link';
import { Button } from '~/components/ui/button';

export default function CreateNewGroup() {
  return (
    <Button variant="outline" className="mx-1 w-full md:w-1/4">
      <Link className="my-4" href="/groups/new">
        Create new group
      </Link>
    </Button>
  );
}

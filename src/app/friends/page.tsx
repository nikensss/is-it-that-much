import { UserRoundCog, UserRoundSearchIcon, UsersRound } from 'lucide-react';
import FindFriends from '~/app/friends/find-friends.client';
import MyFriends from '~/app/friends/my-friends.client';
import PendingFriendRequests from '~/app/friends/pending-friend-requests.client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default async function FriendsPage() {
  return (
    <main className="bg-primary-100 flex grow flex-col p-2">
      <div className="flex grow flex-col rounded-md bg-white p-2 shadow-md">
        <header className="bg-primary-900 my-0.5 mb-1.5 flex h-12 items-center justify-center rounded-md">
          <h2 className="text-primary-200 text-lg font-bold">Friends</h2>
        </header>
        <Tabs defaultValue="find-friends" className="flex grow flex-col">
          <TabsList className="grid grid-cols-3 items-center justify-center">
            <TabsTrigger value="find-friends" className="responsive-tab-trigger">
              <span className="compact">
                <UserRoundSearchIcon size={20} />
              </span>
              <span className="full">Search</span>
            </TabsTrigger>
            <TabsTrigger value="pending-friend-requests" className="responsive-tab-trigger">
              <span className="compact">
                <UserRoundCog size={20} />
              </span>
              <span className="full">Requests</span>
            </TabsTrigger>
            <TabsTrigger value="my-friends" className="responsive-tab-trigger">
              <span className="compact">
                <UsersRound size={20} />
              </span>
              <span className="full">My friends</span>
            </TabsTrigger>
          </TabsList>
          <div className="grow">
            <TabsContent value="find-friends" className="h-full">
              <FindFriends />
            </TabsContent>
            <TabsContent value="pending-friend-requests" className="h-full">
              <PendingFriendRequests />
            </TabsContent>
            <TabsContent value="my-friends" className="h-full">
              <MyFriends />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';

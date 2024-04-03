import { UserRoundCog, UserRoundSearchIcon, UsersRound } from 'lucide-react';
import { Block, BlockBody, BlockContainer, BlockTitle } from '~/app/_components/block';
import FindFriends from '~/app/friends/find-friends.client';
import MyFriends from '~/app/friends/my-friends.client';
import PendingFriendRequests from '~/app/friends/pending-friend-requests.client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default async function FriendsPage() {
  return (
    <BlockContainer>
      <Block>
        <BlockTitle>Friends</BlockTitle>
        <BlockBody>
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
        </BlockBody>
      </Block>
    </BlockContainer>
  );
}

export const dynamic = 'force-dynamic';

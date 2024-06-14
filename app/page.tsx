import Home from "@/components/Home";
import {
  fetchFriends,
  fetchUserByClerk,
  getUsers,
} from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import React from "react";

const page = async () => {
  const users = await getUsers();
  const user = await currentUser();

  if (!user) return null;
  const currentUserInfo = await fetchUserByClerk(user.id as string);
  if (!currentUserInfo) return null;

  const friends = await fetchFriends(currentUserInfo.id as string);

  return (
    <>
      <Home users={users} currentUser={currentUserInfo} friends={friends} />
    </>
  );
};

export default page;

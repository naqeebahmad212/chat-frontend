"use client";
import { addFriend } from "@/lib/actions/user.actions";
import { useUser } from "@clerk/nextjs";
import { User } from "@prisma/client";
import Image from "next/image";
import React, { useState, useTransition } from "react";

const RightSidebar = ({
  users,
  currentUser,
}: {
  users: User[];
  currentUser: User;
}) => {
  const senderId = currentUser?.id;
  const [pending, startTransition] = useTransition();

  const addFriendHandler = (reciverId: string) => {
    startTransition(async () => {
      await addFriend({ rcvId: reciverId, sndId: senderId });
    });
  };
  return (
    <div className="w-full bg-gray-100 border-l h-screen">
      <div className="header w-full border-b drop-shadow-lg p-3">
        <div className="flex items-center gap-2">
          <p className="font-bold text-lg text-center w-full py-[2.3px]">
            Find Friends
          </p>
        </div>
      </div>
      <div className="p-2">
        {users.map((user) => {
          if (user.id !== currentUser?.id) {
            return (
              <div
                className="usercard flex gap-2 my-2 items-center w-full justify-between p-2"
                key={user.id}
              >
                <div className="flex items-center gap-2">
                  {" "}
                  <Image
                    src={user.image!}
                    alt={user.name!}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full"
                  />
                  <p className="">{user.name?.slice(0, 15)}</p>
                </div>
                {user.friends?.includes(senderId) ? (
                  <button>Remove</button>
                ) : (
                  <button
                    onClick={() => addFriendHandler(user.id)}
                    className="justify-self-end text-blue-600"
                  >
                    {pending ? "Adding" : "Add"}
                  </button>
                )}
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default RightSidebar;

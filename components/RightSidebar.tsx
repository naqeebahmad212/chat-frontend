"use client";
import { revalidatePathFun } from "@/lib/actions/user.actions";
import { useUser } from "@clerk/nextjs";
import { User } from "@prisma/client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState, useTransition } from "react";

const RightSidebar = ({
  users,
  currentUser,
}: {
  users: User[];
  currentUser: User;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeUserId, setActiveUserId] = useState<string>("");
  const senderId = currentUser?.id;
  const path = usePathname();

  const addFriendHandler = (reciverId: string) => {
    setIsLoading(true);
    fetch("/api/addFriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reciverId, senderId }),
    }).then(async () => {
      await revalidatePathFun(path);
      setIsLoading(false);
    });
  };

  const deleteFriendHandler = (friendId: string) => {
    setIsLoading(true);
    fetch("/api/deleteFriend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friendId, currentUserId: senderId }),
    }).then(async () => {
      await revalidatePathFun(path);
      setIsLoading(false);
    });
  };
  return (
    <div className="w-full bg-gray-100 border-l h-full overflow-y-auto">
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
                  <button
                    disabled={isLoading}
                    onClick={() => {
                      setActiveUserId(user.id);
                      deleteFriendHandler(user.id);
                    }}
                    className="text-sm text-red-600"
                  >
                    {isLoading && activeUserId === user.id
                      ? "Deleting"
                      : "Delete"}
                  </button>
                ) : (
                  <button
                    disabled={isLoading}
                    onClick={() => {
                      addFriendHandler(user.id);
                      setActiveUserId(user.id);
                    }}
                    className="justify-self-end text-blue-600 text-sm"
                  >
                    {isLoading && activeUserId === user.id ? "Adding" : "Add"}
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

"use client";
import Mian from "@/components/Mian";
// import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";
import RightSidebar from "./RightSidebar";
import { Message, Prisma, User } from "@prisma/client";
import {
  MessageContext,
  MessageContextType,
  backendUrl,
} from "@/context/Message";
import { io } from "socket.io-client";

export type UserWithMessages = Prisma.UserGetPayload<{
  include: { reciverMessage: true; senderMessage: true };
}>;

export default function Home({
  users,
  currentUser,
  friends,
}: {
  users: UserWithMessages[];
  currentUser: User;
  friends: UserWithMessages[];
}) {
  const socket = io(backendUrl);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeChat, setActiveChat] = useState<UserWithMessages | null>(null);
  const [lastMessageArray, setLastMessageArray] = useState<Message[]>([]);

  const [isUnreadMsg, setUnreadMsg] = useState<Message | null>(null);

  const messageContext = useContext(MessageContext) as MessageContextType;

  if (!messageContext) {
    throw new Error(
      "useMessageContext must be used within a MessageContextProvider"
    );
  }
  const { lastMessage, setLastMessage } = messageContext;

  useEffect(() => {
    socket.on("messageReceived", (data) => {
      setLastMessageArray([...lastMessageArray, data]);

      setUnreadMsg(data);

      // friends.forEach((frnd) => {
      //   if (data.senderId === frnd.id) {
      //     console.log("i am khan");
      //   }
      // });
    });
  }, [lastMessageArray]);

  return (
    <div className="flex justify-between">
      <div
        className={`${
          isSidebarOpen ? "w-[22%]" : "w-[80px] "
        } bg-gray-100 border-r h-screen overflow-y-auto transition-all duration-500 ease-in `}
      >
        <div className="header flex items-center justify-between drop-shadow-lg p-3 border-b">
          {isSidebarOpen && <span>Chats</span>}
          <div
            className="flex-col flex justify-center items-center relative gap-2 cursor-pointer w-8 h-8"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <div
              className={`${
                isSidebarOpen ? "hidden " : " top-1"
              } w-5 h-[2px] bg-black transition-all duration-700 absolute origin-left right-3`}
            />
            <div
              className={`${
                isSidebarOpen ? " -rotate-45 top-[12px] " : " top-[10px]"
              } w-5 h-[2px] bg-black transition-all duration-700 absolute right-3 `}
            />
            <div
              className={`${
                isSidebarOpen ? "rotate-45 top-[12px]  " : " top-[16px]"
              } w-5 h-[2px] bg-black transition-all duration-700 absolute right-3`}
            />
          </div>
        </div>
        <div>
          {friends.map((user) => {
            if (user.id !== currentUser?.id) {
              const lastMessageInAll = [
                ...user.reciverMessage,
                ...user.senderMessage,
              ].filter((m) => {
                return (
                  m.reciverId === currentUser.id ||
                  m.senderId === currentUser.id
                );
              });

              const userHasNewMessage = lastMessageArray.filter(
                (msg) =>
                  (msg.senderId === user.id &&
                    msg.reciverId === currentUser.id) ||
                  (msg.reciverId === user.id && msg.senderId === currentUser.id)
              );
              return (
                <div
                  className="usercard cursor-pointer border-t border-b flex gap-2 my-2 items-center w-full justify-between p-2"
                  key={user.id}
                  onClick={() => {
                    setActiveChat(user);
                    setUnreadMsg(null);
                  }}
                >
                  <div className="flex items-center gap-3">
                    {" "}
                    <Image
                      src={user.image!}
                      alt={user.name!}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full"
                    />
                    {isSidebarOpen && (
                      <div className="">
                        <p className="">{user.name?.slice(0, 15)}</p>
                        <div className="flex items-center justify-between w-full">
                          <p
                            className={`${
                              isUnreadMsg?.senderId === user.id &&
                              isUnreadMsg.reciverId === currentUser.id
                                ? "text-black"
                                : "text-gray-500"
                            }  self-end text-sm truncate`}
                          >
                            {userHasNewMessage.slice(-1)[0]
                              ? userHasNewMessage.slice(-1)[0].text
                              : lastMessageInAll
                                  .sort((a, b) => {
                                    return (
                                      Number(new Date(a.createdAt!).getTime()) -
                                      Number(new Date(b.createdAt!).getTime())
                                    );
                                  })
                                  .slice(-1)[0].text}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {isUnreadMsg?.senderId === user.id &&
                    isUnreadMsg.reciverId === currentUser.id && (
                      <div
                        className={`${
                          userHasNewMessage.length < 10 ? "size-3" : "size-4"
                        } flex items-center justify-center p-1 text-[9px] rounded-full bg-green-400`}
                      >
                        {userHasNewMessage.length}
                      </div>
                    )}
                </div>
              );
            }
          })}
        </div>
      </div>
      <Mian
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        currentUser={currentUser}
      />

      <div className="w-[23%]">
        <RightSidebar users={users} currentUser={currentUser} />
      </div>
    </div>
  );
}

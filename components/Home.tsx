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
import { extractTime } from "@/utils";
import MobileNav from "./MobileNav";

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
  const [isMobile, setIsMobile] = useState(false);
  const [isUnreadMsg, setUnreadMsg] = useState<Message | null>(null);
  const messageContext = useContext(MessageContext) as MessageContextType;

  const [isConversationActive, setIsConversationActive] = useState(false);
  const [friendsActive, setFriendsActive] = useState(false);
  const [findFriendActive, setFindFriendsActive] = useState(false);

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
    });
  }, [lastMessageArray]);

  useEffect(() => {
    if (window.innerWidth < 868) {
      setIsMobile(true);
      setFriendsActive(true);
    } else {
      setIsMobile(false);
      setFriendsActive(true);
      setIsConversationActive(true);
      setFindFriendsActive(true);
    }

    const ifMobileView = () => {
      if (window.innerWidth < 868) {
        setIsMobile(true);
        setFriendsActive(true);
        setIsConversationActive(false);
        setFindFriendsActive(false);
      } else {
        setIsMobile(false);
        setFriendsActive(true);
        setIsConversationActive(true);
        setFindFriendsActive(true);
      }
    };

    window.addEventListener("resize", () => {
      ifMobileView();
    });
  }, []);

  return (
    <>
      <div className="flex justify-between h-screen relative">
        {friendsActive && (
          <div
            className={` 
            ${!isMobile ? "w-[320px]" : "w-full "}
             bg-gray-100 border-r h-full overflow-y-auto transition-all duration-200 ease-in `}
          >
            <div className="header flex items-center justify-between drop-shadow-lg p-3 border-b">
              {isSidebarOpen && <span>Chats</span>}
              <div
              // className="
              // flex-col flex justify-center items-center relative gap-2 cursor-pointer w-8 h-8
              // "
              // onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {/* <div
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
                /> */}
                <h1>DigiChat</h1>
              </div>
            </div>
            <div>
              {friends.map((user) => {
                // ====================last message from database=============================
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

                  // =====================recvd last msg via socket===================================
                  const userHasNewMessage = lastMessageArray.filter(
                    (msg) =>
                      (msg.senderId === user.id &&
                        msg.reciverId === currentUser.id) ||
                      (msg.reciverId === user.id &&
                        msg.senderId === currentUser.id)
                  );

                  // =========checht socket has msg if not return last msg from database============
                  const eachUserLastMessage = userHasNewMessage.slice(-1)[0]
                    ? userHasNewMessage.slice(-1)[0].text
                    : lastMessageInAll.length > 0
                    ? lastMessageInAll
                        .sort((a, b) => {
                          return (
                            Number(new Date(a.createdAt!).getTime()) -
                            Number(new Date(b.createdAt!).getTime())
                          );
                        })
                        .slice(-1)[0].text
                    : `say hello 👋 `;
                  // ===========format time of the each last message===================
                  const lastMsgTime = userHasNewMessage.slice(-1)[0]
                    ? extractTime(
                        new Date(userHasNewMessage.slice(-1)[0].createdAt!)
                      )
                    : lastMessageInAll.length > 0 &&
                      extractTime(new Date(lastMessageInAll[0].createdAt!));
                  return (
                    <div
                      className="usercard cursor-pointer border-t border-b flex gap-2 my-2 items-center w-full justify-between p-2"
                      key={user.id}
                      onClick={() => {
                        setActiveChat(user);
                        setUnreadMsg(null);
                        if (isMobile) {
                          setFriendsActive(false);
                          setIsConversationActive(true);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {" "}
                        <Image
                          src={user.image!}
                          alt={user.name!}
                          width={40}
                          height={40}
                          className="size-8 lg:size-10 rounded-full"
                        />
                        <div className="">
                          <p className="text-sm md:text-[16px]">
                            {user.name?.slice(0, 15)}
                          </p>
                          <div className="flex items-center justify-between w-full">
                            <p
                              className={`${
                                isUnreadMsg?.senderId === user.id &&
                                isUnreadMsg.reciverId === currentUser.id
                                  ? "text-black"
                                  : "text-gray-500"
                              }  self-end md:text-[10px] xl:text-sm truncate`}
                            >
                              {eachUserLastMessage}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center items-center">
                        {isUnreadMsg?.senderId === user.id &&
                          isUnreadMsg.reciverId === currentUser.id &&
                          user.id !== activeChat?.id && (
                            <div
                              className={`${
                                userHasNewMessage.length < 10
                                  ? "size-3"
                                  : "size-4"
                              } flex items-center justify-center p-1 text-[9px] rounded-full bg-green-400`}
                            >
                              {userHasNewMessage.length}
                            </div>
                          )}

                        <div className="text-sm text-gray-700">
                          {lastMsgTime}
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {isConversationActive && (
          <Mian
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            currentUser={currentUser}
          />
        )}

        {findFriendActive && (
          <div className={`${isMobile ? "w-full" : "w-[320px]"} `}>
            <RightSidebar users={users} currentUser={currentUser} />
          </div>
        )}
      </div>

      <MobileNav
        setIsConversationActive={setIsConversationActive}
        setFindFriendsActive={setFindFriendsActive}
        setIsFriendsActive={setFriendsActive}
      />
    </>
  );
}

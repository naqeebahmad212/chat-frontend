"use client";

import { User } from "@prisma/client";
import Image from "next/image";
import {
  FormEvent,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { UserWithMessages } from "./Home";
import { fetchUserByClerk } from "@/lib/actions/user.actions";
import { io } from "socket.io-client";
import {
  MessageContext,
  MessageContextType,
  backendUrl,
  frontEndUrl,
} from "@/context/Message";
import { extractTime } from "@/utils";
import shareIcon from "../assets/share.svg";
import MobileNav from "./MobileNav";

export interface Message {
  text: string;
  senderId: string;
  reciverId: string;
  id?: string;
  createdAt?: Date;
}

const Mian = ({
  activeChat,
  currentUser,
  setActiveChat,
}: {
  activeChat: UserWithMessages | null;
  currentUser: User;
  setActiveChat: React.Dispatch<React.SetStateAction<UserWithMessages | null>>;
}) => {
  const socket = io(backendUrl);
  const messageContext = useContext(MessageContext) as MessageContextType;
  if (!messageContext) {
    throw new Error(
      "useMessageContext must be used within a MessageContextProvider"
    );
  }
  const { lastMessage, setLastMessage } = messageContext;
  const [loading, setLoading] = useState(false);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const [activeChatInfo, setActiveChatInfo] = useState<UserWithMessages | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<Message>({
    text: "",
    senderId: "",
    reciverId: "",
  });

  // fetch messaegs============
  useEffect(() => {
    if (!activeChat) return;
    setMessages([]);
    fetch(frontEndUrl + "/api/messages/" + activeChat?.id)
      .then((res) => res.json())
      .then((data) => setActiveChatInfo(data.user));
  }, [activeChat]);

  // messages
  // console.log(messages);

  // secket handling
  useEffect(() => {
    socket.on("connect", () => {
      console.log(socket.id, "connected");
    });
    socket.on("messageReceived", (data) => {
      setLastMessage(data);
      if (
        data.senderId === currentUser.id ||
        (data.senderId === activeChat?.id && data.reciverId === currentUser.id)
      ) {
        setMessage((message) => ({ ...message, text: "" }));
        if (data.senderId !== currentUser.id) {
          setMessages((messages) => [...messages, data]);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser, activeChat, setLastMessage]);

  // scoll to bottom
  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
    return;
  };
  useEffect(() => {
    scrollToBottom();
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollTop = lastMessageRef.current.scrollHeight;
    }
  }, [activeChatInfo, messages]);

  // filtering massegs
  useEffect(() => {
    if (!activeChatInfo) return;

    const currentUserMsgzSentToActiveChat =
      activeChatInfo.reciverMessage.filter(
        (msg) => msg.senderId === currentUser.id
      );
    const activeChatMsgsSentToCurrentUser = activeChatInfo.senderMessage.filter(
      (msg) => msg.reciverId === currentUser.id
    );

    setMessages([
      ...currentUserMsgzSentToActiveChat,
      ...activeChatMsgsSentToCurrentUser,
    ]);
  }, [activeChatInfo, currentUser.id]);

  // submit handler
  const submitHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.text || !activeChat) return;
    setMessages((messages) => [...messages, message]);
    message.createdAt = new Date();
    socket.emit("message", message);
    fetch(frontEndUrl + "/api/addMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message.text,
        senderId: currentUser.id,
        reciverId: activeChat?.id,
      }),
    });
  };

  if (!activeChat)
    return (
      <div className="flex-1 bg-gray-100 h-screen flex items-center justify-center">
        <h1 className="text-lg font-semibold">No Chat Selected</h1>
      </div>
    );

  if (loading)
    return (
      <div className="w-full  bg-gray-100 h-screen flex items-center justify-center">
        <h1 className="text-lg font-semibold">Loading...</h1>
      </div>
    );

  return (
    <div className="flex-1 bg-gray-100 h-full">
      <div className="header w-full border-b drop-shadow-sm flex items-center justify-between sticky top-0 p-3 bg-gray-100 z-[999]">
        <div className="flex items-center gap-2">
          {" "}
          {activeChat.image ? (
            <Image
              src={activeChat.image}
              alt={activeChat.name ? activeChat.name : "Profile"}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-pink-300">
              <span>{activeChat.name?.slice(0, 1)}</span>
            </div>
          )}{" "}
          <span>{activeChat?.name}</span>
        </div>
      </div>

      <div className="message-container custom-scrollbar h-[85%] overflow-y-auto bg-gray-0">
        <div className="p-2">
          {messages.length > 0 &&
            messages
              .sort((a, b) => {
                return (
                  Number(new Date(a.createdAt!).getTime()) -
                  Number(new Date(b.createdAt!).getTime())
                );
              })
              .map((message, index) => {
                const ifMyMessage = message.senderId === currentUser.id;
                let date: Date = new Date(message.createdAt!);

                let options: Intl.DateTimeFormatOptions = {
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                };
                let timeString = date.toLocaleTimeString("en-US", options);

                return (
                  <div
                    key={index}
                    ref={index === messages.length - 1 ? lastMessageRef : null}
                  >
                    {ifMyMessage ? (
                      <div key={index} className=" ">
                        <div className="bg-green-300 p-1 mr-auto mt-2 rounded-lg inline-block pr-3 max-w-[66.66%] text-sm">
                          <p className="flex ">
                            {message.text}
                            <span className="text-[8px]  ml-3 mt-[6px] ">
                              {extractTime(message.createdAt!)}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div key={index} className="flex justify-end ">
                        <div className="bg-white relative p-1 ml-auto mt-2 rounded-lg inline-block pr-3 max-w-[66.66%] text-sm">
                          <p className="flex ">
                            {message.text}
                            <span className="text-[8px]  ml-3 mt-[6px] ">
                              {timeString}
                            </span>
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          submitHandler(e);
        }}
      >
        <div className="input w-full  h-[10%] flex items-center justify-around gap-1 ">
          <input
            type="text"
            className="w-full rounded-full outline-none p-2 px-4 border "
            placeholder="Type your message here"
            onChange={(e) =>
              setMessage({
                ...message,
                text: e.target.value,
                senderId: currentUser.id,
                reciverId: activeChat.id,
              })
            }
            value={message.text}
          />
          <button
            type="submit"
            className="p-2  border rounded-full drop-shadow-lg bg-white"
          >
            <Image src={shareIcon} alt="send" width={25} height={25} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Mian;

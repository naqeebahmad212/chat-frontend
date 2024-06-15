import Image from "next/image";
import React, { Dispatch, SetStateAction } from "react";
import messageIcon from "@/assets/reply.svg";
import peopleIcon from "@/assets/members.svg";
import searchIcon from "@/assets/search-gray.svg";

const MobileNav = ({
  setIsConversationActive,
  setFindFriendsActive,
  setIsFriendsActive,
}: {
  setIsConversationActive: Dispatch<SetStateAction<boolean>>;
  setFindFriendsActive: Dispatch<SetStateAction<boolean>>;
  setIsFriendsActive: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <div className="flex gap-3 w-full max-h-[200px] justify-around absolute bottom-0 right-0  md:hidden p-3 border-t rounded-t-full drop-shadow-xl bg-transparent filter">
      <span
        onClick={() => {
          setIsFriendsActive(true);
          setIsConversationActive(false);
          setFindFriendsActive(false);
        }}
      >
        <Image src={peopleIcon} alt="people" width={25} height={25} />
      </span>
      <span
        onClick={() => {
          setIsConversationActive(true);
          setIsFriendsActive(false);
          setFindFriendsActive(false);
        }}
      >
        <Image src={messageIcon} alt="chat" width={30} height={30} />
      </span>

      <span
        onClick={() => {
          setFindFriendsActive(true);
          setIsConversationActive(false);
          setIsFriendsActive(false);
        }}
      >
        <Image src={searchIcon} alt="search" width={25} height={25} />
      </span>
    </div>
  );
};

export default MobileNav;

"use server"
import { Prisma, User } from "@prisma/client";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

interface UserParams{
    clerkId  :     string
    email :        string    
    name :        string
    password? :     string
    image ? :       string


}
export const createUser= async (user:UserParams)=>{
   const newUser= await prisma.user.create({
        data:{
            clerkId:user.clerkId,
            email:user.email,
            name:user.name,
            image:user.image,
            friends:[]
            
        }
    })
}


export const getUsers= async ()=>{
    const users= await prisma.user.findMany({include:{reciverMessage:true, senderMessage:true}})

    return users
}



export const addFriend=async({rcvId,sndId} :{rcvId:string,sndId:string})=>{
   try {
    const rcvr= await prisma.user.update({
        where:{id : rcvId},
        data:{
           friends:{
            push:sndId
           }
            
        },
        
    })


    const sender= await prisma.user.update({
        where:{id : sndId},
        data:{  
            friends:{
                push:rcvId
            }
        }
    })
    revalidatePath('/')
    
   } catch (error) {
    console.log(error)
   }

}


export const fetchFriends=async(id:string)=>{
    const user= await prisma.user.findUnique({
        where:{
            id
        },
        select:{
            friends:true
        },
        
    })

    const friendIDs= user?.friends
    const friends= await prisma.user.findMany({
        where:{
            id:{
                in:friendIDs
            }
        },
        include:{
            reciverMessage:true,senderMessage:true
        }
    })
    return friends
    
}


export const fetchUserByClerk=async(clerkId:string)=>{
    const user= await prisma.user.findFirst({
        where:{
            clerkId:clerkId
        },
        include:{
            reciverMessage:true,senderMessage:true
        }
    })
    return user
}



export const addMessage=async({senderId,receiverId,text} :{senderId:string,receiverId:string,text:string})=>{

    if(!senderId || !receiverId || !text) throw new Error("Missing params")
    try {
        const newMessage= await prisma.message.create({
            data:{
                text,
                reciverId:receiverId,
                senderId
            }
        })
        console.log(newMessage)
        revalidatePath('/')
    } catch (error:any) {
        console.log(error.message)
    }
      
    
}


export const getMessages=async({senderId,receiverId}:{senderId:string,receiverId:string})=>{
    const user= await prisma.user.findUnique({
        where:{
            id:senderId
        },
        include:{
            reciverMessage:true,
            senderMessage:true
        }
    })
    if(!user) throw new Error("User not found")
    const conversation=[...user?.reciverMessage,...user?.senderMessage]

    const currentConversation=conversation.filter((message)=> message.senderId === senderId )
    console.log(currentConversation)
    
    
}



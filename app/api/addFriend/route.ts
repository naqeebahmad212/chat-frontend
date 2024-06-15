import { prisma } from "@/lib/actions/prisma"
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export const POST = async(req:NextRequest,res:NextResponse)=>{
    const {reciverId,senderId}= await req.json()


    try {

        // check if friend already exist

        const friend= await prisma.user.findUnique({
            where:{id:reciverId},
            select:{
                friends:true
            }
        })
        const ifFriendExist= friend?.friends?.includes(senderId)

        if(ifFriendExist){
            return NextResponse.json({ message:'friend already exist',status:400 });
        
        }



         await prisma.user.update({
            where:{id : reciverId},
            data:{
               friends:{
                push:senderId
               }
                
            },
            
        })
        
         await prisma.user.update({
            where:{id : senderId},
            data:{  
                friends:{
                    push:reciverId
                }
            }
        })
        revalidatePath('/')
        return NextResponse.json({ revalidated: true })
        
       } catch (error) {
        console.log(error)
        return NextResponse.json({ message:'cannot add the friend' });
       }


    
}
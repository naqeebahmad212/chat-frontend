import { prisma } from "@/lib/actions/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// export const revalidate=true

export const POST= async (req:NextRequest, res: NextResponse) => {
    const { friendId, currentUserId } =   await req.json();
    if (!friendId || !currentUserId) {
        return new Response("Missing params", {
            status: 400,
        });
    }
    try {
        // find friend====================================
       const friend= await prisma.user.findUnique({
           where:{
               id:friendId},
               select:{
                   friends:true
               }
       })
       
       const updatedFriendArray= friend?.friends?.filter((id)=> id !== currentUserId)
    //    update friend
    await prisma.user.update({
        where:{
            id:friendId
        },
        data:{
            friends:updatedFriendArray
        }
    })

    // find current user===============================================
    const currentUser= await prisma.user.findUnique({
        where:{
            id:currentUserId
        },
        select:{
            friends:true
        }
    })
    const updatedCurrentUserArray= currentUser?.friends?.filter((id)=> id !== friendId)
    // update current user
    await prisma.user.update({
        where:{
            id:currentUserId
        },
        data:{
            friends:updatedCurrentUserArray
        }
    })
    return NextResponse.json({ revalidated: true });


    }catch (error) {
        console.log(error,'cannot delete the friend')
        return NextResponse.json({ message:'cannot delete the friend' });

    }


   
}
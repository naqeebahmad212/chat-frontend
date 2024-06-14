import { prisma } from "@/lib/actions/prisma";
import { addMessage } from "@/lib/actions/user.actions";

export const POST = async (req: Request) => {
  const { text, senderId, reciverId } = await req.json();
  if (!text || !senderId || !reciverId) {
    return new Response("Missing params", {
      status: 400,
    });
  }

  try {
     await prisma.message.create({
      data: {
        text,
        senderId,
        reciverId,
      },
    })

    return new Response("Message sent", {
      status: 200,
    })
  }catch (error) {
    return new Response("Something went wrong", {
      status: 500,
    });
  }
};

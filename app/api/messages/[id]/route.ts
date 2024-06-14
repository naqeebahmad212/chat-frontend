// app/api/messages/[id]/route.ts
import { prisma } from '@/lib/actions/prisma';
import { NextResponse } from 'next/server';

// Example data source


export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
 const user= await prisma.user.findUnique({
  where: {
    id: id
  },
  include: {
    reciverMessage: true,
    senderMessage: true
  }
 })

  if (user) {
    return NextResponse.json({ user });
  } else {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }
}

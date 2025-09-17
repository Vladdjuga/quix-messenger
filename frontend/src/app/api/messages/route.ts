import { NextResponse } from 'next/server';

export async function POST() {
  // Message sending is handled via WebSocket only.
  return NextResponse.json({ message: 'Send messages via WebSocket only' }, { status: 405 });
}

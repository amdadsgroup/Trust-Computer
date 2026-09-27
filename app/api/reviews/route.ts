import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'The review system has been removed and is disabled.' },
    { status: 404 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'The review system has been removed and is disabled.' },
    { status: 404 }
  );
}

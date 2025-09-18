import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref');

  if (!ref) {
    return NextResponse.json({ error: 'Missing ref' }, { status: 400 });
  }

  const response = NextResponse.redirect(new URL(`/?ref=${ref}`, request.url));

  // Store a persistent cookie (1 year)
  response.cookies.set({
    name: 'ref',
    value: ref,
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return response;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { ref } = body;

  if (!ref) {
    return NextResponse.json({ error: 'Missing ref' }, { status: 400 });
  }

  const response = NextResponse.redirect(new URL(`/?ref=${ref}`, request.url));

  // Store persistent cookie
  response.cookies.set({
    name: 'ref',
    value: ref,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

import { NextResponse } from 'next/server';

const COOKIE = 'masarah_auth';

export async function POST(req: Request) {
  const { password } = await req.json();
  const expected = process.env.APP_PASSWORD || 'masarah123';
  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '1', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE);
  return res;
}
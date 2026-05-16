import { NextResponse } from 'next/server';

export const POST = async () => {
  const response = NextResponse.json({ success: true });

  response.cookies.delete('accessToken');
  response.cookies.delete('refreshToken');

  return response;
};

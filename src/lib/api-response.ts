import { NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message ? { message } : {}),
    },
    { status }
  );
}

export function errorResponse(
  message: string,
  status: number = 500,
  code?: string
) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(code ? { code } : {}),
    },
    { status }
  );
}
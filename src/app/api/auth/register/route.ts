import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

interface RegisterRequest {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Read request body
    // --------------------------------------------------

    const body: RegisterRequest = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
    } = body;

    // --------------------------------------------------
    // 2. Basic validation
    // --------------------------------------------------

    if (!firstName || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "First name, email and password are required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 3. Clean user input
    // --------------------------------------------------

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName?.trim() || null;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone?.trim() || null;

    // --------------------------------------------------
    // 4. Validate first name
    // --------------------------------------------------

    if (cleanFirstName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "First name must contain at least 2 characters.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 5. Validate email
    // --------------------------------------------------

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 6. Validate password
    // --------------------------------------------------

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least 8 characters.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 7. Check whether user already exists
    // --------------------------------------------------

    const existingUser = await prisma.user.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // 8. Hash password
    // --------------------------------------------------

    const hashedPassword = await hashPassword(password);

    // --------------------------------------------------
    // 9. Create user
    // --------------------------------------------------

    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        phone: cleanPhone,
        password: hashedPassword,
         updatedAt: new Date(),
      },
    });

    // --------------------------------------------------
    // 10. Return safe user data
    // --------------------------------------------------

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating your account.",
      },
      { status: 500 }
    );
  }
}
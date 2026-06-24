import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>{session.user?.name}</h1>
      <p>{session.user?.email}</p>
    </div>
  );
}
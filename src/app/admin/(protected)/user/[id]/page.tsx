"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { UserForm } from "@/components/admin/users/user-form";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <Link href="/admin/users" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" />
        Back to users
      </Link>
      <div className="mx-auto mb-6 max-w-2xl">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit User</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update this account&apos;s details.</p>
      </div>
      <UserForm userId={params.id} />
    </div>
  );
}

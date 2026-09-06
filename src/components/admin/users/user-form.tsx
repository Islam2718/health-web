"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminAuth } from "@/context/admin-auth-context";
import { ApiError } from "@/lib/api-client";
import { createUser, fetchUser, updateUser, ROLE_OPTIONS, type AdminUserPayload } from "@/lib/admin-users";
import { bloodGroupOptions } from "@/lib/patients-data";

function extractErrorMessage(err: unknown, fallback: string) {
  if (err instanceof ApiError) {
    const body = err.body as { errors?: Record<string, string[]> } | null;
    const firstFieldError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    return firstFieldError ?? err.message;
  }
  return fallback;
}

export function UserForm({ userId }: { userId?: string }) {
  const router = useRouter();
  const { token } = useAdminAuth();
  const isEditing = Boolean(userId);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("USER");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [address, setAddress] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    if (!userId || !token) return;
    let cancelled = false;
    (async () => {
      const user = await fetchUser(token, userId);
      if (cancelled) return;
      if (!user) {
        toast.error("Could not load this user.");
        setLoading(false);
        return;
      }
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setPhone(user.phone ?? "");
      setType(user.type?.split(",")[0]?.trim().toUpperCase() || "USER");
      setGender(user.gender ?? "");
      setDateOfBirth(user.date_of_birth ? user.date_of_birth.slice(0, 10) : "");
      setAddress(user.address ?? "");
      setBloodGroup(user.blood_group ?? "");
      setMaritalStatus(user.marital_status ?? "");
      setProfileImage(user.profile_image ?? "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!name.trim()) {
      toast.error("Enter the user's name.");
      return;
    }
    if (!isEditing && !password.trim()) {
      toast.error("Set a password for the new account.");
      return;
    }
    if (!phone.trim() && !email.trim()) {
      toast.error("Provide at least a phone number or an email.");
      return;
    }

    const payload: AdminUserPayload = {
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      type,
      gender: gender || undefined,
      date_of_birth: dateOfBirth || undefined,
      address: address.trim() || undefined,
      blood_group: bloodGroup || undefined,
      marital_status: maritalStatus || undefined,
      profile_image: profileImage.trim() || undefined,
    };
    // Only sent when the admin actually typed one — editing an account
    // shouldn't force a password reset every time.
    if (password.trim()) payload.password = password.trim();

    setSaving(true);
    try {
      if (isEditing && userId) {
        await updateUser(token, userId, payload);
        toast.success("User updated");
      } else {
        await createUser(token, payload);
        toast.success("User added");
      }
      router.push("/admin/users");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not save this user."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl justify-center py-16">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="size-8 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Account Information</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Role</Label>
              <Select value={type} onValueChange={(v) => setType(v ?? "USER")}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue>
                    {(value: string) => ROLE_OPTIONS.find((r) => r.value === value)?.label ?? value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" className="mt-1.5" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password">{isEditing ? "New Password (optional)" : "Password"}</Label>
              <Input
                id="password"
                type="password"
                className="mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? "Leave blank to keep the current password" : "••••••••"}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="profileImage">Profile Image URL</Label>
              <Input
                id="profileImage"
                className="mt-1.5"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <Card className="border-border/60 p-6">
          <h2 className="font-semibold text-foreground">Profile Details</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v ?? "")}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                className="mt-1.5"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
            <div>
              <Label>Blood Group</Label>
              <Select value={bloodGroup} onValueChange={(v) => setBloodGroup(v ?? "")}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroupOptions.map((bg) => (
                    <SelectItem key={bg} value={bg}>
                      {bg}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marital Status</Label>
              <Select value={maritalStatus} onValueChange={(v) => setMaritalStatus(v ?? "")}>
                <SelectTrigger className="mt-1.5 w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Married">Married</SelectItem>
                  <SelectItem value="Divorced">Divorced</SelectItem>
                  <SelectItem value="Widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" className="mt-1.5" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          <Save />
          {saving ? "Saving..." : isEditing ? "Save Changes" : "Add User"}
        </Button>
      </div>
    </form>
  );
}

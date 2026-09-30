"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Pencil, Plus, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { useStore } from "@/context/store-context";

export default function ShopPage() {
  const { user } = useAuth();
  const { myStore, myStoreLoading, saveStoreProfile } = useStore();

  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [license, setLicense] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!myStore) return;
    setName(myStore.store_name);
    setAddress(myStore.store_address);
    setLicense(myStore.trade_license_no);
    setPhone(myStore.phone ?? "");
    setEmail(myStore.email ?? "");
    setDescription(myStore.description ?? "");
  }, [myStore]);

  const openCreateForm = () => {
    setName("");
    setAddress("");
    setLicense("");
    setPhone(user?.phone ?? "");
    setEmail(user?.email ?? "");
    setDescription("");
    setFormOpen(true);
  };

  const openEditForm = () => {
    if (!myStore) return;
    setName(myStore.store_name);
    setAddress(myStore.store_address);
    setLicense(myStore.trade_license_no);
    setPhone(myStore.phone ?? "");
    setEmail(myStore.email ?? "");
    setDescription(myStore.description ?? "");
    setFormOpen(true);
  };

  const submit = async () => {
    if (!name.trim() || !address.trim() || !license.trim()) {
      toast.error("Store name, address, and trade license number are required.");
      return;
    }
    setSaving(true);
    const saved = await saveStoreProfile({
      store_name: name.trim(),
      store_address: address.trim(),
      trade_license_no: license.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      description: description.trim() || undefined,
    });
    setSaving(false);
    if (saved) setFormOpen(false);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <Card className="border-border/60 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Store className="size-5 text-primary" />
                {myStore ? myStore.store_name : "My Store"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {myStore ? "Your registered medical store." : "Register a store to start adding medicines and tracking stock."}
              </p>
            </div>
            {myStore && !formOpen && (
              <Button size="sm" variant="outline" onClick={openEditForm}>
                <Pencil />
                Edit
              </Button>
            )}
          </div>

          {myStoreLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : !myStore && !formOpen ? (
            <div className="mt-5 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 p-8 text-center">
              <Store className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">You haven&apos;t registered a store yet.</p>
              <Button size="sm" onClick={openCreateForm}>
                <Plus />
                Register a Store
              </Button>
            </div>
          ) : formOpen ? (
            <div className="mt-5 space-y-3 rounded-xl border border-dashed border-border/60 p-4">
              <div className="space-y-1.5">
                <Label htmlFor="storeName">Store Name</Label>
                <Input id="storeName" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="storeAddress">Address</Label>
                <Input id="storeAddress" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="storeLicense">Trade License Number</Label>
                  <Input id="storeLicense" value={license} onChange={(e) => setLicense(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="storePhone">Phone</Label>
                  <Input id="storePhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="storeEmail">Email</Label>
                <Input id="storeEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="storeDescription">Description</Label>
                <Textarea id="storeDescription" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={submit} disabled={saving}>
                  {saving ? "Saving..." : myStore ? "Save Changes" : "Register Store"}
                </Button>
              </div>
            </div>
          ) : (
            myStore && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="text-sm text-foreground">{myStore.store_address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trade License</p>
                  <p className="text-sm text-foreground">{myStore.trade_license_no}</p>
                </div>
                {myStore.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-foreground">{myStore.phone}</p>
                  </div>
                )}
                {myStore.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{myStore.email}</p>
                  </div>
                )}
                {myStore.description && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm text-foreground">{myStore.description}</p>
                  </div>
                )}
              </div>
            )
          )}
        </Card>
      </motion.div>
    </div>
  );
}

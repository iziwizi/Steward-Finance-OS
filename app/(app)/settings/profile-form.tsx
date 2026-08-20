"use client";

import { useState, useTransition, useRef } from "react";
import { updateProfile, uploadAvatar, removeAvatar } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Loader2, Check, AlertCircle, Upload, Trash2 } from "lucide-react";

export function ProfileForm({
  profile,
  userEmail,
}: {
  profile: any;
  userEmail: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName = profile?.full_name || "";
  const userInitials = fullName
    ? fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : "MA";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await uploadAvatar(formData);
      if (res.success && res.avatarUrl) {
        setAvatarUrl(res.avatarUrl);
        setStatusMessage({ type: "success", text: "Avatar updated successfully." });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to upload avatar." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to upload avatar." });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    setStatusMessage(null);
    try {
      const res = await removeAvatar();
      if (res.success) {
        setAvatarUrl(null);
        setStatusMessage({ type: "success", text: "Avatar removed." });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to remove avatar." });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err.message || "Failed to remove avatar." });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await updateProfile(formData);
      if (res.success) {
        setStatusMessage({ type: "success", text: "Profile changes saved successfully." });
      } else {
        setStatusMessage({ type: "error", text: res.error || "Could not save profile changes." });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900">Personal Profile</h2>
          <p className="text-xs text-zinc-400">
            This information is saved locally inside your secure StewardOS sandbox.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Avatar Section matching Figma desktop-settings-page */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-500 font-extrabold text-white text-lg shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <span>{userInitials}</span>
          )}
          {isUploadingAvatar && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            className="hidden"
            id="avatar-upload-input"
          />
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all hover:bg-brand-600 disabled:opacity-50"
            >
              <Upload className="h-3 w-3" />
              Upload New
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isUploadingAvatar}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 shadow-xs transition-all hover:bg-zinc-50 hover:text-rose-600 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>
          <p className="text-[11px] text-zinc-400">JPG, PNG, or SVG. Max size 2MB.</p>
        </div>
      </div>

      {/* Inputs matching Figma desktop-settings-page */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
        <div>
          <label className="text-xs font-semibold text-zinc-700">Full Name</label>
          <input
            name="full_name"
            type="text"
            defaultValue={fullName}
            required
            placeholder="e.g. Martins Adekunle"
            className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700">Email Address</label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-xs text-zinc-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700">Currency</label>
          <select
            name="currency"
            defaultValue={profile?.currency || "NGN"}
            className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="NGN">NGN — Nigerian Naira</option>
            <option value="USD">USD — US Dollar</option>
            <option value="GBP">GBP — British Pound</option>
            <option value="EUR">EUR — Euro</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700">Timezone</label>
          <select
            name="timezone"
            defaultValue={profile?.timezone || "Africa/Lagos"}
            className="tap-target mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="Africa/Lagos">West Africa Time (GMT+1)</option>
            <option value="Europe/London">Greenwich Mean Time (GMT+0)</option>
            <option value="America/New_York">Eastern Time (GMT-5)</option>
            <option value="America/Los_Angeles">Pacific Time (GMT-8)</option>
          </select>
        </div>
      </div>

      {/* Bottom Actions matching Figma desktop-settings-page */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
        <button
          type="button"
          onClick={() => setStatusMessage(null)}
          className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
        >
          Discard
        </button>
        <Button type="submit" variant="primary" disabled={isPending} className="px-5 py-2 text-xs">
          {isPending ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}

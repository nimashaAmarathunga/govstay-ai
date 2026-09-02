"use client";

import { FormEvent, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useUser, roleLabel, roleBadgeClass, userInitial } from "@/components/context/UserContext";
import {
  User,
  ShieldCheck,
  Building,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  CheckCircle2,
  FileText,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5";

export default function ProfilePage() {
  const t = useTranslations("Profile");
  const tCommon = useTranslations("Common");
  const { activeUser, refreshUsers } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idPhotoUrl, setIdPhotoUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    memberId: "",
    phone: "",
    email: "",
    department: "",
    designation: "",
    district: "",
    address: ""
  });

  useEffect(() => {
    async function loadProfile() {
      if (!activeUser?.id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const res = await fetch(`/api/users/profile?userId=${activeUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            fullName: data.name || "",
            nic: data.nicNumber || "",
            memberId: data.empId || "",
            phone: data.mobileNumber || "",
            email: data.emailAddress || "",
            department: data.placeOfWork || "",
            designation: data.position || "",
            district: data.preferredDistrict || "",
            address: data.residentialAddress || ""
          });
          setIdPhotoUrl(data.empIdPhoto || null);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [activeUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setIsSaved(false);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeUser?.id) return;

    try {
      setIsSaving(true);
      setError(null);
      const res = await fetch(`/api/users/profile?userId=${activeUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Failed to save profile");
      setIsSaved(true);
      await refreshUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50 flex items-center justify-center p-12">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin text-slate-900" />
          <span className="text-sm font-medium">{tCommon("loading")}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50/60 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white py-10 px-6 shadow-sm">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-3 backdrop-blur-md border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GovSewana</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t("pageTitle")}</h1>
          <p className="mt-2 text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">
            {t("pageSubtitle")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 -mt-6">
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          {/* Left Sidebar Profile Summary */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-900 text-white text-2xl font-bold shadow-md">
                  {activeUser ? userInitial(activeUser.name) : "U"}
                </div>
                <h2 className="mt-4 text-base font-bold text-slate-900">
                  {formData.fullName || activeUser?.name || "Registered User"}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  @{activeUser?.username || "user"}
                </p>

                {activeUser && (
                  <span className={`mt-3 inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${roleBadgeClass(activeUser.role)}`}>
                    {roleLabel(activeUser.role)}
                  </span>
                )}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-medium">{tCommon("status")}</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    {activeUser?.status === "RETIRED" ? "Retired" : "Active / Verified"}
                  </span>
                </div>
                {formData.memberId && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400 font-medium">{t("memberId")}</span>
                    <span className="font-mono font-semibold text-slate-800">{formData.memberId}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Uploaded ID Document Card */}
            {idPhotoUrl && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">{t("uploadedDocument")}</h3>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-48 flex items-center justify-center p-2">
                  {idPhotoUrl.endsWith(".pdf") ? (
                    <div className="py-6 flex flex-col items-center gap-2 text-slate-600">
                      <FileText className="w-10 h-10 text-slate-400" />
                      <span className="text-xs font-semibold truncate max-w-[160px]">{idPhotoUrl.split("/").pop()}</span>
                    </div>
                  ) : (
                    <img
                      src={idPhotoUrl}
                      alt="Verified ID"
                      className="max-h-44 object-contain rounded-lg"
                    />
                  )}
                </div>
                <p className="text-[11px] text-emerald-600 font-medium mt-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{tCommon("verified")}</span>
                </p>
              </div>
            )}
          </aside>

          {/* Right Main Form Container */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs border border-red-200 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Personal Information */}
            <section>
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <User className="w-5 h-5 text-slate-700" />
                <h2 className="text-lg font-bold text-slate-900">{t("accountDetails")}</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">{t("fullName")} *</span>
                  <input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" placeholder="Full name" className={inputClassName} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">{t("nic")} *</span>
                  <input required name="nic" value={formData.nic} onChange={handleChange} type="text" placeholder="NIC Number" className={inputClassName} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">{t("memberId")}</span>
                  <input name="memberId" value={formData.memberId} onChange={handleChange} type="text" placeholder="e.g. 245503B" className={inputClassName} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">{t("phone")}</span>
                  <input name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="077 123 4567" className={inputClassName} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">{t("email")}</span>
                  <input name="email" value={formData.email} onChange={handleChange} type="email" placeholder="name@gov.lk" className={inputClassName} />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">{t("address")}</span>
                  <input name="address" value={formData.address} onChange={handleChange} type="text" placeholder="Street, City, District" className={inputClassName} />
                </label>
              </div>
            </section>

            {/* Employment Information */}
            <section className="pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <Building className="w-5 h-5 text-slate-700" />
                <h2 className="text-lg font-bold text-slate-900">{t("employmentDetails")}</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">{t("department")}</span>
                  <input name="department" value={formData.department} onChange={handleChange} type="text" placeholder="Ministry / Department" className={inputClassName} />
                </label>

                <label>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">{t("designation")}</span>
                  <input name="designation" value={formData.designation} onChange={handleChange} type="text" placeholder="Position / Grade" className={inputClassName} />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">{t("district")}</span>
                  <select name="district" value={formData.district} onChange={handleChange} className={inputClassName}>
                    <option value="">Select District</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Galle">Galle</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                    <option value="Anuradhapura">Anuradhapura</option>
                    <option value="Polonnaruwa">Polonnaruwa</option>
                    <option value="Jaffna">Jaffna</option>
                    <option value="Trincomalee">Trincomalee</option>
                    <option value="Ratnapura">Ratnapura</option>
                    <option value="Kurunegala">Kurunegala</option>
                    <option value="Gampaha">Gampaha</option>
                  </select>
                </label>
              </div>
            </section>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t("savedSuccess")}</span>
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95 ml-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("saving")}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t("saveChanges")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
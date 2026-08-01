"use client";

import { FormEvent, useState, useEffect } from "react";
import { useUser } from "@/components/context/UserContext";

const inputClassName = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ProfilePage() {
  const { activeUser } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      if (!activeUser?.id) return;
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
        <div className="animate-pulse">Loading profile...</div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-8 md:py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">Account details</p>
          <h1 className="text-3xl font-bold text-slate-800">My Profile</h1>
          <p className="mt-2 max-w-2xl text-slate-500">Keep your identity and contact information ready for faster government accommodation bookings.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[16rem_1fr]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined text-[42px]">person</span>
            </div>
            <h2 className="mt-5 text-lg font-bold text-slate-800">Booking profile</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">These details help verify eligibility and complete reservation requests.</p>
            <div className="mt-6 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs leading-5 text-emerald-700">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Your information is used for booking verification.</span>
            </div>
          </aside>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}
            <section>
              <h2 className="text-xl font-bold text-slate-800">Personal information</h2>
              <p className="mt-1 text-sm text-slate-500">Use the name and identity details shown on your official documents.</p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Full name</span>
                  <input required name="fullName" value={formData.fullName} onChange={handleChange} type="text" placeholder="Enter your full name" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">NIC number</span>
                  <input required name="nic" value={formData.nic} onChange={handleChange} type="text" pattern="(?:[0-9]{9}[VXvx]|[0-9]{12})" title="Enter a valid Sri Lankan NIC, such as 901234567V or 199012345678" placeholder="901234567V or 199012345678" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Government member ID</span>
                  <input required name="memberId" value={formData.memberId} onChange={handleChange} type="text" placeholder="e.g. GOV-02481" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Mobile number</span>
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" pattern="(?:\+94|0)7[0-9]{8}" title="Enter a Sri Lankan mobile number, such as 0771234567 or +94771234567" placeholder="077 123 4567" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Email address</span>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="name@gmail.com" className={inputClassName} />
                </label>
              </div>
            </section>

            <section className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="text-xl font-bold text-slate-800">Employment information</h2>
              <p className="mt-1 text-sm text-slate-500">Add the details used to support your government accommodation eligibility.</p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Ministry or department</span>
                  <input required name="department" value={formData.department} onChange={handleChange} type="text" placeholder="e.g. Ministry of Health" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Designation</span>
                  <input name="designation" value={formData.designation} onChange={handleChange} type="text" placeholder="e.g. Administrative Officer" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Preferred district</span>
                  <select required name="district" value={formData.district} onChange={handleChange} className={inputClassName}>
                    <option value="" disabled>Select a district</option>
                    <option>Colombo</option>
                    <option>Galle</option>
                    <option>Kandy</option>
                    <option>Nuwara Eliya</option>
                    <option>Ratnapura</option>
                    <option>Anuradhapura</option>
                    <option>Polonnaruwa</option>
                    <option>Jaffna</option>
                    <option>Trincomalee</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Residential address</span>
                  <input required name="address" value={formData.address} onChange={handleChange} type="text" placeholder="Street, town, district" className={inputClassName} />
                </label>
              </div>
            </section>

            <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
              <p className={`text-sm font-medium ${isSaved ? "text-emerald-600" : "text-slate-400"}`} aria-live="polite">
                {isSaved ? "Profile details saved successfully." : "Make changes and click save."}
              </p>
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
                <span className="material-symbols-outlined text-[18px]">
                  {isSaving ? "sync" : "save"}
                </span>
                {isSaving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
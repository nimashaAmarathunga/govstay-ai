"use client";

import { FormEvent, useState } from "react";

const inputClassName = "w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ProfilePage() {
  const [isSaved, setIsSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaved(true);
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
            <section>
              <h2 className="text-xl font-bold text-slate-800">Personal information</h2>
              <p className="mt-1 text-sm text-slate-500">Use the name and identity details shown on your official documents.</p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Full name</span>
                  <input required name="fullName" type="text" placeholder="Enter your full name" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">NIC number</span>
                  <input required name="nic" type="text" pattern="(?:[0-9]{9}[VXvx]|[0-9]{12})" title="Enter a valid Sri Lankan NIC, such as 901234567V or 199012345678" placeholder="901234567V or 199012345678" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Government member ID</span>
                  <input required name="memberId" type="text" placeholder="e.g. GOV-02481" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Mobile number</span>
                  <input required name="phone" type="tel" pattern="(?:\+94|0)7[0-9]{8}" title="Enter a Sri Lankan mobile number, such as 0771234567 or +94771234567" placeholder="077 123 4567" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Email address</span>
                  <input required name="email" type="email" placeholder="name@example.com" className={inputClassName} />
                </label>
              </div>
            </section>

            <section className="mt-8 border-t border-slate-100 pt-8">
              <h2 className="text-xl font-bold text-slate-800">Employment information</h2>
              <p className="mt-1 text-sm text-slate-500">Add the details used to support your government accommodation eligibility.</p>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Ministry or department</span>
                  <input required name="department" type="text" placeholder="e.g. Ministry of Health" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Designation</span>
                  <input name="designation" type="text" placeholder="e.g. Administrative Officer" className={inputClassName} />
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Preferred district</span>
                  <select required name="district" defaultValue="" className={inputClassName}>
                    <option value="" disabled>Select a district</option>
                    <option>Colombo</option>
                    <option>Galle</option>
                    <option>Kandy</option>
                    <option>Nuwara Eliya</option>
                    <option>Ratnapura</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Residential address</span>
                  <input required name="address" type="text" placeholder="Street, town, district" className={inputClassName} />
                </label>
              </div>
            </section>

            <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
              <p className={`text-sm font-medium ${isSaved ? "text-emerald-600" : "text-slate-400"}`} aria-live="polite">
                {isSaved ? "Profile details saved for this session." : "Your details stay on this device for now."}
              </p>
              <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-700">
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
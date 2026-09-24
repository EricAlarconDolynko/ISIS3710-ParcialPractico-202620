"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { register } from "@/services/auth";
import { saveSession } from "@/services/session";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("Auth");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      const id = await register(username, email, name, password);
      saveSession(id, username);
      router.push("/plans");
    } catch (err) {
      setError("registerFailed");
      console.log(err);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">


      <h1 className="text-5xl font-bold text-slate-900 mt-6">{t("register.title")}</h1>
      <p className="text-lg text-slate-600 mt-2">
        {t("register.subtitle")}
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-8 mt-10 w-full max-w-md"
      >
        <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
          {t("fields.username")}
        </label>
        <input
          id="username"
          type="text"
          name="username"
          placeholder={t("fields.usernamePlaceholder")}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
        />

        <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mt-4">
          {t("fields.name")}
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder={t("fields.namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
        />

        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mt-4">
          {t("fields.email")}
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder={t("fields.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
        />

        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mt-4">
          {t("fields.password")}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
        />

        {error && <p className="text-sm text-red-600 mt-4">{t(`errors.${error}`)}</p>}

        <button
          type="submit"
          className="w-full bg-blue-700 text-white font-semibold rounded-xl py-4 mt-8"
        >
          {t("register.submit")}
        </button>
      </form>

      <p className="text-sm text-slate-600 mt-8">
        {t("register.footer")}
      </p>
    </div>
  );
}

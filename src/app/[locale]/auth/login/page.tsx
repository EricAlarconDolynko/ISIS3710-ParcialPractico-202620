"use client";

import { useState, useReducer } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";
import { saveSession } from "@/services/session";
import { useTranslations } from "next-intl";


const fields = ["email", "password"] as const;   // arriba, junto a validate

type State = {
  email: string;
  password: string;
  errors: Record<string, string>;
};

type Action =
  | { type: "SET_FIELD"; field: keyof State; value: string }
  | { type: "SET_ERROR"; field: string; error: string };

const initialState: State = {
  email: "",
  password: "",
  errors: {},
};

function loginReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.field]: action.error },
      };
    default:
      return state;
  }
}


function validate(field: string, value: string): string {
  switch (field) {
    case "email":
      if (!value.trim()) return "required";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "invalidEmail";
    case "password":
      return value ? "" : "required";
    default:
      return "";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("Auth");
  const [state, dispatch] = useReducer(loginReducer, initialState);
  // const [email, setEmail] = useState("");
  // const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isValid = fields.every((field) => validate(field, state[field]) === "");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    dispatch({
      type: "SET_FIELD",
      field: e.target.name as keyof State,
      value: e.target.value,
    });
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    dispatch({ type: "SET_ERROR", field: name, error: validate(name, value) });
  }


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    let hasErrors = false;
    for (const field of fields) {
      const code = validate(field, state[field]);
      dispatch({ type: "SET_ERROR", field, error: code });
      if (code) hasErrors = true;
    }
    if (hasErrors) return;

    try {
      const user = await login(state.email, state.password);
      saveSession(user.id, user.userName);
      router.push("/plans");
    } catch (err) {
      setError("invalidCredentials");
      console.log(err);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
      <h1 className="text-5xl font-bold text-slate-900 mt-6">{t("login.title")}</h1>
      <p className="text-lg text-slate-600 mt-2">
        {t("login.subtitle")}
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-8 mt-10 w-full max-w-md"
      >
        <label className="block text-sm font-semibold text-slate-700 mt-4">
          {t("fields.email")}
        </label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder={t("fields.emailPlaceholder")}
          value={state.email}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
          onBlur={handleBlur}
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
        />
        {state.errors.email && (
          <p className="text-sm text-red-600 mt-1">{t(`errors.${state.errors.email}`)}</p>
        )}

        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mt-4">
          {t("fields.password")}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          placeholder="••••••••"
          value={state.password}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
          onBlur={handleBlur}
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
        />
        {state.errors.password && (
          <p className="text-sm text-red-600 mt-1">{t(`errors.${state.errors.password}`)}</p>
        )}

        {error && <p className="text-sm text-red-600 mt-4">{t(`errors.${error}`)}</p>}

        <button
          type="submit"
          disabled={!isValid}
          className="w-full bg-blue-700 text-white font-semibold rounded-xl py-4 mt-8 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {t("login.submit")}
        </button>
      </form>
    </div>
  );
}

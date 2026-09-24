'use client';

import { useState, useReducer } from "react";
import { useRouter } from "@/i18n/navigation";
import { getSession } from "@/services/session";
import { register } from "@/services/auth";
import { saveSession } from "@/services/session";
import { useTranslations } from "next-intl";

const fields = ["name", "foto", "descripcion"] as const;

type State = {
  foto: string;
  name: string;
  direccion: string;
  precio: number;
  duracion: number;
  descripcion: string;
  recomendacion: string;
  errors: Record<string, string>;
};

type Action =
  | { type: "SET_FIELD"; field: keyof State; value: string }
  | { type: "SET_ERROR"; field: string; error: string };

const initialState: State = {
  foto: "",
  name: "",
  direccion: "",
  precio: 0,
  duracion: 0,
  descripcion: "",
  recomendacion: "",
  errors: {},
};

function registerReducer(state: State, action: Action): State {
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
    case "username":
      if (!value.trim()) return "required";
      return /^[a-zA-Z0-9_]{3,20}$/.test(value) ? "" : "usernameFormat";
    case "name":
      if (!value.trim()) return "required";
      if (value.trim().length < 2) return "nameMin";
      return value.trim().length <= 50 ? "" : "nameMax";
    case "precio":
      if (!value.trim()) return "required";
      return Number(value) > 0 ? "" : "pricePositive";
    case "duracion":
      if (!value.trim()) return "required";
      return /^\d+$/.test(value.trim()) ? "" : "durationInteger";
    case "descripcion":
      return value.length < 600 ? "" : "descriptionMax";
    case "email":
      if (!value.trim()) return "required";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "invalidEmail";
    case "password":
      if (!value) return "required";
      return value.length >= 8 ? "" : "passwordMin";
    default:
      return "";
  }
}

function getValidationMessage(field: string, error: string): string {
  if (!error) return "";
  const messages: Record<string, string> = {
    name: "El nombre del plan no es válido.",
    precio: "El precio estimado no es válido.",
    duracion: "La duración no es válida.",
    descripcion: "La descripción no es válida.",
  };
  return messages[field] ?? "Este campo no es válido.";
}

export default function CreatePlanPage() {
    const router = useRouter();
    const [state, dispatch] = useReducer(registerReducer, initialState);
    const isValid = fields.every((field) => validate(field, state[field]) === ""); 
    const [error, setError] = useState("");

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
      const body = {
        name: state.name,
        description: state.descripcion,
        estimatedPrice: Number(state.precio),
        estimatedTime: Number(state.duracion),
        recomendations: state.recomendacion,
        address: state.direccion,
        image: state.foto,
        userId: getSession().id,

      };

      console.log("Request body:", body);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      console.log("Response status:", response);

      if (!response.ok) {
        throw new Error("No se pudo crear el plan");
      }
      router.push("/plans");
    } catch (err) {
      setError("Fallo el Registro");
      console.log(err);
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 py-10">
      <h1 className="text-5xl font-bold text-slate-900 mt-6">Crear plan</h1>
      <p className="text-lg text-slate-600 mt-2">Completa la información de tu plan</p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-8 mt-10 w-full max-w-2xl"
      >
        <label className="block text-sm font-semibold text-slate-700">
          Foto de portada del plan
        </label>
        <input
          id="foto"
          type="url"
          name="foto"
          placeholder="Link de la foto de portada"
          value={state.foto}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
        />


        <label className="block text-sm font-semibold text-slate-700 mt-4">
          Nombre del plan <span className="text-red-600">*</span>
        </label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Nombre del plan"
          value={state.name}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
        />
        {state.errors.name && <p className="text-sm text-red-600 mt-1">{state.errors.name}</p>}

        <label className="block text-sm font-semibold text-slate-700 mt-4">Dirección</label>
        <input
          id="direccion"
          type="text"
          name="direccion"
          placeholder="Dirección del plan"
          value={state.direccion}
          onChange={handleChange}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Precio estimado</label>
            <input
              id="precio"
              type="number"
              name="precio"
              min="0"
              placeholder="Precio estimado"
              value={state.precio}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
            />
            {state.errors.precio && <p className="text-sm text-red-600 mt-1">{getValidationMessage("precio", state.errors.precio)}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">Duración</label>
            <input
              id="duracion"
              type="number"
              name="duracion"
              min="1"
              placeholder="Duración en horas"
              value={state.duracion}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none"
            />
            {state.errors.duracion && <p className="text-sm text-red-600 mt-1">{getValidationMessage("duracion", state.errors.duracion)}</p>}
          </div>
        </div>

        <label className="block text-sm font-semibold text-slate-700 mt-4">Descripción del plan</label>
        <textarea
          id="descripcion"
          name="descripcion"
          placeholder="Describe el plan"
          value={state.descripcion}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "descripcion", value: e.target.value })}
          onBlur={(e) => dispatch({ type: "SET_ERROR", field: "descripcion", error: validate("descripcion", e.target.value) })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none min-h-28"
        />
        {state.errors.descripcion && <p className="text-sm text-red-600 mt-1">{getValidationMessage("descripcion", state.errors.descripcion)}</p>}

        <label className="block text-sm font-semibold text-slate-700 mt-4">Recomendaciones para los asistentes</label>
        <textarea
          id="recomendacion"
          name="recomendacion"
          placeholder="Escribe recomendaciones para los asistentes"
          value={state.recomendacion}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "recomendacion", value: e.target.value })}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mt-1 outline-none min-h-28"
        />

        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
        <button
          type="submit"
          disabled={!isValid}
          className="w-full bg-blue-700 text-white font-semibold rounded-xl py-4 mt-8 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Crear plan
        </button>
      </form>
    </div>
  );

}



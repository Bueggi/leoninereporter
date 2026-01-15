"use client";

import React, { useState } from "react";
import { PaperAirplaneIcon, ArrowPathIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function OfferGroupEditor({
  offerGroupId,
  setCampaign,
  campaign,
  element,
  initialUseIndividual = false,
  initialNumber = null,
}) {
  console.log(element)
  const router = useRouter();

  // State für Toggle und Input
  const [isEnabled, setIsEnabled] = useState(initialUseIndividual);
  const [inputValue, setInputValue] = useState(initialNumber?.toString() || "");

  // Loading State für Feedback beim Speichern
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/offergroup/${offerGroupId}/edit`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usesIndividualOfferNumber: isEnabled,
          // Wenn Input leer ist, senden wir null, sonst die Zahl
          individualOfferNumber: inputValue === "" ? null : inputValue,
        }),
      });

      if (!response.ok) {
        toast.error("Fehler");
        throw new Error("Update failed");
      }
      const data = await response.json();
      toast("Erfolgreich gespeichert");

      // Optional: Router refresh um Server Components zu aktualisieren
      router.refresh();
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
  
      toast.error("Fehler");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-white border border-slate-200 rounded-xl shadow-sm w-full transition-all hover:shadow-md">
      {/* --- LINKE SEITE: Toggle --- */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          disabled={isSaving}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
            isEnabled ? "bg-blue-600" : "bg-slate-200"
          } ${isSaving ? "opacity-50 cursor-wait" : ""}`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isEnabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium transition-colors ${
            isEnabled ? "text-slate-700" : "text-slate-400"
          }`}
        >
          {isEnabled ? "Individuelle Nr." : "Standard"}
        </span>
      </div>

      {/* --- RECHTE SEITE: Input & Button --- */}
      <div className="flex items-center gap-3">
        {/* Trennlinie */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <input
          type="text" // 'text' erlaubt bessere Kontrolle über Regex als 'number'
          maxLength={6}
          disabled={!isEnabled || isSaving}
          value={inputValue}
          onChange={(e) => {
            // Erlaubt nur Zahlen einzugeben
            const val = e.target.value;
            if (/^\d*$/.test(val)) setInputValue(val);
          }}
          placeholder="1001"
          className={`w-24 rounded-md border border-slate-300 py-1.5 px-2 text-center text-sm font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 transition-all ${
            isEnabled ? "bg-white" : "bg-slate-50"
          }`}
        />

        <div className="relative group">
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            // Button ist disabled wenn saving ODER (optional: wenn enabled aber input leer)
            // Hier lasse ich es zu, auch leer zu senden, wenn man will.
            className={`flex items-center justify-center p-2 rounded-lg transition-all active:scale-95 ${
              isEnabled && !isSaving
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="h-5 w-5 -ml-0.5 mt-0.5 -rotate-45" />
            )}
          </button>

          {/* Tooltip nur anzeigen, wenn NICHT geladen wird und Enabled ist */}
          {isEnabled && !isSaving && (
            <div className="absolute bottom-full right-0 mb-2 w-max px-2 py-1 bg-slate-800 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Speichern
              <div className="absolute top-full right-3 -mt-[1px] border-4 border-transparent border-t-slate-800" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

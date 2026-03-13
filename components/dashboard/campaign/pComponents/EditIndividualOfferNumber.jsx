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
  initialPricingModel = "TKP",
}) {
  console.log(element)
  const router = useRouter();

  // State für Toggle und Input
  const [isEnabled, setIsEnabled] = useState(initialUseIndividual);
  const [inputValue, setInputValue] = useState(initialNumber?.toString() || "");
  const [pricingModel, setPricingModel] = useState(initialPricingModel);

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
          pricingModel: pricingModel,
        }),
      });

      if (!response.ok) {
        toast.error("Fehler");
        throw new Error("Update failed");
      }
      const data = await response.json();
      toast("Erfolgreich gespeichert");
      
      // Update local state so that PDF gets the new number immediately
      setCampaign((prev) => {
        if (!prev || !prev.offers) return prev;
        return {
          ...prev,
          offers: prev.offers.map(group => 
            group.id === offerGroupId 
              ? { 
                  ...group, 
                  usesIndividualOfferNumber: data.usesIndividualOfferNumber, 
                  individualOfferNumber: data.individualOfferNumber,
                  pricingModel: data.pricingModel 
                } 
              : group
          )
        };
      });
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
  
      toast.error("Fehler");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePricingModelChange = async (newModel) => {
    // Optimistic UI update
    setPricingModel(newModel);
    setIsSaving(true);
    
    try {
      const response = await fetch(`/api/offergroup/${offerGroupId}/edit`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usesIndividualOfferNumber: isEnabled,
          individualOfferNumber: inputValue === "" ? null : inputValue,
          pricingModel: newModel,
        }),
      });

      if (!response.ok) throw new Error("Update failed");
      const data = await response.json();
      toast.success("Abrechnungsmodell gespeichert");

      setCampaign((prev) => {
        if (!prev || !prev.offers) return prev;
        return {
          ...prev,
          offers: prev.offers.map(group => 
            group.id === offerGroupId ? { ...group, pricingModel: data.pricingModel } : group
          )
        };
      });
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      toast.error("Fehler beim Speichern");
      setPricingModel(pricingModel); // Revert on error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* --- Pricing Model Selector (Separated visually) --- */}
      <div className="flex items-center justify-between gap-4 p-3 bg-white border border-slate-200 rounded-xl shadow-sm w-full transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-700">Abrechnungsmodell</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg relative">
          <button
            onClick={() => handlePricingModelChange("TKP")}
            disabled={isSaving}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              pricingModel === "TKP" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            TKP
          </button>
          <button
            onClick={() => handlePricingModelChange("CPCV")}
            disabled={isSaving}
            className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
              pricingModel === "CPCV" 
                ? "bg-indigo-600 text-white shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200"
            } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            CPCV
          </button>
        </div>
      </div>

      {/* --- OfferNumber Config --- */}
      <div className="flex items-center justify-between gap-4 p-3 bg-white border border-slate-200 rounded-xl shadow-sm w-full transition-all hover:shadow-md">
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

        <div className="flex items-center gap-3">
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          <input
            type="text"
            maxLength={6}
            disabled={!isEnabled || isSaving}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
            }}
            placeholder="A1001"
            className={`w-24 rounded-md border border-slate-300 py-1.5 px-2 text-center text-sm font-mono shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300 transition-all ${
              isEnabled ? "bg-white" : "bg-slate-50"
            }`}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-1">
        <button
          onClick={handleSubmit}
          disabled={isSaving || (isEnabled === initialUseIndividual && inputValue === (initialNumber?.toString() || ""))}
          className={`flex items-center justify-center px-4 py-2 rounded-lg transition-all active:scale-95 text-sm font-semibold shadow-sm ${
            !isSaving && (isEnabled !== initialUseIndividual || inputValue !== (initialNumber?.toString() || ""))
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
          }`}
        >
          {isSaving ? (
            <div className="flex gap-2 items-center">
              <ArrowPathIcon className="h-4 w-4 animate-spin" /> 
              Speichern...
            </div>
          ) : (
            "Änderungen speichern"
          )}
        </button>
      </div>
    </div>
  );
}

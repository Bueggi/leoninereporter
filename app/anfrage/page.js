"use client";

import React, { useState } from "react";
import Image from "next/image";

const PRODUCTS = {
  nonskippable: { key: "nonskippable", name: "Non-Skippable", price: 15, model: "TKP", upcharge: 1.5, icon: "🎬", desc: "Ihr Spot wird vollständig ausgespielt – keine Möglichkeit zum Überspringen. Ideal für Branding und Storytelling bis zu 30 Sek." },
  skippable: { key: "skippable", name: "Skippable", price: 13.5, model: "TKP", upcharge: 1.5, icon: "⏭️", desc: "Nach 5 Sekunden überspringbar. Nutzer, die bleiben, sind besonders interessiert – große Reichweite zum effizienten Preis." },
  bumper: { key: "bumper", name: "Bumper Ad", price: 11, model: "TKP", upcharge: 1.5, icon: "⚡", desc: "6-Sekunden-Format, nicht überspringbar. Maximale Aufmerksamkeit in kürzester Zeit – perfekt für Reminder-Kampagnen." },
  cpcv: { key: "cpcv", name: "Completed View", price: 19, model: "CPCV", upcharge: 2, icon: "✅", desc: "Sie zahlen nur für vollständig abgespielte Videos. Maximale Kostenkontrolle – ideal für Performance-orientierte Kampagnen." },
};

const TOTAL_STEPS = 5;

export default function CampaignRequestPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProductKey, setSelectedProductKey] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    advertiser: "",
    product: "",
    budget: "",
    dateStart: "",
    dateEnd: "",
    reach: "",
    notes: "",
    targetMarket: "",
    firstname: "",
    lastname: "",
    company: "",
    email: "",
    phone: "",
    privacy: false
  });
  
  // Array Selections
  const [selections, setSelections] = useState({
    age: [],
    gender: [],
    genre: [],
    inventory: []
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goalType, setGoalType] = useState('budget'); // 'budget' or 'reach'

  const selectedProduct = selectedProductKey ? PRODUCTS[selectedProductKey] : null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    // Clear error on change
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const toggleSelection = (group, value, single = false) => {
    setSelections(prev => {
      if (single) {
        return { ...prev, [group]: [value] };
      }
      const current = prev[group];
      if (current.includes(value)) {
        return { ...prev, [group]: current.filter(v => v !== value) };
      } else {
        return { ...prev, [group]: [...current, value] };
      }
    });
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!selectedProductKey) errors.product = "Bitte wählen Sie ein Format.";
    } else if (step === 2) {
      if (!formData.advertiser.trim()) errors.advertiser = true;
      if (!formData.product.trim()) errors.product = true;
      if (goalType === 'budget' && (!formData.budget || Number(formData.budget) < 500)) errors.budget = true;
      if (goalType === 'reach' && (!formData.reach || Number(formData.reach) < 1000)) errors.reach = true;
      
      const start = formData.dateStart;
      const end = formData.dateEnd;
      if (!start || !end || start >= end) errors.dates = true;
    } else if (step === 4) {
      if (!formData.firstname.trim()) errors.firstname = true;
      if (!formData.lastname.trim()) errors.lastname = true;
      if (!formData.company.trim()) errors.company = true;
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = true;
      if (!formData.privacy) errors.privacy = true;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goPrev = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitForm = async () => {
    if (validateStep(5)) {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/campaign/inbound", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             formData,
             selections,
             product: selectedProduct,
             goalType
          }),
        });
        if (res.ok) {
           setIsSubmitted(true);
           window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
           console.error("Submission failed");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const fmt = (n) => typeof n === 'number' ? n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : n;
  const fmtDate = (d) => {
    if (!d) return '–';
    const [y, m, day] = d.split('-');
    return `${day}.${m}.${y}`;
  };

  const estimateImpressions = () => {
    if (!selectedProduct || !formData.budget) return '–';
    const b = Number(formData.budget);
    if (b <= 0) return '–';
    const price = selectedProduct.price + selectedProduct.upcharge;
    const amount = Math.round((b / price) * 1000);
    return amount.toLocaleString('de-DE') + (selectedProduct.model === 'TKP' ? ' Impressionen' : ' Completed Views');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F0EBE0] font-sans overflow-x-hidden flex flex-col items-center relative pb-20">
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: #8B6E2E;
          --gold-glow: rgba(201, 168, 76, 0.18);
        }
        .bg-ambient::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(201,168,76,0.12) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 90% 80%, rgba(201,168,76,0.06) 0%, transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(0.8) sepia(1) hue-rotate(5deg);
          cursor: pointer;
        }
      `}} />

      <div className="bg-ambient absolute inset-0"></div>

      <div className="w-full max-w-[820px] px-6 pt-16 z-10 mx-auto">
        
        {/* Header */}
        <header className="flex flex-col items-center gap-6 mb-14">
          <div className="h-[46px] relative w-[250px]">
            <Image 
              src="/HoTLogo_White.png" 
              alt="House of Tales" 
              fill
              className="object-contain"
            />
          </div>
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent"></div>
          <h1 className="text-[clamp(1.6rem,4vw,2.4rem)] font-bold text-center tracking-tight leading-tight">
            Ihre <span className="bg-gradient-to-br from-[#E8C97A] via-[#C9A84C] to-[#8B6E2E] bg-clip-text text-transparent">Kampagnenanfrage</span>
          </h1>
          <p className="text-[0.95rem] text-[#8A8070] text-center max-w-[500px] leading-relaxed">
            In wenigen Schritten zur maßgeschneiderten Video-Kampagne – wir begleiten Sie durch den Prozess.
          </p>
        </header>

        {/* Progress Nav */}
        {!isSubmitted && (
          <nav className="mb-12 flex justify-center w-full px-2" aria-label="Schritte">
            <div className="flex items-center w-full max-w-[600px] justify-between">
              {[1, 2, 3, 4, 5].map((step, idx) => {
                const isActive = step === currentStep;
                const isPast = step < currentStep;
                
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-2 relative z-10 w-12 shrink-0">
                      <div className={`
                        w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all duration-300
                        ${isPast ? 'border-[#C9A84C] bg-[#C9A84C] text-[#0A0A0A]' : 
                          isActive ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.18)] text-[#C9A84C] shadow-[0_0_0_4px_rgba(201,168,76,0.1)]' : 
                          'border-[rgba(201,168,76,0.22)] bg-[#111111] text-[#8A8070]'}
                      `}>
                        {isPast ? '✓' : step}
                      </div>
                      <span className={`text-[0.68rem] font-medium tracking-wider uppercase whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-[#C9A84C]' : isPast ? 'text-[#8B6E2E]' : 'text-[#8A8070]'}`}>
                        {['Format', 'Kampagne', 'Targeting', 'Kontakt', 'Übersicht'][idx]}
                      </span>
                    </div>
                    {idx < 4 && (
                      <div className={`flex-1 h-[1px] mx-2 mb-6 min-w-[16px] transition-colors duration-400 ${isPast ? 'bg-[#8B6E2E]' : 'bg-[rgba(201,168,76,0.22)]'}`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </nav>
        )}

        {/* Card */}
        <div className="bg-[#111111] border border-[rgba(201,168,76,0.22)] rounded-[14px] p-6 sm:p-11 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent"></div>

          {isSubmitted ? (
            <div className="flex flex-col items-center text-center gap-4 py-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-16 h-16 rounded-full bg-[rgba(201,168,76,0.18)] border-2 border-[#C9A84C] flex items-center justify-center text-3xl mb-2 text-[#C9A84C]">✉</div>
              <h2 className="text-2xl font-bold">Anfrage eingegangen!</h2>
              <p className="text-[0.9rem] text-[#8A8070] max-w-[400px] leading-relaxed">
                Vielen Dank für Ihre Kampagnenanfrage. Unser Team meldet sich in der Regel innerhalb von 1–2 Werktagen bei Ihnen.
              </p>
              <p className="text-[0.9rem] text-[#8A8070] mt-2">
                Bei dringenden Fragen erreichen Sie uns unter <a href="mailto:info@homeoftalents.de" className="text-[#C9A84C] hover:underline">info@homeoftalents.de</a>.
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">

              {/* Step 1 */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-xl font-bold mb-1.5 tracking-tight">Welches Videoformat passt zu Ihnen?</h2>
                  <p className="text-sm text-[#8A8070] mb-8 leading-relaxed">Jedes Format hat seine Stärken. Wählen Sie das Format, das am besten zu Ihrer Botschaft passt – oder fragen Sie uns, wir beraten Sie gern.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
                    {Object.values(PRODUCTS).map(p => (
                      <div 
                        key={p.key} 
                        onClick={() => { setSelectedProductKey(p.key); setValidationErrors(prev => ({...prev, product: null})) }}
                        className={`bg-[#1A1A1A] border-2 rounded-lg p-5 cursor-pointer transition-all duration-200 select-none relative group ${selectedProductKey === p.key ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.1)]' : 'border-[rgba(201,168,76,0.22)] hover:border-[rgba(201,168,76,0.5)] hover:bg-[#222222] hover:-translate-y-0.5'}`}
                      >
                        {selectedProductKey === p.key && <div className="absolute top-2.5 right-3.5 text-xs text-[#C9A84C] font-bold">✓</div>}
                        <span className="text-3xl mb-2.5 block">{p.icon}</span>
                        <div className="text-[0.95rem] font-bold mb-1">{p.name}</div>
                        <div className="text-xs text-[#8A8070] leading-relaxed">{p.desc}</div>
                      </div>
                    ))}
                  </div>



                  <div className="flex justify-between items-center mt-9">
                    <span></span>
                    <button onClick={goNext} disabled={!selectedProductKey} className="border-none rounded-lg font-sans text-[0.875rem] font-semibold px-6 py-3 cursor-pointer transition-all duration-200 tracking-wide bg-gradient-to-br from-[#E8C97A] to-[#C9A84C] text-[#0A0A0A] shadow-[0_4px_18px_rgba(201,168,76,0.3)] hover:shadow-[0_6px_24px_rgba(201,168,76,0.45)] hover:-translate-y-[1px] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
                      Weiter →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-xl font-bold mb-1.5 tracking-tight">Kampagnendaten</h2>
                  <p className="text-sm text-[#8A8070] mb-8 leading-relaxed">Erzählen Sie uns mehr über Ihr Produkt und den geplanten Einsatz.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Advertiser / Marke <span className="text-[#C9A84C] ml-0.5">*</span></label>
                      <input type="text" name="advertiser" value={formData.advertiser} onChange={handleChange} placeholder="z. B. ACME GmbH" className={`bg-[#1A1A1A] border rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all w-full focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)] placeholder:text-[#8A8070] placeholder:opacity-60 ${validationErrors.advertiser ? 'border-[#e05a5a]' : 'border-[rgba(201,168,76,0.22)]'}`} />
                      {validationErrors.advertiser && <span className="text-[0.72rem] text-[#e05a5a]">Bitte geben Sie den Advertiser an.</span>}
                    </div>

                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Beworbenes Produkt <span className="text-[#C9A84C] ml-0.5">*</span></label>
                      <input type="text" name="product" value={formData.product} onChange={handleChange} placeholder="z. B. Sommerkampagne 2025" className={`bg-[#1A1A1A] border rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all w-full focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)] placeholder:text-[#8A8070] placeholder:opacity-60 ${validationErrors.product ? 'border-[#e05a5a]' : 'border-[rgba(201,168,76,0.22)]'}`} />
                      {validationErrors.product && <span className="text-[0.72rem] text-[#e05a5a]">Bitte geben Sie das Produkt an.</span>}
                    </div>

                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-2 mt-2 border-t border-[rgba(201,168,76,0.1)] pt-4">
                      <div className="flex bg-[#1A1A1A] p-1 rounded-lg border border-[rgba(201,168,76,0.22)] w-fit mb-3">
                        <button type="button" onClick={() => { setGoalType('budget'); setFormData(prev => ({...prev, reach: ""})); setValidationErrors(prev => ({...prev, budget: null, reach: null})); }} className={`px-4 py-1.5 text-[0.8rem] font-semibold rounded-md transition-all ${goalType === 'budget' ? 'bg-[rgba(201,168,76,0.18)] text-[#C9A84C]' : 'text-[#8A8070] hover:text-[#F0EBE0]'}`}>Festes Budget</button>
                        <button type="button" onClick={() => { setGoalType('reach'); setFormData(prev => ({...prev, budget: ""})); setValidationErrors(prev => ({...prev, budget: null, reach: null})); }} className={`px-4 py-1.5 text-[0.8rem] font-semibold rounded-md transition-all ${goalType === 'reach' ? 'bg-[rgba(201,168,76,0.18)] text-[#C9A84C]' : 'text-[#8A8070] hover:text-[#F0EBE0]'}`}>Ziel-Reichweite</button>
                      </div>

                      {goalType === 'budget' && (
                        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Geplantes Budget <span className="text-[#C9A84C] ml-0.5">*</span></label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A8070] text-[0.9rem]">€</span>
                            <input type="number" name="budget" value={formData.budget} onChange={handleChange} placeholder="5000" min="500" className={`bg-[#1A1A1A] border rounded-lg text-[#F0EBE0] text-[0.9rem] py-2.5 pr-3.5 pl-8 outline-none transition-all w-full focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)] placeholder:text-[#8A8070] placeholder:opacity-60 ${validationErrors.budget ? 'border-[#e05a5a]' : 'border-[rgba(201,168,76,0.22)]'}`} />
                          </div>
                          <span className="text-[0.72rem] text-[#8A8070] mt-0.5">Netto, in Euro. Mindestbuchung ab 500 €.</span>
                        </div>
                      )}

                      {goalType === 'reach' && (
                        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Gewünschte Reichweite <span className="text-[#C9A84C] ml-0.5">*</span></label>
                          <input type="number" name="reach" value={formData.reach} onChange={handleChange} placeholder="500000" min="1000" className={`bg-[#1A1A1A] border rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all w-full focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)] placeholder:text-[#8A8070] placeholder:opacity-60 ${validationErrors.reach ? 'border-[#e05a5a]' : 'border-[rgba(201,168,76,0.22)]'}`} />
                          <span className="text-[0.72rem] text-[#8A8070] mt-0.5">Anzahl der Impressionen bzw. Views.</span>
                        </div>
                      )}
                    </div>

                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Geplante Laufzeit <span className="text-[#C9A84C] ml-0.5">*</span></label>
                      <div className="flex items-center gap-2.5">
                        <input type="date" name="dateStart" value={formData.dateStart} onChange={handleChange} className={`flex-1 bg-[#1A1A1A] border rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)] ${validationErrors.dates ? 'border-[#e05a5a]' : 'border-[rgba(201,168,76,0.22)]'}`} />
                        <span className="text-[#8A8070] text-[0.85rem] shrink-0">bis</span>
                        <input type="date" name="dateEnd" value={formData.dateEnd} onChange={handleChange} className={`flex-1 bg-[#1A1A1A] border rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)] ${validationErrors.dates ? 'border-[#e05a5a]' : 'border-[rgba(201,168,76,0.22)]'}`} />
                      </div>
                      {validationErrors.dates && <span className="text-[0.72rem] text-[#e05a5a]">Bitte geben Sie einen gültigen Zeitraum an.</span>}
                    </div>



                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Weitere Informationen</label>
                      <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Ziele, Wünsche …" rows="3" className="bg-[#1A1A1A] border border-[rgba(201,168,76,0.22)] rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all w-full resize-y min-h-[90px] focus:border-[#C9A84C] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.12)] placeholder:text-[#8A8070] placeholder:opacity-60"></textarea>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-9 gap-3">
                    <button onClick={goPrev} className="bg-transparent border border-[rgba(201,168,76,0.22)] text-[#8A8070] rounded-lg text-[0.875rem] font-semibold px-6 py-3 hover:border-[rgba(201,168,76,0.4)] hover:text-[#F0EBE0] transition-all">← Zurück</button>
                    <button onClick={goNext} className="bg-gradient-to-br from-[#E8C97A] to-[#C9A84C] text-[#0A0A0A] rounded-lg text-[0.875rem] font-semibold px-6 py-3 shadow-[0_4px_18px_rgba(201,168,76,0.3)] hover:shadow-[0_6px_24px_rgba(201,168,76,0.45)] hover:-translate-y-[1px] transition-all">Weiter →</button>
                  </div>
                </div>
              )}

              {/* Step 3 */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-xl font-bold mb-1.5 tracking-tight">Targeting-Präferenzen</h2>
                  <p className="text-sm text-[#8A8070] mb-8 leading-relaxed">Geben Sie an, welche Zielgruppe Sie ansprechen möchten. Optional.</p>

                  <div className="grid grid-cols-1 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Zielmarkt</label>
                      <select name="targetMarket" value={formData.targetMarket} onChange={handleChange} className="bg-[#1A1A1A] border border-[rgba(201,168,76,0.22)] rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all w-full focus:border-[#C9A84C] appearance-none cursor-pointer">
                        <option value="">Bitte wählen …</option>
                        <option value="de">Deutschland</option>
                        <option value="at">Österreich</option>
                        <option value="ch">Schweiz</option>
                        <option value="dach">DACH (D/A/CH)</option>
                      </select>
                    </div>

                    {[
                      { id: 'age', label: 'Altersgruppe', multi: true, opts: ['14-19', '20-29', '30-39', '40-49', '50-59', '60+'] },
                      { id: 'gender', label: 'Geschlecht', multi: false, opts: ['Alle', 'Männlich', 'Weiblich', 'Divers'] },
                      { id: 'genre', label: 'Umfelder', multi: true, opts: ['Action', 'Drama', 'Komödie', 'Doku', 'Thriller', 'Familie', 'Sport'] },
                      { id: 'inventory', label: 'Inventar', multi: true, opts: ['CTV', 'Mobile', 'Desktop', 'Alle'] }
                    ].map(group => (
                      <div key={group.id} className="flex flex-col gap-1.5">
                        <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">{group.label}</label>
                        <div className="flex flex-wrap gap-2">
                          {group.opts.map(opt => {
                            const isOn = selections[group.id].includes(opt);
                            return (
                              <button 
                                key={opt}
                                onClick={() => toggleSelection(group.id, opt, !group.multi)}
                                className={`px-3.5 py-1.5 rounded-full border text-[0.78rem] font-medium transition-all select-none ${isOn ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.18)] text-[#C9A84C]' : 'border-[rgba(201,168,76,0.22)] bg-[#1A1A1A] text-[#8A8070] hover:border-[rgba(201,168,76,0.4)] hover:text-[#F0EBE0]'}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-9 gap-3">
                    <button onClick={goPrev} className="bg-transparent border border-[rgba(201,168,76,0.22)] text-[#8A8070] rounded-lg text-[0.875rem] font-semibold px-6 py-3 hover:border-[rgba(201,168,76,0.4)] hover:text-[#F0EBE0] transition-all">← Zurück</button>
                    <button onClick={goNext} className="bg-gradient-to-br from-[#E8C97A] to-[#C9A84C] text-[#0A0A0A] rounded-lg text-[0.875rem] font-semibold px-6 py-3 shadow-[0_4px_18px_rgba(201,168,76,0.3)] hover:shadow-[0_6px_24px_rgba(201,168,76,0.45)] hover:-translate-y-[1px] transition-all">Weiter →</button>
                  </div>
                </div>
              )}

              {/* Step 4 */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-xl font-bold mb-1.5 tracking-tight">Ihre Kontaktdaten</h2>
                  <p className="text-sm text-[#8A8070] mb-8 leading-relaxed">Damit wir Ihre Anfrage persönlich bearbeiten können.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Vorname <span className="text-[#C9A84C] ml-0.5">*</span></label>
                      <input type="text" name="firstname" value={formData.firstname} onChange={handleChange} className={`bg-[#1A1A1A] border rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all ${validationErrors.firstname ? 'border-[#e05a5a]' : 'border-[rgba(201,168,76,0.22)] focus:border-[#C9A84C]'}`} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Nachname <span className="text-[#C9A84C] ml-0.5">*</span></label>
                      <input type="text" name="lastname" value={formData.lastname} onChange={handleChange} className={`bg-[#1A1A1A] border rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all ${validationErrors.lastname ? 'border-[#e05a5a]' : 'border-[rgba(201,168,76,0.22)] focus:border-[#C9A84C]'}`} />
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Unternehmen <span className="text-[#C9A84C] ml-0.5">*</span></label>
                      <input type="text" name="company" value={formData.company} onChange={handleChange} className={`bg-[#1A1A1A] border rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all ${validationErrors.company ? 'border-[#e05a5a]' : 'border-[rgba(201,168,76,0.22)] focus:border-[#C9A84C]'}`} />
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">E-Mail <span className="text-[#C9A84C] ml-0.5">*</span></label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className={`bg-[#1A1A1A] border rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none transition-all ${validationErrors.email ? 'border-[#e05a5a]' : 'border-[rgba(201,168,76,0.22)] focus:border-[#C9A84C]'}`} />
                    </div>
                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                      <label className="text-[0.78rem] font-semibold tracking-wider uppercase text-[#8A8070]">Telefon</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="bg-[#1A1A1A] border border-[rgba(201,168,76,0.22)] rounded-lg text-[#F0EBE0] text-[0.9rem] px-3.5 py-2.5 outline-none focus:border-[#C9A84C] transition-all" />
                    </div>
                    
                    <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5 mt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" name="privacy" checked={formData.privacy} onChange={handleChange} className="w-4 h-4 mt-0.5 shrink-0 accent-[#C9A84C]" />
                        <span className="text-[#8A8070] text-[0.8rem] leading-relaxed">
                          Ich habe die <a href="#" className="text-[#C9A84C] underline">Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten zu.
                        </span>
                      </label>
                      {validationErrors.privacy && <span className="text-[0.72rem] text-[#e05a5a]">Pflichtfeld</span>}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-9 gap-3">
                    <button onClick={goPrev} className="bg-transparent border border-[rgba(201,168,76,0.22)] text-[#8A8070] rounded-lg text-[0.875rem] font-semibold px-6 py-3 hover:border-[rgba(201,168,76,0.4)] hover:text-[#F0EBE0] transition-all">← Zurück</button>
                    <button onClick={goNext} className="bg-gradient-to-br from-[#E8C97A] to-[#C9A84C] text-[#0A0A0A] rounded-lg text-[0.875rem] font-semibold px-6 py-3 shadow-[0_4px_18px_rgba(201,168,76,0.3)] hover:shadow-[0_6px_24px_rgba(201,168,76,0.45)] hover:-translate-y-[1px] transition-all">Zur Übersicht →</button>
                  </div>
                </div>
              )}

              {/* Step 5 */}
              {currentStep === 5 && selectedProduct && (
                <div>
                  <h2 className="text-xl font-bold mb-1.5 tracking-tight">Zusammenfassung</h2>
                  <p className="text-sm text-[#8A8070] mb-6 leading-relaxed">Bitte überprüfen Sie Ihre Angaben.</p>

                  <div className="space-y-4">
                    {/* Block 1 */}
                    <div className="bg-[#1A1A1A] border border-[rgba(201,168,76,0.22)] rounded-lg p-5">
                      <div className="text-[0.7rem] font-bold tracking-widest uppercase text-[#8B6E2E] mb-3">Format & Preismodell</div>
                      <div className="flex flex-col gap-2.5 text-[0.875rem]">
                        <div className="flex justify-between"><span className="text-[#8A8070]">Format</span><span className="font-semibold text-right">{selectedProduct.name}</span></div>
                      </div>
                    </div>

                    {/* Block 2 */}
                    <div className="bg-[#1A1A1A] border border-[rgba(201,168,76,0.22)] rounded-lg p-5">
                      <div className="text-[0.7rem] font-bold tracking-widest uppercase text-[#8B6E2E] mb-3">Kampagnendaten</div>
                      <div className="flex flex-col gap-2.5 text-[0.875rem]">
                        <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-[#8A8070]">Advertiser</span><span className="font-semibold text-right break-all">{formData.advertiser}</span></div>
                        <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-[#8A8070]">Produkt</span><span className="font-semibold text-right break-all">{formData.product}</span></div>
                        {goalType === 'budget' && <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-[#8A8070]">Budget</span><span className="font-semibold text-right">€ {Number(formData.budget).toLocaleString('de-DE')}</span></div>}
                        {goalType === 'reach' && <div className="flex justify-between border-b border-white/5 pb-2"><span className="text-[#8A8070]">Reichweite</span><span className="font-semibold text-right">{Number(formData.reach).toLocaleString('de-DE')} {selectedProduct?.model === 'TKP' ? 'Impressionen' : 'Views'}</span></div>}
                        <div className="flex justify-between pb-2"><span className="text-[#8A8070]">Laufzeit</span><span className="font-semibold text-right">{fmtDate(formData.dateStart)} – {fmtDate(formData.dateEnd)}</span></div>
                      </div>
                    </div>


                  </div>

                  <div className="flex justify-between items-center mt-9 gap-3">
                    <button onClick={goPrev} className="bg-transparent border border-[rgba(201,168,76,0.22)] text-[#8A8070] rounded-lg text-[0.875rem] font-semibold px-6 py-3 hover:border-[rgba(201,168,76,0.4)] hover:text-[#F0EBE0] transition-all">← Zurück</button>
                    <button onClick={submitForm} disabled={isSubmitting} className="bg-gradient-to-br from-[#E8C97A] to-[#C9A84C] text-[#0A0A0A] rounded-lg text-[0.875rem] font-semibold px-6 py-3 shadow-[0_4px_18px_rgba(201,168,76,0.3)] hover:shadow-[0_6px_24px_rgba(201,168,76,0.45)] hover:-translate-y-[1px] transition-all disabled:opacity-50">
                      {isSubmitting ? "Wird gesendet..." : "Anfrage absenden ✉"}
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

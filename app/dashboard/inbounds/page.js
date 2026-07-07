"use client";

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { 
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";
import moment from "moment";
import "moment/locale/de";

moment.locale("de");

export default function InboundsPage() {
  const [inbounds, setInbounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedInbound, setSelectedInbound] = useState(null);
  const [calcTkp, setCalcTkp] = useState(15.0);

  useEffect(() => {
    if (selectedInbound) {
      const p = selectedInbound.product.toLowerCase();
      if (p.includes("non-skippable")) setCalcTkp(15.0);
      else if (p.includes("skippable")) setCalcTkp(13.5);
      else if (p.includes("bumper")) setCalcTkp(11.0);
      else if (p.includes("completed")) setCalcTkp(19.0);
      else setCalcTkp(15.0);
    }
  }, [selectedInbound]);

  const parseNotes = (notes) => {
    if (!notes) return [];
    return notes.split('===').filter(s => s.trim().length > 0).reduce((acc, curr, i, arr) => {
      if (i % 2 === 0) {
        acc.push({ title: curr.trim(), content: arr[i+1]?.trim() || "" });
      }
      return acc;
    }, []);
  };

  const fetchInbounds = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inbounds/list");
      const json = await res.json();
      if (json.success) {
        setInbounds(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbounds();
  }, []);

  const convertToCampaign = async (id) => {
    if (!confirm("Lead in Angebot / Kampagne umwandeln? Sie wird danach in das normale Kampagnen-Dashboard verschoben.")) return;
    setConvertingId(id);
    try {
      const res = await fetch("/api/inbounds/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        // Reload list
        await fetchInbounds();
        alert("Erfolgreich in Kampagne umgewandelt!");
      } else {
        alert("Fehler: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Ein Fehler ist aufgetreten.");
    } finally {
      setConvertingId(null);
    }
  };

  const deleteInbound = async (id) => {
    if (!confirm("Diesen Lead wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/inbounds/delete?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        await fetchInbounds();
        setSelectedInbound(null);
      } else {
        alert("Fehler: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Ein Fehler ist aufgetreten.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'NEW') return <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-bold text-blue-700 uppercase">NEU</span>;
    if (status === 'CONVERTED') return <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700 uppercase">UMGEWANDELT</span>;
    return <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700 uppercase">{status}</span>;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">
            Inbound Anfragen
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Hier landen alle neuen Kampagnen-Anfragen aus dem Kontaktformular. Du kannst sie nach Durchsicht in echte Kampagnen umwandeln.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={fetchInbounds}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Aktualisieren
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Advertiser / Produkt</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Kontakt</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Budget / Reichweite</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Laufzeit</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Eingang</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Aktionen</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">Lade Anfragen...</td>
                    </tr>
                  )}
                  
                  {!loading && inbounds.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">Bisher keine Anfragen vorhanden.</td>
                    </tr>
                  )}

                  {inbounds.map((inbound) => (
                    <tr key={inbound.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-gray-900">{inbound.advertiser}</div>
                        <div className="text-gray-500">{inbound.product}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="text-gray-900">{inbound.firstname} {inbound.lastname}</div>
                        <div className="text-gray-500">{inbound.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {inbound.goalType === 'budget' ? (
                          <div className="text-gray-900 font-medium">Budget: € {Number(inbound.budget).toLocaleString('de-DE')}</div>
                        ) : (
                          <div className="text-gray-900 font-medium">Reichweite: {Number(inbound.reach).toLocaleString('de-DE')}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {inbound.dateStart ? moment(inbound.dateStart).format("DD.MM.YY") : "-"} bis<br/>
                        {inbound.dateEnd ? moment(inbound.dateEnd).format("DD.MM.YY") : "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {getStatusBadge(inbound.status)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {moment(inbound.createdAt).fromNow()}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-3">
                        <button
                          onClick={() => setSelectedInbound(inbound)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Details
                        </button>
                        
                        {inbound.status === 'NEW' && (
                          <button
                            onClick={() => convertToCampaign(inbound.id)}
                            disabled={convertingId === inbound.id}
                            className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                          >
                            {convertingId === inbound.id ? "Umwandeln..." : "Umwandeln"}
                          </button>
                        )}
                        {inbound.status === 'CONVERTED' && (
                          <span className="text-gray-400">Erledigt</span>
                        )}

                        <button
                          onClick={() => deleteInbound(inbound.id)}
                          disabled={deletingId === inbound.id}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          {deletingId === inbound.id ? "..." : "Löschen"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Transition.Root show={!!selectedInbound} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setSelectedInbound(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-[800px]">
                  {selectedInbound && (
                    <>
                      {/* Header */}
                      <div className="relative bg-slate-900 px-6 py-8 sm:px-10 overflow-hidden">
                        {/* Subtle background glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C9A84C] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                        <div className="absolute right-4 top-4">
                          <button
                            type="button"
                            className="rounded-full bg-white/10 p-2 text-gray-300 hover:text-white hover:bg-white/20 transition-colors outline-none"
                            onClick={() => setSelectedInbound(null)}
                          >
                            <span className="sr-only">Schließen</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#C9A84C]/20 border border-[#C9A84C]/30 text-[#C9A84C] text-[0.65rem] font-bold uppercase tracking-wider">
                            Inbound Lead
                          </span>
                          <span className="text-gray-400 text-xs">{moment(selectedInbound.createdAt).format("DD.MM.YYYY HH:mm")}</span>
                        </div>
                        <Dialog.Title as="h3" className="text-3xl font-extrabold leading-tight text-white mb-1">
                          {selectedInbound.advertiser}
                        </Dialog.Title>
                        <p className="text-lg text-gray-300 font-medium">
                          {selectedInbound.product}
                        </p>
                      </div>

                      <div className="px-6 py-8 sm:px-10 bg-gray-50/50">
                        
                        {/* Top 3 Cards (Contact, Goal, Dates) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                          {/* Card 1: Contact */}
                          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-gray-400">
                              <UserCircleIcon className="w-5 h-5"/>
                              <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">Kontakt</h4>
                            </div>
                            <div className="text-sm">
                              <p className="font-semibold text-gray-900 text-base mb-1">{selectedInbound.firstname} {selectedInbound.lastname}</p>
                              <p className="text-gray-600 flex items-center gap-2 font-medium"><BuildingOfficeIcon className="w-3.5 h-3.5"/> {selectedInbound.company}</p>
                              <div className="mt-3 space-y-1.5">
                                <a href={`mailto:${selectedInbound.email}`} className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 font-medium truncate"><EnvelopeIcon className="w-3.5 h-3.5 flex-shrink-0"/> {selectedInbound.email}</a>
                                {selectedInbound.phone && <p className="text-gray-600 flex items-center gap-2"><PhoneIcon className="w-3.5 h-3.5"/> {selectedInbound.phone}</p>}
                              </div>
                            </div>
                          </div>

                          {/* Card 2: Goal */}
                          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-indigo-50 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                            <div className="flex items-center gap-2 mb-3 text-gray-400">
                              {selectedInbound.goalType === 'budget' ? <BanknotesIcon className="w-5 h-5 text-emerald-500"/> : <ChartBarIcon className="w-5 h-5 text-blue-500"/>}
                              <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">Kunden-Ziel</h4>
                            </div>
                            <div className="text-sm relative z-10">
                              {selectedInbound.goalType === 'budget' ? (
                                <>
                                  <p className="text-gray-500 mb-0.5 font-medium">Festes Budget</p>
                                  <p className="font-extrabold text-2xl text-gray-900 tracking-tight">€ {Number(selectedInbound.budget).toLocaleString('de-DE')}</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-gray-500 mb-0.5 font-medium">Ziel-Reichweite</p>
                                  <p className="font-extrabold text-2xl text-gray-900 tracking-tight">{Number(selectedInbound.reach).toLocaleString('de-DE')}</p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Card 3: Date */}
                          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-3 text-gray-400">
                              <CalendarDaysIcon className="w-5 h-5"/>
                              <h4 className="text-[0.65rem] font-bold uppercase tracking-wider text-gray-500">Wunsch-Laufzeit</h4>
                            </div>
                            <div className="text-sm">
                              <div className="flex flex-col gap-1.5 mt-2">
                                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                  <span className="text-gray-500 text-xs font-semibold uppercase">Start</span>
                                  <span className="font-bold text-gray-900">{selectedInbound.dateStart ? moment(selectedInbound.dateStart).format("DD.MM.YY") : "-"}</span>
                                </div>
                                <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                                  <span className="text-gray-500 text-xs font-semibold uppercase">Ende</span>
                                  <span className="font-bold text-gray-900">{selectedInbound.dateEnd ? moment(selectedInbound.dateEnd).format("DD.MM.YY") : "-"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Notes parsed */}
                        <div className="mb-10">
                          <h4 className="text-sm font-extrabold text-gray-900 mb-4 pb-2 border-b border-gray-200">Zielgruppen & Targeting</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {parseNotes(selectedInbound.inboundNotes).map((section, idx) => (
                              <div key={idx} className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${section.title.toLowerCase().includes('weitere infos') ? 'sm:col-span-2' : ''}`}>
                                  <h5 className="font-bold text-[#8A8070] text-[0.65rem] uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A84C]"></span>
                                    {section.title}
                                  </h5>
                                  <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap font-medium">
                                    {section.content}
                                  </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Calculator Widget */}
                        <div className="relative bg-gradient-to-br from-[#121318] to-black rounded-2xl p-6 sm:p-8 shadow-2xl border border-gray-800 overflow-hidden">
                          {/* subtle mesh background */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                          
                          <div className="relative z-10">
                            <h4 className="flex items-center gap-2 text-white font-extrabold mb-6 text-lg tracking-wide">
                              <SparklesIcon className="w-5 h-5 text-[#C9A84C]"/>
                              Dynamischer Angebots-Kalkulator
                            </h4>

                            <div className="flex flex-col md:flex-row items-end gap-6">
                              <div className="w-full md:w-1/3">
                                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-widest">Netto-TKP / CPCV (€)</label>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400 text-sm">€</span>
                                  </div>
                                  <input 
                                    type="number"
                                    step="0.1"
                                    value={calcTkp}
                                    onChange={(e) => setCalcTkp(Number(e.target.value))}
                                    className="block w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-8 pr-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-[#C9A84C] focus:border-[#C9A84C] transition-all text-sm font-bold"
                                  />
                                </div>
                              </div>
                              
                              <div className="w-full md:w-2/3 bg-gradient-to-r from-[#e7d291] to-[#C9A84C] rounded-lg p-3 flex flex-col justify-center shadow-[0_0_20px_rgba(201,168,76,0.15)] relative overflow-hidden">
                                {/* Shiny overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] hover:translate-x-[150%] duration-1000 transition-transform"></div>
                                
                                {selectedInbound.goalType === 'budget' ? (
                                  <div className="flex justify-between items-center relative z-10 px-1">
                                    <span className="text-black/70 font-bold text-[0.65rem] uppercase tracking-widest leading-none">Reichweite errechnet</span>
                                    <span className="font-extrabold text-black text-lg tracking-tight leading-none">
                                      {calcTkp > 0 ? Math.round((Number(selectedInbound.budget) / calcTkp) * 1000).toLocaleString('de-DE') : 0} <span className="text-xs font-bold text-black/60 tracking-normal ml-0.5">Views</span>
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex justify-between items-center relative z-10 px-1">
                                    <span className="text-black/70 font-bold text-[0.65rem] uppercase tracking-widest leading-none">Budget errechnet</span>
                                    <span className="font-extrabold text-black text-lg tracking-tight leading-none">
                                      {calcTkp > 0 ? (Number(selectedInbound.reach) / 1000 * calcTkp).toLocaleString('de-DE', { style: 'currency', currency: 'EUR'}) : 0}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                      <div className="bg-gray-100 px-6 py-5 sm:flex sm:flex-row-reverse sm:px-10 border-t border-gray-200 gap-3">
                        {selectedInbound.status === 'NEW' && (
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 sm:w-auto transition-all"
                            onClick={() => convertToCampaign(selectedInbound.id)}
                            disabled={convertingId === selectedInbound.id}
                          >
                            {convertingId === selectedInbound.id ? "Erstellt Angebot..." : "Angebot erstellen"}
                          </button>
                        )}
                        <button
                          type="button"
                          className="mt-3 sm:mt-0 inline-flex w-full justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-red-600 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-red-50 hover:ring-red-300 sm:w-auto transition-all"
                          onClick={() => deleteInbound(selectedInbound.id)}
                          disabled={deletingId === selectedInbound.id}
                        >
                          Lead verwerfen
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}

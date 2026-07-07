"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment";

// Components
import AddAdvertiser from "@components/dashboard/campaign/AddCampaign";
import DeleteAdvertiser from "@components/dashboard/campaign/DeleteCampaign";
import LoadingSpinner from "@components/pComponents/LoadingSpinner";
import Modal from "@components/pComponents/Modal";
import Pagination from "@components/pComponents/Pagination";
import Searchbar from "@components/pComponents/Search";

// Libs
import calculateDate from "../../../lib/calculateDate";
import { getColor } from "@lib/dashboard/publishingOptions";
import { getInitialData, returnEndDate, returnStartDate } from "./lib";

const ListedCampaignsContent = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null); // Besser null als undefined
  
  // FIX 1: Initial State muss zur Struktur passen, um Crash zu vermeiden
  // Nutze 'const' statt 'let'
  const [allCampaigns, setAllCampaigns] = useState({ data: [], mode: "list" }); 
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  // State für Budget Filter
  const [budgetFilter, setBudgetFilter] = useState("all");
  const [advertiserFilter, setAdvertiserFilter] = useState("all");

  const searchParams = useSearchParams();
  const activePage = searchParams.get("page") || 1; 

  useEffect(() => {
    getInitialData(setLoading, activePage, setAllCampaigns, setCount);
  }, [activePage]);

  // Advertiser Name Helper
  const getAdvertiserName = (item) => {
    return item.advertiser?.name || "Kein Advertiser";
  };

  const uniqueAdvertisers = allCampaigns?.advertisers || [];

  // Budget Berechnung & Filterung
  const calculateBudget = (item) => {
    let totalBudget = 0;
    // Wenn Angebote da sind, nimm diese (Priorität)
    if (item.offers && item.offers.length > 0) {
      item.offers.forEach(group => {
        if (group.offers && group.offers.length > 0) {
          const isCPCV = group.pricingModel === "CPCV";
          group.offers.forEach(offer => {
              const reach = offer.reach || 0;
              const tkp = offer.tkp || 0;
              if (isCPCV) {
                totalBudget += reach * tkp;
                // Add upcharge if it's applied on CPCV basis
                if (offer.upchargeTKP) {
                   totalBudget += reach * offer.upchargeTKP;
                }
              } else {
                totalBudget += (reach * tkp) / 1000;
                // Add upcharge if it's applied on TKP basis
                if (offer.upchargeTKP) {
                   totalBudget += (reach * offer.upchargeTKP) / 1000;
                }
              }
              // Add flat upcharge
              if (offer.upcharge) {
                 totalBudget += offer.upcharge;
              }
          });
        }
      });
    } else if (item.bookings && item.bookings.length > 0) {
      // Fallback auf Bookings
      item.bookings.forEach(b => {
          const reach = b.reach || 0;
          const tkp = b.tkp || 0;
          totalBudget += (reach * tkp) / 1000;
      });
    }
    return totalBudget;
  };

  const getFilteredCampaigns = () => {
    if (!allCampaigns?.data) return [];
    
    return allCampaigns.data.filter(campaign => {
      // 1. Budget Filter
      let passBudget = true;
      if (budgetFilter !== "all") {
        const budget = calculateBudget(campaign);
        switch(budgetFilter) {
          case "<10k": passBudget = budget < 10000; break;
          case "10k-50k": passBudget = budget >= 10000 && budget <= 50000; break;
          case ">50k": passBudget = budget > 50000; break;
          default: passBudget = true; break;
        }
      }
      
      // 2. Advertiser Filter
      let passAdvertiser = true;
      if (advertiserFilter !== "all") {
        passAdvertiser = getAdvertiserName(campaign) === advertiserFilter;
      }
      
      return passBudget && passAdvertiser;
    });
  };

  const filteredCampaigns = getFilteredCampaigns();

  return (
    <>
      {/* Modals */}
      {addModalOpen && (
        <Modal open={addModalOpen} setOpen={setAddModalOpen}>
          <AddAdvertiser
            setOpen={setAddModalOpen}
            allCampaigns={allCampaigns}
            setAllCampaigns={setAllCampaigns}
          />
        </Modal>
      )}
      
      {deleteModalOpen && (
        <Modal open={deleteModalOpen} setOpen={setDeleteModalOpen}>
          <DeleteAdvertiser
            id={idToDelete}
            setOpen={setDeleteModalOpen}
            allCampaigns={allCampaigns}
            setAllCampaigns={setAllCampaigns}
          />
        </Modal>
      )}

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Kampagnen
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Hier sind alle Kampagnen aufgeführt, mit denen wir gerade arbeiten
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setAddModalOpen(true)}
              className="block rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Add campaign
            </button>
          </div>
        </div>

        <div className="mt-8">
            {loading && <LoadingSpinner />}
            
            {!loading && (
              <div className="min-w-full pb-12">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 items-end">
                  <div className="w-full sm:max-w-md">
                    <Searchbar
                      model="campaign"
                      setAllResults={setAllCampaigns}
                      setLoading={setLoading}
                    />
                  </div>
                  
                  {/* Budget Filter */}
                  <div className="w-full sm:w-48">
                    <label htmlFor="budget-filter" className="block text-sm font-medium leading-6 text-gray-900">
                      Angebots-Budget
                    </label>
                    <select
                      id="budget-filter"
                      value={budgetFilter}
                      onChange={(e) => setBudgetFilter(e.target.value)}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="all">Alle Budgets</option>
                      <option value="<10k">Unter 10.000 €</option>
                      <option value="10k-50k">10.000 € - 50.000 €</option>
                      <option value=">50k">Über 50.000 €</option>
                    </select>
                  </div>

                  {/* Advertiser Filter */}
                  <div className="w-full sm:w-64">
                    <label htmlFor="advertiser-filter" className="block text-sm font-medium leading-6 text-gray-900">
                      Advertiser
                    </label>
                    <select
                      id="advertiser-filter"
                      value={advertiserFilter}
                      onChange={(e) => setAdvertiserFilter(e.target.value)}
                      className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      <option value="all">Alle Advertiser</option>
                      {uniqueAdvertisers.map((adv, idx) => (
                        <option key={idx} value={adv}>{adv}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Modern List Layout */}
                {filteredCampaigns.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {filteredCampaigns.map((item) => {
                      const budget = calculateBudget(item);
                      const displayBudget = budget > 0 
                        ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(budget)
                        : (item.budget ? item.budget : "-");

                      return (
                        <div key={item.id} className="group flex flex-col md:flex-row md:items-center justify-between rounded-xl bg-white border-2 border-slate-300 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-indigo-500/10 hover:border-indigo-400 p-4 sm:p-5 gap-4 sm:gap-6">
                          
                          {/* Left: Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1.5">
                              <Link href={`/dashboard/campaigns/${item.id}`} className="truncate block">
                                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-none hover:text-indigo-600 transition-colors truncate">{item.name}</h3>
                              </Link>
                              <span
                                className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ring-1 ring-inset ${getColor("text", item.status, 700)} ${getColor("bg", item.status, 50)} ${getColor("ring", item.status, 200)}`}
                              >
                                <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${getColor("bg", item.status, 500)}`} aria-hidden="true" />
                                {item.status}
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest truncate">
                              {getAdvertiserName(item)}
                            </p>
                          </div>

                          {/* Middle: Dates */}
                          <div className="flex items-center gap-6 shrink-0 md:w-64 bg-slate-50 rounded-xl px-4 py-2 border border-slate-200/80 hidden sm:flex">
                             <div>
                                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-0.5 inline-flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Start
                                </p>
                                <p className="text-sm font-bold text-slate-900">{returnStartDate(item) || "-"}</p>
                             </div>
                             <div>
                                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-0.5 inline-flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Ende
                                </p>
                                <p className="text-sm font-bold text-slate-900">{returnEndDate(item) || "-"}</p>
                             </div>
                          </div>

                          {/* Right: Budget & Actions */}
                          <div className="flex items-center justify-between md:justify-end gap-6 shrink-0 md:w-64">
                            <div className="text-left md:text-right">
                               <p className="text-[9px] uppercase tracking-widest font-bold text-slate-500 mb-0.5">Budget</p>
                               <p className="text-xl sm:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-950 to-indigo-700">
                                  {displayBudget}
                               </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 pt-2 sm:pt-0">
                               <Link
                                  href={`/dashboard/campaigns/${item.id}`}
                                  className="text-slate-500 p-2.5 rounded-xl hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                                  title="Bearbeiten"
                                >
                                    <PencilIcon className="h-5 w-5" aria-hidden="true" />
                                    <span className="sr-only">Bearbeiten</span>
                                </Link>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setIdToDelete(item.id);
                                    setDeleteModalOpen(true);
                                  }}
                                  className="text-slate-500 p-2.5 rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors"
                                  title="Löschen"
                                >
                                  <TrashIcon className="h-5 w-5" aria-hidden="true" />
                                  <span className="sr-only">Löschen</span>
                                </button>
                            </div>
                          </div>
                          
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-[24px] border border-slate-200 border-dashed">
                     <p className="text-sm font-medium text-slate-500">Keine Kampagnen für diesen Filter gefunden.</p>
                  </div>
                )}
                
                {allCampaigns.mode !== "search" && (
                    <div className="mt-8">
                      <Pagination
                        count={count}
                        activePage={activePage}
                      />
                    </div>
                )}
              </div>
            )}
        </div>
      </div>
    </>
  );
};

// Wrapper Component für Suspense
const ListedCampaigns = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ListedCampaignsContent />
    </Suspense>
  );
};

export default ListedCampaigns;
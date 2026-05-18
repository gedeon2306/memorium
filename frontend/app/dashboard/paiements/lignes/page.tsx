"use client";

import { getLignesPaiementList } from "@/app/actions/actions";
import Pagination from "@/components/uxComponents/Pagination";
import { motion } from "framer-motion";
import {
  Search,
  ChevronsUpDown,
  Receipt,
  CreditCard as CreditCardIcon,
  List,
} from "lucide-react";
import { useCallback, useEffect, useState, Suspense, useRef } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import AddLignePaiementModal, { AddLignePaiementModalHandle } from "@/components/lignesPaiementComponents/AddLignePaiementModal";
import UpdateLignePaiementModal, { UpdateLignePaiementModalHandle } from "@/components/lignesPaiementComponents/UpdateLignePaiementModal";
import DeleteLignePaiementModal, { DeleteLignePaiementModalHandle } from "@/components/lignesPaiementComponents/DeleteLignePaiementModal";
import { MoreHorizontal, SquarePen, Trash2, Plus } from "lucide-react";

const PAGE_SIZE = 12;

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type LignePaiementRow = {
  id: string;
  paiement: string;
  paiement_num_facture: string;
  motif: string;
  montant: string;
  moyen_paiement: string;
  defunt?: string;
  defunt_nom?: string;
};

function LignesPaiementContent() {
  const searchParams = useSearchParams();
  const paiementId = searchParams.get("paiement") ?? "";
  const paiementNum = searchParams.get("num") ?? "";

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const [lignesPaiement, setLignesPaiement] = useState<LignePaiementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("motif");
  const [defunts, setDefunts] = useState<any[]>([]);
  const debouncedSearch = useDebounce(search, 400);

  const addModalRef = useRef<AddLignePaiementModalHandle>(null);
  const updateModalRef = useRef<UpdateLignePaiementModalHandle>(null);
  const deleteModalRef = useRef<DeleteLignePaiementModalHandle>(null);

  const loadLignesPaiement = useCallback(async (page: number, q: string, ord: string) => {
    setLoading(true);
    try {
      const res = await getLignesPaiementList(page, q, ord, paiementId);
      
      if (res == null) {
        toast.error("Session expirée ou accès refusé");
        setLignesPaiement([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      if (typeof res === "object" && "error" in res && res.error) {
        toast.error(String(res.error));
        setLignesPaiement([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      
      if (typeof res === "object" && "results" in res && res.results && "results" in res.results) {
        setLignesPaiement(res.results.results as LignePaiementRow[]);
        const count = typeof res.count === "number" ? res.count : res.results.results.length;
        setTotalCount(count);
        setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
        return;
      }
      
      setLignesPaiement([]);
      setTotalCount(0);
      setTotalPages(1);
    } catch {
      toast.error("Un problème est survenu pendant le chargement des données");
      setLignesPaiement([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [paiementId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, ordering]);

  useEffect(() => {
    loadLignesPaiement(currentPage, debouncedSearch, ordering);
  }, [currentPage, debouncedSearch, ordering, loadLignesPaiement]);

  useEffect(() => {
    const loadDefunts = async () => {
      try {
        const { getDefuntsList } = await import("@/app/actions/actions");
        const res = await getDefuntsList(1, "", "recent");
        
        if (res && typeof res === "object" && "results" in res && res.results) {
          setDefunts(res.results.results || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des defunts:", error);
      }
    };
    
    loadDefunts();
  }, []);

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(parseFloat(amount));
  };

  const getMoyenPaiementLabel = (moyen: string) => {
    const moyens: { [key: string]: string } = {
      'cash': 'Espèces',
      'mobile': 'Mobile Money',
      'carte': 'Carte bancaire',
      'virement': 'Virement bancaire',
      'cheque': 'Chèque',
    };
    return moyens[moyen] || moyen;
  };

  return (
    <>
      <AddLignePaiementModal
        ref={addModalRef}
        onSuccess={() => loadLignesPaiement(currentPage, debouncedSearch, ordering)}
        paiementId={paiementId}
        defunts={defunts}
      />
      <UpdateLignePaiementModal
        ref={updateModalRef}
        onSuccess={() => loadLignesPaiement(currentPage, debouncedSearch, ordering)}
        defunts={defunts}
      />
      <DeleteLignePaiementModal
        ref={deleteModalRef}
        onSuccess={() => loadLignesPaiement(currentPage, debouncedSearch, ordering)}
      />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 w-full"
      >
        {/* Breadcrumbs avec icons */}
        <motion.div variants={itemVariants}>
          <div className="text-sm breadcrumbs">
            <ul>
              {/* <li>
                <Link href={ROUTES.DASHBOARD.ROOT} className="flex items-center gap-2 text-white/60 hover:text-white">
                  <Home size={14} />
                  Accueil
                </Link>
              </li> */}
              <li>
                <Link href={ROUTES.DASHBOARD.PAIEMENTS} className="flex items-center gap-2 text-white/60 hover:text-white">
                  <CreditCardIcon size={14} />
                  Paiements
                </Link>
              </li>
              <li className="flex items-center gap-2 text-white">
                <List size={14} />
                Lignes de paiement{paiementNum && ` - Facture ${paiementNum}`}
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-white flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-3">
                <Receipt className="w-8 h-8 shrink-0" />
                <span>Lignes paiement</span>
              </div>
              {paiementNum && (
                <span className="text-lg font-normal text-white/60 sm:ml-0">
                  - Facture {paiementNum}
                </span>
              )}
            </h1>
            <p className="mt-2 text-base text-neutral-400">
              Consultez toutes les lignes de paiement détaillées.
            </p>
          </div>
          
          {/* Bouton Ajouter */}
          <motion.button
            type="button"
            onClick={() => addModalRef.current?.open()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn btn-primary btn-sm gap-2 shrink-0"
            disabled={!paiementId}
          >
            <Plus size={14} />
            Ajouter une ligne
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-white/6 bg-white/3 shadow-lg">
            <div className="card-body p-4 sm:p-5">
              {/* Barre de recherche + tri */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                <label className="relative flex-1 min-w-0 max-w-md">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                    size={16}
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par motif, moyen de paiement…"
                    className="input input-bordered input-sm w-full pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/35 focus:border-primary/50"
                  />
                </label>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <ChevronsUpDown size={16} className="text-white/35 hidden sm:block" />
                  <select
                    value={ordering}
                    onChange={(e) => setOrdering(e.target.value)}
                    className="select select-bordered select-sm w-full sm:w-52 bg-white/5 border-white/10 text-white focus:border-primary/50"
                    aria-label="Trier la liste"
                  >
                    <option value="motif">Trier par motif (A à Z)</option>
                    <option value="motif-desc">Trier par motif (Z à A)</option>
                    <option value="montant">Trier par montant (croissant)</option>
                    <option value="montant-desc">Trier par montant (décroissant)</option>
                  </select>
                </div>
              </div>

              {/* Grille de cartes */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="rounded-xl border border-white/6 bg-white/3 p-4 min-h-48">
                        <div className="h-4 bg-white/10 rounded mb-2"></div>
                        <div className="h-3 bg-white/10 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-white/10 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : lignesPaiement.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lignesPaiement.map((ligne, i) => (
                    <motion.div
                      key={ligne.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
                      className="group relative"
                    >
                      <div className="rounded-xl border border-white/6 bg-white/3 p-4 flex flex-col justify-between min-h-48 hover:border-white/12 transition-all duration-300 hover:bg-white/5">
                        {/* En-tête de la ligne */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-primary/15 text-primary">
                              <Receipt className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white text-sm mb-1 truncate" title={ligne.motif}>
                                {ligne.motif}
                              </h3>
                              <p className="text-white/60 text-xs truncate">
                                {ligne.paiement_num_facture || `Paiement ${ligne.paiement}`}
                              </p>
                            </div>
                          </div>
                          
                          {/* Menu d'actions */}
                          <div className="dropdown dropdown-end">
                            <button
                              type="button"
                              tabIndex={0}
                              className="btn btn-ghost btn-xs btn-square bg-black/20 hover:bg-black/40 text-white/60 hover:text-white border-0"
                              aria-label="Actions"
                            >
                              <MoreHorizontal size={13} />
                            </button>
                            <ul
                              tabIndex={0}
                              className="dropdown-content menu p-2 shadow bg-neutral-900 border border-white/10 rounded-box w-40 z-50"
                            >
                              <li>
                                <button
                                  type="button"
                                  onClick={() => updateModalRef.current?.open(ligne)}
                                  className="justify-start gap-2 text-white/80 hover:text-white"
                                >
                                  <SquarePen size={14} />
                                  Modifier
                                </button>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  onClick={() => deleteModalRef.current?.open(ligne)}
                                  className="justify-start gap-2 text-error/80 hover:text-error"
                                >
                                  <Trash2 size={14} />
                                  Supprimer
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Informations principales */}
                        <div className="space-y-2 text-xs text-white/40">
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Montant :</span>
                            <span className="font-semibold text-white">{formatCurrency(ligne.montant)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Moyen paiement :</span>
                            <span>{getMoyenPaiementLabel(ligne.moyen_paiement)}</span>
                          </div>
                          {ligne.defunt_nom && (
                            <div className="flex items-center justify-between">
                              <span className="text-white/60">Défunt :</span>
                              <span>{ligne.defunt_nom}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Receipt className="w-16 h-16 mx-auto text-neutral-500 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {search ? `Aucun résultat pour "${search}"` : "Aucune ligne de paiement trouvée"}
                  </h3>
                  <p className="text-neutral-400">
                    {search 
                      ? "Essayez avec d'autres termes de recherche."
                      : paiementId 
                        ? "Ce paiement ne contient aucune ligne."
                        : "Aucune ligne de paiement enregistrée."
                    }
                  </p>
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default function LignesPaiementPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div
              className="loading loading-spinner loading-lg text-primary"
              aria-label="Chargement"
            />
            <p className="mt-4 text-lg font-semibold text-white">
              Chargement des lignes de paiement...
            </p>
            <p className="mt-1 text-sm text-white/60">
              Veuillez patienter quelques instants.
            </p>
          </div>
        </div>
      }
    >
      <LignesPaiementContent />
    </Suspense>
  );
}

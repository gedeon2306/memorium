"use client";

import { getPaiementsList } from "@/app/actions/actions";
import Pagination from "@/components/uxComponents/Pagination";
import AddPaiementModal, { AddPaiementModalHandle } from "@/components/paiementsComponents/AddPaiementModal";
import UpdatePaiementModal, { UpdatePaiementModalHandle } from "@/components/paiementsComponents/UpdatePaiementModal";
import DeletePaiementModal, { DeletePaiementModalHandle } from "@/components/paiementsComponents/DeletePaiementModal";
import { motion } from "framer-motion";
import {
  CreditCard,
  UserPlus,
  Search,
  ChevronsUpDown,
  MoreHorizontal,
  Eye,
  SquarePen,
  Trash2,
  Receipt,
  Printer,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";

const PAGE_SIZE = 12;

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type PaiementRow = {
  id: string;
  num_facture: string;
  famille: string;
  famille_details?: any;
  user_name?: string;
  total_amount: string;
  date_paiement: string;
  created_at?: string;
  lignes?: Array<{
    id: string;
    motif: string;
    montant: string;
    moyen_paiement: string;
    defunt?: string;
    defunt_details?: any;
  }>;
};

export default function PaiementsPage() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const [paiements, setPaiements] = useState<PaiementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("recent");
  const [families, setFamilies] = useState<any[]>([]);
  const [defunts, setDefunts] = useState<any[]>([]);

  const addModalRef = useRef<AddPaiementModalHandle>(null);
  const updateModalRef = useRef<UpdatePaiementModalHandle>(null);
  const deleteModalRef = useRef<DeletePaiementModalHandle>(null);
  const debouncedSearch = useDebounce(search, 400);

  const loadPaiements = useCallback(async (page: number, q: string, ord: string) => {
    setLoading(true);
    try {
      const res = await getPaiementsList(page, q, ord);
      
      if (res == null) {
        toast.error("Session expirée ou accès refusé");
        setPaiements([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      if (typeof res === "object" && "error" in res && res.error) {
        toast.error(String(res.error));
        setPaiements([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      
      if (typeof res === "object" && "results" in res && res.results && "results" in res.results) {
        setPaiements(res.results.results as PaiementRow[]);
        const count = typeof res.count === "number" ? res.count : res.results.results.length;
        setTotalCount(count);
        setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));

        if (res.results.families && Array.isArray(res.results.families)) {
          setFamilies(res.results.families);
        }
        if (res.results.defunts && Array.isArray(res.results.defunts)) {
          setDefunts(res.results.defunts);
        }
        return;
      }
      
      setPaiements([]);
      setTotalCount(0);
      setTotalPages(1);
    } catch {
      toast.error("Un problème est survenu pendant le chargement des données");
      setPaiements([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, ordering]);

  useEffect(() => {
    loadPaiements(currentPage, debouncedSearch, ordering);
  }, [currentPage, debouncedSearch, ordering, loadPaiements]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF'
    }).format(parseFloat(amount));
  };

  const handlePrint = () => {
    toast.error("Bientôt disponible");
  };

  
  return (
    <>
      <AddPaiementModal
        ref={addModalRef}
        onSuccess={() => loadPaiements(currentPage, debouncedSearch, ordering)}
        families={families}
        defunts={defunts}
      />
      <UpdatePaiementModal
        ref={updateModalRef}
        onSuccess={() => loadPaiements(currentPage, debouncedSearch, ordering)}
        families={families}
      />
      <DeletePaiementModal
        ref={deleteModalRef}
        onSuccess={() => loadPaiements(currentPage, debouncedSearch, ordering)}
      />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 w-full"
      >
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 shrink-0" />
            Paiements
          </h1>
          <p className="mt-2 text-base text-neutral-400">
            Gérez et consultez tous les paiements enregistrés.
          </p>
        </div>

        {/* Bouton Ajouter */}
        <motion.button
          type="button"
          onClick={() => addModalRef.current?.open()}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-primary btn-sm gap-2 shrink-0"
        >
          <UserPlus size={16} />
          Ajouter un paiement
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
                  placeholder="Rechercher par numéro de facture, famille…"
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
                  <option value="num_facture">Trier par numéro (A à Z)</option>
                  <option value="num_facture-desc">Trier par numéro (Z à A)</option>
                  <option value="amount">Trier par montant (croissant)</option>
                  <option value="amount-desc">Trier par montant (décroissant)</option>
                  <option value="recent">Trier par date de paiement</option>
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
            ) : paiements.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paiements.map((paiement, i) => (
                  <motion.div
                    key={paiement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.35 }}
                    className="group relative"
                  >
                    <div className="rounded-xl border border-white/6 bg-white/3 p-4 flex flex-col justify-between min-h-48 hover:border-white/12 transition-all duration-300 hover:bg-white/5">
                      {/* Actions dropdown */}
                      <div className="absolute top-2 right-2 transition-opacity duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100">
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
                              <Link
                                href={`${ROUTES.DASHBOARD.LIGNES}?paiement=${paiement.id}&num=${encodeURIComponent(paiement.num_facture)}`}
                                className="justify-start gap-2 text-white/80 hover:text-white flex items-center"
                              >
                                <Eye size={14} />
                                Voir
                              </Link>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={handlePrint}
                                className="justify-start gap-2 text-white/80 hover:text-white"
                              >
                                <Printer size={14} />
                                Imprimer
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => updateModalRef.current?.open(paiement)}
                                className="justify-start gap-2 text-white/80 hover:text-white"
                              >
                                <SquarePen size={14} />
                                Modifier
                              </button>
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => deleteModalRef.current?.open(paiement)}
                                className="justify-start gap-2 text-error/80 hover:text-error"
                              >
                                <Trash2 size={14} />
                                Supprimer
                              </button>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* En-tête du paiement */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/15 text-primary">
                          <Receipt className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm mb-1 truncate" title={paiement.num_facture}>
                            {paiement.num_facture}
                          </h3>
                          <p className="text-white/60 text-xs truncate">
                            {paiement.famille_details?.nom_famille || paiement.famille || 'Famille inconnue'}
                          </p>
                        </div>
                      </div>

                      {/* Informations principales */}
                      <div className="space-y-2 text-xs text-white/40">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Montant total :</span>
                          <span className="font-semibold text-white">{formatCurrency(paiement.total_amount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Date paiement :</span>
                          <span>{formatDate(paiement.date_paiement)}</span>
                        </div>
                        {paiement.user_name && (
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Créé par :</span>
                            <span>{paiement.user_name}</span>
                          </div>
                        )}
                        {paiement.lignes && paiement.lignes.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Lignes :</span>
                            <span>{paiement.lignes.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 mx-auto text-neutral-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {search ? `Aucun résultat pour "${search}"` : "Aucun paiement enregistré"}
                </h3>
                <p className="text-neutral-400">
                  {search 
                    ? "Essayez avec d'autres termes de recherche."
                    : "Commencez par ajouter votre premier paiement."
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

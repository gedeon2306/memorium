"use client";

import { getFamiliesList } from "@/app/actions/actions";
import AddFamilyModal, { AddFamilyModalHandle } from "@/components/AddFamilyModal";
import Pagination from "@/components/Pagination";
import { motion } from "framer-motion";
import { ContactRound, Search, ChevronsUpDown, Users } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

const PAGE_SIZE = 5;

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type FamilleRow = {
  id: string;
  nom_famille: string;
  nom_garrant: string;
  profession: string;
  telephone: string;
  email: string;
  created_at?: string;
};

export default function FamillesPage() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const [familles, setFamilles] = useState<FamilleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState("name-asc");

  const addModalRef = useRef<AddFamilyModalHandle>(null);

  const debouncedSearch = useDebounce(search, 400);

  const loadFamilles = useCallback(async (page: number, q: string, ord: string) => {
    setLoading(true);
    try {
      const res = await getFamiliesList(page, q, ord);
      if (res == null) {
        toast.error("Session expirée ou accès refusé");
        setFamilles([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      if (typeof res === "object" && "error" in res && res.error) {
        toast.error(String(res.error));
        setFamilles([]);
        setTotalCount(0);
        setTotalPages(1);
        return;
      }
      if (typeof res === "object" && "results" in res && Array.isArray(res.results)) {
        setFamilles(res.results as FamilleRow[]);
        const count = typeof res.count === "number" ? res.count : res.results.length;
        setTotalCount(count);
        setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
        return;
      }
      setFamilles([]);
      setTotalCount(0);
      setTotalPages(1);
    } catch {
      toast.error("Un problème est survenu pendant le chargement des données");
      setFamilles([]);
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
    loadFamilles(currentPage, debouncedSearch, ordering);
  }, [currentPage, debouncedSearch, ordering, loadFamilles]);

  return (
    <>
      <AddFamilyModal
        ref={addModalRef}
        onSuccess={() => loadFamilles(1, debouncedSearch, ordering)}
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
              <ContactRound className="w-8 h-8 shrink-0" />
              Familles
            </h1>
            <p className="mt-2 text-base text-neutral-400">
              Consultez et enregistrez les familles dans Memorium.
            </p>
          </div>

          <motion.button
            type="button"
            onClick={() => addModalRef.current?.open()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn btn-primary btn-sm gap-2 shrink-0"
          >
            <Users size={16} />
            Ajouter une famille
          </motion.button>
        </motion.div>

      <motion.div variants={itemVariants}>
        <div className="card glass border border-white/6 bg-white/3 shadow-lg">
          <div className="card-body p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <label className="relative flex-1 min-w-0 max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
                  size={16}
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher par nom de famille, garant, e-mail ou téléphone…"
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
                  <option value="name-asc">Trier par nom de famille (A → Z)</option>
                  <option value="name-desc">Trier par nom de famille (Z → A)</option>
                  <option value="profession">Trier par profession</option>
                  <option value="recent">Trier par date de création</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto -mx-1 px-1">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-white/5 text-xs text-white/30">
                    <th className="bg-transparent font-normal">#</th>
                    <th className="bg-transparent font-normal">Nom de famille</th>
                    <th className="bg-transparent font-normal hidden md:table-cell">Garant</th>
                    <th className="bg-transparent font-normal hidden lg:table-cell">Profession</th>
                    <th className="bg-transparent font-normal">Téléphone</th>
                    <th className="bg-transparent font-normal hidden sm:table-cell">E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6">
                        <span className="loading loading-spinner loading-sm" />
                      </td>
                    </tr>
                  ) : familles.length ? (
                    familles.map((famille, i) => (
                      <motion.tr
                        key={famille.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.05, duration: 0.35 }}
                        className="border-white/5 text-sm hover:bg-white/3"
                      >
                        <td className="px-2 py-3 whitespace-nowrap text-white/90 font-medium">
                          {(currentPage - 1) * PAGE_SIZE + i + 1}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-white/90 font-medium">
                          {famille.nom_famille}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-white/60 text-xs hidden md:table-cell">
                          {famille.nom_garrant}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-white/60 text-xs hidden lg:table-cell">
                          {famille.profession}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-white/60 text-xs">
                          {famille.telephone}
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap text-white/45 text-xs hidden sm:table-cell">
                          {famille.email}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center text-sm py-6 text-white/40">
                        {search
                          ? `Aucun résultat pour « ${search} ».`
                          : "Aucune famille enregistrée."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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

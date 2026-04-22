"use client";

import { getUsersList } from "@/app/actions/actions";
import Pagination from "@/components/uxComponents/Pagination";
import AddUserModal, { AddUserModalHandle } from "@/components/usersComponents/AddUserModal";
import UpdateUserModal, { UpdateUserModalHandle } from "@/components/usersComponents/UpdateUserModal";
import DeleteUserModal, { DeleteUserModalHandle } from "@/components/usersComponents/DeleteUserModal";
import { motion } from "framer-motion";
import {
  UserRoundCog,
  UserPlus,
  Search,
  ChevronsUpDown,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function UsersPage() {
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  const [users, setUsers]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [search, setSearch]           = useState("");
  const [ordering, setOrdering]       = useState("name-asc");

  // Ref vers le modal — permet d'appeler modalRef.current.open() depuis le bouton
  const modalRef = useRef<AddUserModalHandle>(null);
  const updateModalRef = useRef<UpdateUserModalHandle>(null);
  const deleteModalRef = useRef<DeleteUserModalHandle>(null);

  const debouncedSearch = useDebounce(search, 400);

  const loadUsers = useCallback(async (page: number, q: string, ord: string) => {
    setLoading(true);
    try {
      const res = await getUsersList(page, q, ord);
      setUsers(res.results);
      setTotalCount(res.count);
      setTotalPages(Math.ceil(res.count / PAGE_SIZE));
    } catch {
      toast.error("Un problème est survenu pendant le chargement des données");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, ordering]);

  useEffect(() => {
    loadUsers(currentPage, debouncedSearch, ordering);
  }, [currentPage, debouncedSearch, ordering, loadUsers]);

  return (
    <>
      {/* Modal monté une seule fois, contrôlé par ref */}
      <AddUserModal
        ref={modalRef}
        onSuccess={() => loadUsers(1, debouncedSearch, ordering)}
      />
      <UpdateUserModal
        ref={updateModalRef}
        onSuccess={() => loadUsers(1, debouncedSearch, ordering)}
      />
      <DeleteUserModal
        ref={deleteModalRef}
        onSuccess={() => loadUsers(1, debouncedSearch, ordering)}
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
              <UserRoundCog className="w-8 h-8 shrink-0" />
              Utilisateurs
            </h1>
            <p className="mt-2 text-base text-neutral-400">
              Gérez les comptes et les rôles de votre espace Memorium.
            </p>
          </div>

          {/* Bouton qui ouvre le modal via ref */}
          <motion.button
            type="button"
            onClick={() => modalRef.current?.open()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="btn btn-primary btn-sm gap-2 shrink-0"
          >
            <UserPlus size={16} />
            Ajouter un utilisateur
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-white/6 bg-white/3 shadow-lg">
            <div className="card-body p-4 sm:p-5">

              {/* Barre de recherche + tri */}
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
                    placeholder="Rechercher par nom ou e-mail…"
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
                    <option value="name-asc">Trier par nom (A → Z)</option>
                    <option value="name-desc">Trier par nom (Z → A)</option>
                    <option value="role">Trier par rôle</option>
                    <option value="recent">Trier par date de création</option>
                  </select>
                </div>
              </div>

              {/* Tableau */}
              <div className="overflow-x-auto -mx-1 px-1">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-white/5 text-xs text-white/30">
                      <th className="bg-transparent font-normal">#</th>
                      <th className="bg-transparent font-normal">Nom</th>
                      <th className="bg-transparent font-normal hidden sm:table-cell">E-mail</th>
                      <th className="bg-transparent font-normal">Rôle</th>
                      <th className="bg-transparent font-normal">Statut</th>
                      <th className="bg-transparent font-normal w-12" />
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6">
                          <span className="loading loading-spinner loading-sm" />
                        </td>
                      </tr>
                    ) : users.length ? (
                      users.map((user, i) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.05, duration: 0.35 }}
                          className="border-white/5 text-sm hover:bg-white/3"
                        >
                          <td className="px-2 py-3 whitespace-nowrap text-white/90 font-medium">
                            {(currentPage - 1) * PAGE_SIZE + i + 1}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-white/90 font-medium">
                            {user.name}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-white/45 text-xs hidden sm:table-cell">
                            {user.email}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap text-white/60 text-xs">
                            {user.role}
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap">
                            <span className={`badge badge-xs border-0 ${user.is_active ? "badge-success" : "badge-warning"}`}>
                              {user.is_active ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <div className="dropdown dropdown-end">
                              <button
                                type="button"
                                tabIndex={0}
                                className="btn btn-ghost btn-xs btn-square text-white/20 hover:text-white/60"
                                aria-label="Actions"
                              >
                                <MoreHorizontal size={13} />
                              </button>
                              <ul
                                tabIndex={0}
                                className="dropdown-content menu p-2 shadow bg-neutral-900 border border-white/10 rounded-box w-40"
                              >
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => updateModalRef.current?.open(user)}
                                    className="justify-start gap-2 text-white/80 hover:text-white"
                                  >
                                    <UserRoundCog size={14} />
                                    Modifier
                                  </button>
                                </li>
                                <li>
                                  <button
                                    type="button"
                                    onClick={() => deleteModalRef.current?.open(user)}
                                    className="justify-start gap-2 text-error/80 hover:text-error"
                                  >
                                    <Trash2 size={14} />
                                    Supprimer
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center text-sm py-6 text-white/40">
                          {search
                            ? `Aucun résultat pour " ${search} ".`
                            : "Aucun utilisateur trouvé."}
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
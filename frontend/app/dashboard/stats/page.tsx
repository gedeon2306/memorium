"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ChartSpline,
  TrendingUp,
  Venus,
  Mars,
  TrendingDown,
  Bird,
  RotateCw,
  ArrowUpRight,
  Cuboid,
  User,
  PackageOpen,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Clock,
  MapPin,
  DollarSign,
  Eye,
} from "lucide-react";
import { dashboard } from "@/app/actions/actions";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";

const statusBadge: Record<string, string> = {
  Validé: "badge-success",
  "En cours": "badge-warning",
  Annulé: "badge-error",
};

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30j");

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboard();
        if (data?.error) {
          setError(data.error);
        } else {
          setDashboardData(data);
        }
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboard();
      if (data?.error) {
        setError(data.error);
      } else {
        setDashboardData(data);
      }
    } catch (err) {
      setError("Une erreur est survenue lors du rafraîchissement");
    } finally {
      setLoading(false);
    }
  };

  // Generate cards data from API
  const generateCards = () => {
    if (!dashboardData?.statistics) return [];
    
    const stats = dashboardData.statistics;
    return [
      { label: "Défunts", value: stats.total_defunts.toString(), icon: Bird, color: "text-rose-400", bg: "bg-rose-400/10" },
      { label: "Trous totaux", value: stats.total_trous.toString(), icon: Cuboid, color: "text-amber-400", bg: "bg-amber-400/10" },
      { label: "Trous disponibles", value: stats.trous_disponibles.toString(), icon: PackageOpen, color: "text-sky-400", bg: "bg-sky-400/10" },
      { label: "Utilisateurs", value: stats.total_users.toString(), icon: User, color: "text-violet-400", bg: "bg-violet-400/10" },
      { label: "Défunts Masculins", value: stats.defunts_masculins.toString(), icon: Mars, color: "text-yellow-400", bg: "bg-yellow-400/10" },
      { label: "Défunts Féminins", value: stats.defunts_feminins.toString(), icon: Venus, color: "text-emerald-400", bg: "bg-emerald-400/10" },
      { label: "Défunts Majeurs", value: stats.defunts_majeurs.toString(), icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-400/10" },
      { label: "Défunts Mineurs", value: stats.defunts_mineurs.toString(), icon: TrendingDown, color: "text-orange-400", bg: "bg-orange-400/10" },
    ];
  };

  // Generate data for charts
  const generateGenderData = () => {
    if (!dashboardData?.statistics) return [];
    return [
      { name: "Masculin", value: dashboardData.statistics.defunts_masculins, color: "#60A5FA" },
      { name: "Féminin", value: dashboardData.statistics.defunts_feminins, color: "#F472B6" },
    ];
  };

  const generateAgeData = () => {
    if (!dashboardData?.statistics) return [];
    return [
      { name: "Majeurs (18+)", value: dashboardData.statistics.defunts_majeurs, color: "#34D399" },
      { name: "Mineurs (-18)", value: dashboardData.statistics.defunts_mineurs, color: "#FB923C" },
    ];
  };

  const generateMonthlyData = () => {
    // Simulated monthly data - in real app, this would come from API
    return [
      { month: "Jan", défunts: 12, inhumations: 10 },
      { month: "Fév", défunts: 15, inhumations: 13 },
      { month: "Mar", défunts: 18, inhumations: 16 },
      { month: "Avr", défunts: 14, inhumations: 12 },
      { month: "Mai", défunts: 20, inhumations: 18 },
      { month: "Jun", défunts: 16, inhumations: 14 },
    ];
  };

  const generateOccupancyData = () => {
    if (!dashboardData?.statistics) return [];
    const total = dashboardData.statistics.total_trous;
    const occupied = total - dashboardData.statistics.trous_disponibles;
    return [
      { name: "Occupés", value: occupied, color: "#EF4444" },
      { name: "Disponibles", value: dashboardData.statistics.trous_disponibles, color: "#10B981" },
    ];
  };

  const generateProgressData = () => {
    if (!dashboardData?.progress_data) return [];
    
    const progressColorMap: Record<string, string> = {
      "progress-primary": "#3B82F6",
      "progress-secondary": "#6B7280", 
      "progress-success": "#10B981",
      "progress-warning": "#F59E0B",
      "progress-error": "#EF4444",
      "progress-info": "#06B6D4",
      "progress-accent": "#8B5CF6"
    };

    return dashboardData.progress_data.map((item: any) => ({
      name: item.label,
      value: item.value,
      fill: progressColorMap[item.color] || "#3B82F6"
    }));
  };

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 w-full"
      >
        {/* Header skeleton */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="h-10 w-64 bg-white/10 rounded-lg mb-2 animate-pulse"></div>
            <div className="h-5 w-48 bg-white/5 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse"></div>
            <div className="h-8 w-8 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
        </motion.div>

        {/* Cards skeleton */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="card glass border border-white/6 bg-white/3 shadow-lg min-w-0">
                <div className="card-body p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <div className="w-5 h-5 bg-white/20 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="card glass border border-white/6 bg-white/3 shadow-lg">
          <div className="card-body p-8 text-center">
            <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <ChartSpline className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Erreur de chargement</h2>
            <p className="text-neutral-400 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="btn btn-primary btn-sm"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Réessayer
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const cards = generateCards();
  const progressData = generateProgressData();
  const genderData = generateGenderData();
  const ageData = generateAgeData();
  const monthlyData = generateMonthlyData();
  const occupancyData = generateOccupancyData();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ChartSpline className="w-8 h-8" />
            Statistiques
          </h1>
          <p className="mt-2 text-base text-neutral-400">
            Vue d'ensemble complète des données du cimetière
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="select select-bordered select-sm bg-white/10 border-white/20 text-white"
          >
            <option value="7j">7 jours</option>
            <option value="30j">30 jours</option>
            <option value="90j">90 jours</option>
            <option value="1an">1 an</option>
            <option value="tout">Tout</option>
          </select>
          <button
            onClick={handleRefresh}
            className="btn btn-outline btn-sm border-white/20 text-white hover:bg-white/10"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button className="btn btn-primary btn-sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="min-w-0"
            >
              <div className="card glass border border-white/6 bg-white/3 shadow-lg hover:border-white/12 transition-all duration-300 min-w-0">
                <div className="card-body p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-1">
                    <div className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
                      <Icon className={`w-5 h-5 sm:w-5 sm:h-5 ${card.color}`} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl sm:text-3xl font-bold text-white">
                      {card.value}
                    </div>
                    <div className="text-xs sm:text-sm text-neutral-400 mt-1">
                      {card.label}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution Pie Chart */}
        <motion.div variants={itemVariants}>
          <div className="card glass border border-white/6 bg-white/3 shadow-lg">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Répartition par genre
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Age Distribution Donut Chart */}
        <motion.div variants={itemVariants}>
          <div className="card glass border border-white/6 bg-white/3 shadow-lg">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Répartition par âge
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={ageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right" 
                    layout="vertical"
                    wrapperStyle={{ color: '#fff' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Statistics Bar Chart */}
        <motion.div variants={itemVariants}>
          <div className="card glass border border-white/6 bg-white/3 shadow-lg">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Statistiques mensuelles
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Bar dataKey="défunts" fill="#8B5CF6" />
                  <Bar dataKey="inhumations" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Cemetery Occupancy */}
        <motion.div variants={itemVariants}>
          <div className="card glass border border-white/6 bg-white/3 shadow-lg">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Occupation du cimetière
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {occupancyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    layout="horizontal"
                    wrapperStyle={{ color: '#fff' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-white">
                  {dashboardData?.statistics?.total_trous ? 
                    Math.round(((dashboardData.statistics.total_trous - dashboardData.statistics.trous_disponibles) / dashboardData.statistics.total_trous) * 100) : 0}%
                </div>
                <div className="text-sm text-neutral-400">Taux d'occupation</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bars Chart */}
      <motion.div variants={itemVariants}>
        <div className="card glass border border-white/6 bg-white/3 shadow-lg">
          <div className="card-body p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Répartitions détaillées
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#fff" />
                <YAxis dataKey="name" type="category" stroke="#fff" width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <div className="card glass border border-white/6 bg-white/3 shadow-lg">
          <div className="card-body p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activité récente
            </h3>
            <div className="space-y-3">
              {dashboardData?.recent_transactions?.map((transaction: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.status === 'Validé' ? 'bg-green-400' : 'bg-yellow-400'
                    }`}></div>
                    <div>
                      <div className="text-sm font-medium text-white">{transaction.type}</div>
                      <div className="text-xs text-neutral-400">{transaction.user}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-neutral-400">{transaction.date}</div>
                    <div className={`badge badge-xs ${statusBadge[transaction.status] || 'badge-neutral'}`}>
                      {transaction.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

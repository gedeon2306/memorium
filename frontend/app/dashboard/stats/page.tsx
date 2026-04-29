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
  Cuboid,
  User,
  PackageOpen,
  Download,
  BarChart3,
  PieChart,
  Activity,
  Users,
  MapPin,
  DollarSign,
  CreditCard,
  TrendingUp as TrendingUpIcon,
  Wallet,
} from "lucide-react";
import { dashboard, getStats } from "@/app/actions/actions";
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
} from "recharts";

import type { PieLabelRenderProps } from "recharts";

interface ChartEntry {
  name: string;
  value: number;
  color: string;
}

interface ProgressEntry {
  name: string;
  value: number;
  fill: string;
  originalValue: number;
  total: number;
}

interface Transaction {
  type: string;
  user: string;
  date: string;
  status: string;
}

const statusBadge: Record<string, string> = {
  Validé: "badge-success",
  "En cours": "badge-warning",
  Annulé: "badge-error",
};

const renderCustomLabel = ({ name, percent }: PieLabelRenderProps): string => {
  const label = name ?? "";
  const pct = percent !== undefined ? (percent * 100).toFixed(0) : "0";
  return `${label} ${pct}%`;
};

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30j");
  const [isMobile, setIsMobile] = useState(false);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  };

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const dashboardResult = await dashboard();
        if (dashboardResult?.error) {
          setError(dashboardResult.error);
          return;
        }

        const statsResult = await getStats(selectedPeriod);
        if (statsResult?.error) {
          setError(statsResult.error);
          return;
        }

        setDashboardData(dashboardResult);
        setStatsData(statsResult);
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardResult = await dashboard();
      if (dashboardResult?.error) {
        setError(dashboardResult.error);
        return;
      }

      const statsResult = await getStats(selectedPeriod);
      if (statsResult?.error) {
        setError(statsResult.error);
        return;
      }

      setDashboardData(dashboardResult);
      setStatsData(statsResult);
    } catch (err) {
      setError("Une erreur est survenue lors du rafraîchissement");
    } finally {
      setLoading(false);
    }
  };

  const generateCards = () => {
    if (!dashboardData?.statistics) return [];

    const stats = dashboardData.statistics;
    const financialStats = statsData?.financial_stats;

    const cards = [
      { label: "Défunts", value: stats.total_defunts.toString(), icon: Bird, color: "text-rose-400", bg: "bg-rose-400/10" },
      { label: "Trous totaux", value: stats.total_trous.toString(), icon: Cuboid, color: "text-amber-400", bg: "bg-amber-400/10" },
      { label: "Trous disponibles", value: stats.trous_disponibles.toString(), icon: PackageOpen, color: "text-sky-400", bg: "bg-sky-400/10" },
      { label: "Utilisateurs", value: stats.total_users.toString(), icon: User, color: "text-violet-400", bg: "bg-violet-400/10" },
    ];

    if (financialStats) {
      cards.push(
        {
          label: "Revenus totaux",
          value: `${financialStats.total_revenus.toFixed(2)}F`,
          icon: DollarSign,
          color: "text-green-400",
          bg: "bg-green-400/10",
        },
        {
          label: "Nb. Paiements",
          value: financialStats.nombre_paiements.toString(),
          icon: CreditCard,
          color: "text-blue-400",
          bg: "bg-blue-400/10",
        },
        {
          label: "Panier moyen",
          value: `${financialStats.montant_moyen.toFixed(2)}F`,
          icon: Wallet,
          color: "text-purple-400",
          bg: "bg-purple-400/10",
        }
      );
    }

    return cards;
  };

  const generateGenderData = (): ChartEntry[] => {
    if (!statsData?.gender_stats) return [];
    return statsData.gender_stats.map((item: ChartEntry) => ({
      ...item,
      color: item.name === "Masculin" ? "#60A5FA" : "#F472B6",
    }));
  };

  const generateAgeData = (): ChartEntry[] => {
    if (!statsData?.age_stats) return [];
    return statsData.age_stats.map((item: ChartEntry) => ({
      ...item,
      color: item.name === "Majeurs (18+)" ? "#34D399" : "#FB923C",
    }));
  };

  const generateMonthlyData = () => {
    if (!statsData?.monthly_stats) return [];
    return statsData.monthly_stats;
  };

  const generateOccupancyData = (): ChartEntry[] => {
    if (!statsData?.occupancy_stats) return [];
    return statsData.occupancy_stats.map((item: ChartEntry) => ({
      ...item,
      color: item.name === "Occupés" ? "#EF4444" : "#10B981",
    }));
  };

  const generateProgressData = (): ProgressEntry[] => {
    if (!statsData?.progress_data) return [];

    return statsData.progress_data.map((item: any) => {
      const percentage = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;

      let fill = "#3B82F6";
      if (item.name === "Trous occupés") fill = "#3B82F6";
      else if (item.name === "Défunts Masculins") fill = "#10B981";
      else if (item.name === "Défunts Féminins") fill = "#F59E0B";
      else if (item.name === "Défunts Majeurs") fill = "#EF4444";
      else if (item.name === "Défunts Mineurs") fill = "#06B6D4";

      return {
        name: `${item.name} (${item.value}/${item.total})`,
        value: percentage,
        fill,
        originalValue: item.value,
        total: item.total,
      };
    });
  };

  const generatePaymentData = (): ChartEntry[] => {
    if (!statsData?.financial_stats?.paiement_stats) return [];

    const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

    return statsData.financial_stats.paiement_stats.map((item: any, index: number) => ({
      ...item,
      color: colors[index % colors.length],
    }));
  };

  const generateRevenueMonthlyData = () => {
    if (!statsData?.financial_stats?.revenue_monthly_stats) return [];
    return statsData.financial_stats.revenue_monthly_stats;
  };

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 w-full"
      >
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
            <button onClick={handleRefresh} className="btn btn-primary btn-sm">
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
  const paymentData = generatePaymentData();
  const revenueMonthlyData = generateRevenueMonthlyData();

  // Responsive values
  const chartHeight = isMobile ? 200 : 250;
  const progressChartHeight = isMobile ? 240 : 300;
  const yAxisWidth = isMobile ? 50 : 185;
  const yAxisFontSize = isMobile ? 9 : 11;  

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
                    <div className="text-2xl sm:text-3xl font-bold text-white truncate">{card.value}</div>
                    <div className="text-xs sm:text-sm text-neutral-400 mt-1">{card.label}</div>
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
            <div className="card-body p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Répartition par genre
              </h3>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <RePieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={isMobile ? 65 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry: ChartEntry, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Age Distribution Donut Chart */}
        <motion.div variants={itemVariants}>
          <div className="card glass border border-white/6 bg-white/3 shadow-lg">
            <div className="card-body p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Répartition par âge
              </h3>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <RePieChart>
                  <Pie
                    data={ageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 45 : 60}
                    outerRadius={isMobile ? 65 : 80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ageData.map((entry: ChartEntry, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    wrapperStyle={{ color: "#fff", fontSize: isMobile ? "11px" : "13px" }}
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
            <div className="card-body p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Statistiques mensuelles
              </h3>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={monthlyData}
                  margin={{ top: 5, right: 10, left: -20, bottom: isMobile ? 20 : 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="month"
                    stroke="#fff"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={isMobile ? -35 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 45 : 30}
                  />
                  <YAxis stroke="#fff" tick={{ fontSize: 11 }} width={28} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#fff", fontSize: isMobile ? "11px" : "13px" }}
                  />
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
            <div className="card-body p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Occupation du cimetière
              </h3>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <RePieChart>
                  <Pie
                    data={occupancyData}
                    cx="50%"
                    cy="50%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={isMobile ? 45 : 60}
                    outerRadius={isMobile ? 65 : 80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {occupancyData.map((entry: ChartEntry, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    layout="horizontal"
                    wrapperStyle={{ color: "#fff", fontSize: isMobile ? "11px" : "13px" }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center">
                <div className="text-2xl font-bold text-white">
                  {dashboardData?.statistics?.total_trous
                    ? Math.round(
                        ((dashboardData.statistics.total_trous - dashboardData.statistics.trous_disponibles) /
                          dashboardData.statistics.total_trous) *
                          100
                      )
                    : 0}
                  %
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
          <div className="card-body p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Répartitions détaillées
            </h3>
            <ResponsiveContainer width="100%" height={progressChartHeight}>
              <BarChart
                data={progressData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: isMobile ? 10 : 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  type="number"
                  stroke="#fff"
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#fff"
                  width={yAxisWidth}
                  tick={{ fontSize: yAxisFontSize, fill: "#fff" }}
                  tickFormatter={(value: string) =>
                    isMobile && value.length > 14 ? value.slice(0, 14) + "…" : value
                  }
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                  formatter={(value: unknown) => [`${value}%`, "Pourcentage"]}
                />
                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                  {progressData.map((entry: ProgressEntry, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Financial Charts Section */}
      {paymentData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Methods Pie Chart */}
          <motion.div variants={itemVariants}>
            <div className="card glass border border-white/6 bg-white/3 shadow-lg">
              <div className="card-body p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Répartition des moyens de paiement
                </h3>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <RePieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={isMobile ? 65 : 80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentData.map((entry: ChartEntry, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }}
                      labelStyle={{ color: "#fff" }}
                      formatter={(value: unknown) => [`${value} FCFA`, "Montant"]}
                    />
                    <Legend
                      wrapperStyle={{ color: "#fff", fontSize: isMobile ? "11px" : "13px" }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>

          {/* Revenue Monthly Chart */}
          <motion.div variants={itemVariants}>
            <div className="card glass border border-white/6 bg-white/3 shadow-lg">
              <div className="card-body p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5" />
                  Revenus mensuels
                </h3>
                <ResponsiveContainer width="100%" height={chartHeight}>
                  <BarChart
                    data={revenueMonthlyData}
                    margin={{ top: 5, right: 10, left: -20, bottom: isMobile ? 20 : 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="month"
                      stroke="#fff"
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={isMobile ? -35 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 45 : 30}
                    />
                    <YAxis stroke="#fff" tick={{ fontSize: 11 }} width={28} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "none", borderRadius: "8px" }}
                      labelStyle={{ color: "#fff" }}
                      formatter={(value: unknown) => [`${value} FCFA`, "Revenus"]}
                    />
                    <Legend
                      wrapperStyle={{ color: "#fff", fontSize: isMobile ? "11px" : "13px" }}
                    />
                    <Bar dataKey="revenus" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <div className="card glass border border-white/6 bg-white/3 shadow-lg">
          <div className="card-body p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activité récente
            </h3>
            <div className="space-y-3">
              {dashboardData?.recent_transactions?.map((transaction: Transaction, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-2 h-2 shrink-0 rounded-full ${
                        transaction.status === "Validé" ? "bg-green-400" : "bg-yellow-400"
                      }`}
                    ></div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">{transaction.type}</div>
                      <div className="text-xs text-neutral-400 truncate">{transaction.user}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-xs text-neutral-400">{transaction.date}</div>
                    <div className={`badge badge-xs ${statusBadge[transaction.status] ?? "badge-neutral"}`}>
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
"use client";

import { motion } from "framer-motion";
import { 
  HelpCircle, 
  Book, 
  Phone, 
  Mail, 
  Users, 
  CreditCard, 
  Map, 
  ChartSpline, 
  Settings, 
  Shield,
  ChevronRight,
  ExternalLink,
  Search,
  FileText,
  Video,
  MessageCircle
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const helpSections = [
    {
      id: "getting-started",
      title: "Premiers pas",
      icon: Book,
      color: "text-blue-400",
      items: [
        {
          title: "Connexion à l'application",
          description: "Comment vous connecter avec vos identifiants",
          content: "Utilisez votre email et mot de passe pour vous connecter. Si vous avez oublié votre mot de passe, utilisez le lien 'Mot de passe oublié'."
        },
        {
          title: "Navigation dans le tableau de bord",
          description: "Comprendre l'interface principale",
          content: "Le tableau de bord vous donne une vue d'ensemble avec les statistiques principales et un accès rapide à toutes les fonctionnalités."
        },
        {
          title: "Configuration de votre profil",
          description: "Personnaliser vos informations",
          content: "Accédez à la section Profil pour mettre à jour votre photo, nom et autres informations personnelles."
        }
      ]
    },
    {
      id: "defunts",
      title: "Gestion des défunts",
      icon: Users,
      color: "text-purple-400",
      items: [
        {
          title: "Ajouter un défunt",
          description: "Comment enregistrer une nouvelle personne décédée",
          content: "Cliquez sur 'Nouveau défunt' dans la section Défunts. Remplissez toutes les informations requises : nom, prénom, dates, etc."
        },
        {
          title: "Modifier les informations",
          description: "Mettre à jour les données d'un défunt",
          content: "Sélectionnez le défunt dans la liste, puis cliquez sur 'Modifier' pour changer ses informations."
        },
        {
          title: "Gestion des photos",
          description: "Ajouter et gérer les photos des défunts",
          content: "Vous pouvez télécharger une photo pour chaque défunt. Les images sont optimisées automatiquement."
        },
        {
          title: "Association avec les familles",
          description: "Lier les défunts à leurs familles",
          content: "Dans la fiche du défunt, vous pouvez sélectionner la famille correspondante dans la liste déroulante."
        }
      ]
    },
    {
      id: "familles",
      title: "Gestion des familles",
      icon: Users,
      color: "text-green-400",
      items: [
        {
          title: "Créer une famille",
          description: "Enregistrer une nouvelle famille",
          content: "Allez dans la section Familles et cliquez sur 'Nouvelle famille'. Saisissez les informations de contact et du garant."
        },
        {
          title: "Coordonnées et contact",
          description: "Gérer les informations de contact",
          content: "Maintenez à jour les téléphones, emails et adresses pour pouvoir contacter les familles rapidement."
        },
        {
          title: "Profession du garant",
          description: "Importance de cette information",
          content: "La profession du garant est nécessaire pour la facturation et les documents administratifs."
        }
      ]
    },
    {
      id: "paiements",
      title: "Gestion des paiements",
      icon: CreditCard,
      color: "text-yellow-400",
      items: [
        {
          title: "Créer une facture",
          description: "Générer une nouvelle facture",
          content: "Dans la section Paiements, cliquez sur 'Nouveau paiement'. Sélectionnez le défunt et la famille concernés."
        },
        {
          title: "Suivi des paiements",
          description: "Consultez l'historique et le statut",
          content: "La liste des paiements montre le statut : Validé, En cours ou Annulé. Filtrez par date ou statut."
        },
        {
          title: "Moyens de paiement",
          description: "Types de paiement acceptés",
          content: "Enregistrez le moyen de paiement utilisé : carte bancaire, chèque, espèces ou virement."
        },
        {
          title: "Export des factures",
          description: "Télécharger les factures en PDF",
          content: "Chaque facture peut être exportée en PDF pour l'envoi aux familles ou l'archivage."
        }
      ]
    },
    {
      id: "cartes",
      title: "Cartes et plan",
      icon: Map,
      color: "text-red-400",
      items: [
        {
          title: "Vue cartographique",
          description: "Navigation sur le plan du cimetière",
          content: "La section Cartes vous permet de visualiser l'ensemble du cimetière et de localiser les emplacements."
        },
        {
          title: "Gestion des emplacements",
          description: "Attribuer et gérer les places",
          content: "Cliquez sur une place pour voir les détails ou l'attribuer à un défunt."
        },
        {
          title: "Recherche sur la carte",
          description: "Trouver rapidement un emplacement",
          content: "Utilisez la recherche pour trouver un défunt ou une famille directement sur la carte."
        }
      ]
    },
    {
      id: "stats",
      title: "Statistiques",
      icon: ChartSpline,
      color: "text-indigo-400",
      items: [
        {
          title: "Vue d'ensemble",
          description: "Statistiques principales",
          content: "Le tableau de bord affiche le nombre total de défunts, familles, et paiements par période."
        },
        {
          title: "Rapports détaillés",
          description: "Analyser les tendances",
          content: "Générez des rapports sur les inhumations, incinérations et revenus par mois/année."
        },
        {
          title: "Export de données",
          description: "Télécharger les statistiques",
          content: "Exportez les données en CSV ou PDF pour des analyses externes ou présentations."
        }
      ]
    },
    {
      id: "users",
      title: "Gestion des utilisateurs",
      icon: Shield,
      color: "text-orange-400",
      items: [
        {
          title: "Rôles et permissions",
          description: "Comprendre les différents rôles",
          content: "Administrateur : accès complet. Assistant : gestion limitée. Testeur : consultation uniquement."
        },
        {
          title: "Créer un utilisateur",
          description: "Ajouter un nouvel utilisateur",
          content: "Seul un administrateur peut créer de nouveaux comptes utilisateurs."
        },
        {
          title: "Sécurité",
          description: "Bonnes pratiques de sécurité",
          content: "Utilisez des mots de passe forts, activez la double authentification quand disponible."
        }
      ]
    },
    {
      id: "settings",
      title: "Paramètres",
      icon: Settings,
      color: "text-gray-400",
      items: [
        {
          title: "Configuration générale",
          description: "Paramètres de l'application",
          content: "Personnalisez les informations du cimetière, tarifs et autres paramètres généraux."
        },
        {
          title: "Sauvegarde des données",
          description: "Protection de vos informations",
          content: "Configurez les sauvegardes automatiques et manuelles de votre base de données."
        }
      ]
    }
  ];

  const supportOptions = [
    {
      icon: Phone,
      title: "Support téléphonique",
      description: "Lun-Ven, 9h-18h",
      action: "Appelez notre équipe",
      contact: "+242 06 999 42 13"
    },
    {
      icon: Mail,
      title: "Support email",
      description: "Réponse sous 24h",
      action: "Envoyez-nous un message",
      contact: "jihreldev@gmail.com"
    },
    {
      icon: MessageCircle,
      title: "Chat en direct",
      description: "Bientôt disponible",
      action: "Discutez avec un conseiller",
      contact: "Via l'application"
    }
  ];

  const filteredSections = helpSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.items.some(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <HelpCircle className="w-8 h-8" />
          Centre d'aide
        </h1>
        <p className="mt-2 text-base text-neutral-400">
          Documentation complète et support pour l'application Mémorium
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="card glass border border-white/6 bg-white/3 shadow-lg">
        <div className="card-body p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher dans l'aide..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Sections d'aide */}
      <div className="grid gap-4">
        {filteredSections.map((section, index) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;
          
          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card glass border border-white/6 bg-white/3 shadow-lg overflow-hidden"
            >
              <div 
                className="card-body p-6 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedSection(isExpanded ? null : section.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-white/5 ${section.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{section.title}</h3>
                      <p className="text-sm text-neutral-400">{section.items.length} articles</p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 text-neutral-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </div>
              
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-white/10"
                >
                  <div className="p-6 space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-white/3 rounded-lg p-4">
                        <h4 className="font-medium text-white mb-1">{item.title}</h4>
                        <p className="text-sm text-neutral-400 mb-2">{item.description}</p>
                        <p className="text-sm text-neutral-300">{item.content}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Support */}
      <div className="card glass border border-white/6 bg-white/3 shadow-lg">
        <div className="card-body p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Support technique
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white/3 rounded-lg p-4 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">{option.title}</h3>
                      <p className="text-sm text-neutral-400 mb-2">{option.description}</p>
                      <p className="text-sm text-blue-400">{option.contact}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ressources additionnelles */}
      <div className="card glass border border-white/6 bg-white/3 shadow-lg">
        <div className="card-body p-6">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Ressources additionnelles
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <motion.a
              // href="/docs/user-guide"
              // target="_blank"
              onClick={()=>toast.error("Bientôt disponible")}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0 }}
              className="flex items-center justify-between p-4 bg-white/3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Book className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-medium text-white">Guide utilisateur complet</h3>
                  <p className="text-sm text-neutral-400">Documentation détaillée PDF</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            </motion.a>

            <motion.a
              // href="/tutorials"
              // target="_blank"
              onClick={()=>toast.error("Bientôt disponible")}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center justify-between p-4 bg-white/3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="font-medium text-white">Tutoriels vidéo</h3>
                  <p className="text-sm text-neutral-400">Guides pas à pas</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            </motion.a>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card glass border border-white/6 bg-white/3 shadow-lg">
        <div className="card-body p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Questions fréquentes</h2>
          
          <div className="space-y-4">
            <div className="bg-white/3 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Comment exporter des données ?</h3>
              <p className="text-sm text-neutral-300">
                Allez dans la section Statistiques, cliquez sur "Exporter" et choisissez le format (CSV ou PDF).
              </p>
            </div>
            
            <div className="bg-white/3 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Puis-je accéder à Mémorium sur mobile ?</h3>
              <p className="text-sm text-neutral-300">
                Oui, l'application est entièrement responsive et fonctionne sur tous les appareils mobiles.
              </p>
            </div>
            
            <div className="bg-white/3 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">Mes données sont-elles sécurisées ?</h3>
              <p className="text-sm text-neutral-300">
                Oui, toutes les données sont chiffrées et sauvegardées régulièrement. L'accès est protégé par authentification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

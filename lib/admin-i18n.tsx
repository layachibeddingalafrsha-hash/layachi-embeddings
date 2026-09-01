// Admin dashboard internationalization (French / English)
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type Locale = "fr" | "en";

const translations: Record<Locale, Record<string, string>> = {
  fr: {
    // Sidebar
    "sidebar.adminPanel": "Panneau Admin",
    "sidebar.mainMenu": "Menu Principal",
    "sidebar.dashboard": "Tableau de Bord",
    "sidebar.products": "Produits",
    "sidebar.orders": "Commandes",
    "sidebar.expedited": "Expéditions",
    "sidebar.shipping": "Livraison",
    "sidebar.messages": "Messages",
    "sidebar.pages": "Pages",
    "sidebar.backToStore": "Retour à la Boutique",

    // Header
    "header.welcome": "Bienvenue 👋",
    "header.subtitle": "Voici ce qui se passe dans votre boutique aujourd'hui.",
    "header.toggleMenu": "Basculer le menu",
    "header.notifications": "Notifications",
    "header.signOut": "Déconnexion",
    "header.admin": "Admin",

    // Dashboard page
    "dashboard.title": "Tableau de Bord",
    "dashboard.subtitle": "Aperçu de votre boutique en un coup d'œil",
    "dashboard.totalRevenue": "Revenu Total",
    "dashboard.totalOrders": "Total Commandes",
    "dashboard.products": "Produits",
    "dashboard.messages": "Messages",
    "dashboard.today": "Aujourd'hui",
    "dashboard.pending": "En attente",
    "dashboard.stockUnits": "Stock: {0} unités",
    "dashboard.unreadMessages": "Messages non lus",
    "dashboard.outOfStock": "Rupture de Stock",
    "dashboard.lowStock": "Stock Faible (< 5)",
    "dashboard.activeBundles": "Offres Actives",
    "dashboard.revenueTrend": "Tendance du Revenu",
    "dashboard.last30Days": "30 derniers jours",
    "dashboard.revenue": "Revenu",
    "dashboard.noRevenueData": "Pas encore de données de revenu",
    "dashboard.orderStatus": "Statut des Commandes",
    "dashboard.distributionOverview": "Aperçu de la distribution",
    "dashboard.noOrders": "Pas encore de commandes",
    "dashboard.topProducts": "Meilleurs Produits",
    "dashboard.bySalesCount": "Par nombre de ventes",
    "dashboard.viewAll": "Voir tout",
    "dashboard.noProducts": "Pas encore de produits",
    "dashboard.sold": "vendus",
    "dashboard.recentOrders": "Commandes Récentes",
    "dashboard.latestOrders": "Dernières commandes entrantes",
    "dashboard.customer": "Client",
    "dashboard.wilaya": "Wilaya",
    "dashboard.total": "Total",
    "dashboard.status": "Statut",
    "dashboard.date": "Date",

    // Orders page
    "orders.title": "Commandes",
    "orders.totalOrders": "commandes au total",
    "orders.searchPlaceholder": "Rechercher par nom, téléphone...",
    "orders.allStatuses": "Tous les Statuts",
    "orders.loading": "Chargement...",
    "orders.noOrders": "Aucune commande trouvée",
    "orders.customer": "Client",
    "orders.location": "Localisation",
    "orders.delivery": "Livraison",
    "orders.items": "Articles",
    "orders.total": "Total",
    "orders.status": "Statut",
    "orders.tracking": "Suivi",
    "orders.date": "Date",
    "orders.actions": "Actions",
    "orders.home": "Domicile",
    "orders.desk": "Bureau",
    "orders.sendToDelivery": "Envoyer en livraison",
    "orders.sendNToDelivery": "Envoyer {0} en livraison",
    "orders.confirm": "Confirmer",
    "orders.cancel": "Annuler",
    "orders.delete": "Supprimer",
    "orders.viewEdit": "Voir/Modifier",
    "orders.newOrder": "+ Nouvelle Commande",
    "orders.previous": "Précédent",
    "orders.next": "Suivant",
    "orders.page": "Page",
    "orders.of": "sur",
    "orders.orderDetails": "Détails de la Commande",
    "orders.editOrder": "Modifier la Commande",
    "orders.edit": "Modifier",
    "orders.deliveryTracking": "Suivi de Livraison",
    "orders.sending": "Envoi...",
    "orders.customerInfo": "Informations Client",
    "orders.name": "Nom",
    "orders.phone": "Téléphone",
    "orders.wilaya": "Wilaya",
    "orders.commune": "Commune",
    "orders.address": "Adresse",
    "orders.deliveryType": "Type de Livraison",
    "orders.stopDesk": "Point relais",
    "orders.notes": "Notes",
    "orders.subtotal": "Sous-total",
    "orders.bundleDiscount": "Réduction Bundle",
    "orders.shipping": "Livraison",
    "orders.trackingNumber": "Numéro de Suivi",
    "orders.saving": "Enregistrement...",
    "orders.saveChanges": "Enregistrer",
    "orders.cancelOrder": "Annuler la Commande",
    "orders.reason": "Raison",
    "orders.clientCancelledByPhone": "Client a annulé par téléphone",
    "orders.clientDidNotRespond": "Client n'a pas répondu",
    "orders.other": "Autre",
    "orders.confirmCancellation": "Confirmer l'Annulation",
    "orders.creating": "Création...",
    "orders.createOrder": "Créer la Commande",
    "orders.selectWilaya": "Sélectionner la wilaya",
    "orders.selectCommune": "Sélectionner la commune",
    "orders.selectProduct": "Sélectionner le produit",
    "orders.addItem": "+ Ajouter un Article",
    "orders.orderCreated": "Commande créée",
    "orders.orderUpdated": "Commande mise à jour",
    "orders.orderDeleted": "Commande supprimée",
    "orders.statusUpdated": "Statut mis à jour",
    "orders.fillRequired": "Remplissez tous les champs requis",
    "orders.addOneItem": "Ajoutez au moins un article",
    "orders.deleteConfirm": "Supprimer cette commande définitivement ?",

    // Products page
    "products.title": "Produits",
    "products.searchPlaceholder": "Rechercher des produits...",
    "products.newProduct": "+ Nouveau Produit",
    "products.previous": "Précédent",
    "products.next": "Suivant",
    "products.noProducts": "Aucun produit trouvé",

    // Shipping page
    "shipping.title": "Tarifs de Livraison",
    "shipping.searchPlaceholder": "Rechercher une wilaya...",

    // Common
    "common.save": "Enregistrer",
    "common.cancel": "Annuler",
    "common.close": "Fermer",
    "common.loading": "Chargement...",
    "common.error": "Erreur",
    "common.success": "Succès",
    "common.DZD": "DZD",

    // Pages editor
    "pages.title": "Gestion des Pages",
    "pages.subtitle": "Modifier le contenu des pages statiques en arabe et français",
    "pages.selectPage": "Sélectionner une Page",
    "pages.save": "Enregistrer",
    "pages.saving": "Enregistrement...",
    "pages.saved": "Enregistré ✓",
    "pages.preview": "Aperçu",
    "pages.edit": "Modifier",
    "pages.previewLang": "Langue d'aperçu",
    "pages.selectPagePrompt": "Sélectionnez une page à modifier",
  },
  en: {
    // Sidebar
    "sidebar.adminPanel": "Admin Panel",
    "sidebar.mainMenu": "Main Menu",
    "sidebar.dashboard": "Dashboard",
    "sidebar.products": "Products",
    "sidebar.orders": "Orders",
    "sidebar.expedited": "Expedited",
    "sidebar.shipping": "Shipping",
    "sidebar.messages": "Messages",
    "sidebar.pages": "Pages",
    "sidebar.backToStore": "Back to Store",

    // Header
    "header.welcome": "Welcome back 👋",
    "header.subtitle": "Here's what's happening with your store today.",
    "header.toggleMenu": "Toggle menu",
    "header.notifications": "Notifications",
    "header.signOut": "Sign out",
    "header.admin": "Admin",

    // Dashboard page
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Your store overview at a glance",
    "dashboard.totalRevenue": "Total Revenue",
    "dashboard.totalOrders": "Total Orders",
    "dashboard.products": "Products",
    "dashboard.messages": "Messages",
    "dashboard.today": "Today",
    "dashboard.pending": "Pending",
    "dashboard.stockUnits": "Stock: {0} units",
    "dashboard.unreadMessages": "Unread inbox messages",
    "dashboard.outOfStock": "Out of Stock",
    "dashboard.lowStock": "Low Stock (< 5)",
    "dashboard.activeBundles": "Active Bundles",
    "dashboard.revenueTrend": "Revenue Trend",
    "dashboard.last30Days": "Last 30 days",
    "dashboard.revenue": "Revenue",
    "dashboard.noRevenueData": "No revenue data yet",
    "dashboard.orderStatus": "Order Status",
    "dashboard.distributionOverview": "Distribution overview",
    "dashboard.noOrders": "No orders yet",
    "dashboard.topProducts": "Top Products",
    "dashboard.bySalesCount": "By sales count",
    "dashboard.viewAll": "View all",
    "dashboard.noProducts": "No products yet",
    "dashboard.sold": "sold",
    "dashboard.recentOrders": "Recent Orders",
    "dashboard.latestOrders": "Latest incoming orders",
    "dashboard.customer": "Customer",
    "dashboard.wilaya": "Wilaya",
    "dashboard.total": "Total",
    "dashboard.status": "Status",
    "dashboard.date": "Date",

    // Orders page
    "orders.title": "Orders",
    "orders.totalOrders": "total orders",
    "orders.searchPlaceholder": "Search by name, phone...",
    "orders.allStatuses": "All Statuses",
    "orders.loading": "Loading...",
    "orders.noOrders": "No orders found",
    "orders.customer": "Customer",
    "orders.location": "Location",
    "orders.delivery": "Delivery",
    "orders.items": "Items",
    "orders.total": "Total",
    "orders.status": "Status",
    "orders.tracking": "Tracking",
    "orders.date": "Date",
    "orders.actions": "Actions",
    "orders.home": "Home",
    "orders.desk": "Desk",
    "orders.sendToDelivery": "Send to Delivery",
    "orders.sendNToDelivery": "Send {0} to Delivery",
    "orders.confirm": "Confirm",
    "orders.cancel": "Cancel",
    "orders.delete": "Delete",
    "orders.viewEdit": "View/Edit",
    "orders.newOrder": "+ New Order",
    "orders.previous": "Previous",
    "orders.next": "Next",
    "orders.page": "Page",
    "orders.of": "of",
    "orders.orderDetails": "Order Details",
    "orders.editOrder": "Edit Order",
    "orders.edit": "Edit",
    "orders.deliveryTracking": "Delivery Tracking",
    "orders.sending": "Sending...",
    "orders.customerInfo": "Customer Information",
    "orders.name": "Name",
    "orders.phone": "Phone",
    "orders.wilaya": "Wilaya",
    "orders.commune": "Commune",
    "orders.address": "Address",
    "orders.deliveryType": "Delivery Type",
    "orders.stopDesk": "Stop-Desk",
    "orders.notes": "Notes",
    "orders.subtotal": "Subtotal",
    "orders.bundleDiscount": "Bundle Discount",
    "orders.shipping": "Shipping",
    "orders.trackingNumber": "Tracking Number",
    "orders.saving": "Saving...",
    "orders.saveChanges": "Save Changes",
    "orders.cancelOrder": "Cancel Order",
    "orders.reason": "Reason",
    "orders.clientCancelledByPhone": "Client Cancelled by Phone",
    "orders.clientDidNotRespond": "Client Did Not Respond",
    "orders.other": "Other",
    "orders.confirmCancellation": "Confirm Cancellation",
    "orders.creating": "Creating...",
    "orders.createOrder": "Create Order",
    "orders.selectWilaya": "Select wilaya",
    "orders.selectCommune": "Select commune",
    "orders.selectProduct": "Select product",
    "orders.addItem": "+ Add Item",
    "orders.orderCreated": "Order created",
    "orders.orderUpdated": "Order updated successfully",
    "orders.orderDeleted": "Order deleted",
    "orders.statusUpdated": "Order status updated to",
    "orders.fillRequired": "Fill all required fields",
    "orders.addOneItem": "Add at least one item",
    "orders.deleteConfirm": "Delete this order permanently?",

    // Products page
    "products.title": "Products",
    "products.searchPlaceholder": "Search products...",
    "products.newProduct": "+ New Product",
    "products.previous": "Previous",
    "products.next": "Next",
    "products.noProducts": "No products found",

    // Shipping page
    "shipping.title": "Shipping Rates",
    "shipping.searchPlaceholder": "Search wilayas...",

    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.close": "Close",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.DZD": "DZD",

    // Pages editor
    "pages.title": "Page Management",
    "pages.subtitle": "Edit static page content in Arabic and French",
    "pages.selectPage": "Select a Page",
    "pages.save": "Save",
    "pages.saving": "Saving...",
    "pages.saved": "Saved ✓",
    "pages.preview": "Preview",
    "pages.edit": "Edit",
    "pages.previewLang": "Preview language",
    "pages.selectPagePrompt": "Select a page to edit",
  },
};

interface AdminI18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, ...args: (string | number)[]) => string;
}

const AdminI18nContext = createContext<AdminI18nContextType>({
  locale: "fr",
  setLocale: () => {},
  t: (key: string) => key,
});

export function AdminI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin_locale") as Locale;
    if (saved) {
      setLocale(saved);
    }
    setMounted(true);
  }, []);

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_locale", newLocale);
    }
  }, []);

  const t = useCallback(
    (key: string, ...args: (string | number)[]) => {
      let text = translations[locale]?.[key] || translations["en"]?.[key] || key;
      // Replace {0}, {1}, etc. placeholders
      args.forEach((arg, i) => {
        text = text.replace(`{${i}}`, String(arg));
      });
      return text;
    },
    [locale]
  );

  if (!mounted) {
    return null;
  }

  return (
    <AdminI18nContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </AdminI18nContext.Provider>
  );
}

export function useAdminI18n() {
  return useContext(AdminI18nContext);
}

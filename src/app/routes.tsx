import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { DomesticTravelPage } from "./pages/DomesticTravelPage";
import { InternationalTravelPage } from "./pages/InternationalTravelPage";
import { PackageDetailPage } from "./pages/PackageDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CustomPackagePage } from "./pages/CustomPackagePage";
import { MenuPage } from "./pages/MenuPage";
import { CompaniesListPage } from "./pages/CompaniesListPage";
import { TravelOffersPage } from "./pages/TravelOffersPage";
import { NotFound } from "./pages/NotFound";

// Super Admin Panel
import AdminApp from "./components/admin/AdminApp";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPackages from "./pages/admin/Packages";
import AdminUsers from "./pages/admin/Users";
import AdminCompanies from "./pages/admin/Companies";
import AdminBookings from "./pages/admin/Bookings";
import AdminRevenue from "./pages/admin/Revenue";
import AdminLogin from "./pages/admin/Login";
import AdminAccounts from "./pages/admin/AdminAccounts";
import AdminTravelOffers from "./pages/admin/TravelOffers";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "domestic-travel", Component: DomesticTravelPage },
      { path: "international-travel", Component: InternationalTravelPage },
      { path: "package/:type/:id", Component: PackageDetailPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "custom-package", Component: CustomPackagePage },
      { path: "menu", Component: MenuPage },
      { path: "companies", Component: CompaniesListPage },
      { path: "travel-offers", Component: TravelOffersPage },
      { path: "*", Component: NotFound },
    ],
  },
  // Super Admin Panel
  {
    path: "/admin",
    Component: AdminApp,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "packages", Component: AdminPackages },
      { path: "users", Component: AdminUsers },
      { path: "companies", Component: AdminCompanies },
      { path: "bookings", Component: AdminBookings },
      { path: "revenue", Component: AdminRevenue },
      { path: "admin-accounts", Component: AdminAccounts },
      { path: "travel-offers", Component: AdminTravelOffers },
    ],
  },
  {
    path: "/admin/login",
    Component: AdminLogin,
  },
]);

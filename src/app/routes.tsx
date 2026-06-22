import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { DomesticTravelPage } from "./pages/DomesticTravelPage";
import { InternationalTravelPage } from "./pages/InternationalTravelPage";
import { PackageDetailPage } from "./pages/PackageDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CustomPackagePage } from "./pages/CustomPackagePage";
import { NotFound } from "./pages/NotFound";
import { AdminPage } from "./pages/AdminPage";
import AdminApp from "./components/admin/AdminApp";
import AdminDashboard from "./pages/admin/Dashboard";

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
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/admin",
    Component: AdminApp,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "packages", Component: AdminPage },
    ],
  },
]);

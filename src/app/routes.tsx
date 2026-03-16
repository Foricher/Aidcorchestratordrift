import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Device } from "./pages/setup/Device";
import { ComplianceRules } from "./pages/setup/ComplianceRules";
import { ComplianceStatus } from "./pages/ComplianceStatus";
import { History } from "./pages/History";
import { Dashboard } from "./pages/Dashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "setup/device", Component: Device },
      { path: "setup/compliance-rules", Component: ComplianceRules },
      { path: "compliance-status", Component: ComplianceStatus },
      { path: "history", Component: History },
    ],
  },
]);

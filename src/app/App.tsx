import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ComplianceRulesProvider } from "./context/ComplianceRulesContext";

export default function App() {
  return (
    <ComplianceRulesProvider>
      <RouterProvider router={router} />
    </ComplianceRulesProvider>
  );
}

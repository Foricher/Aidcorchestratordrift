import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ComplianceRulesProvider } from "./context/ComplianceRulesContext";
import { DeviceProvider } from "./context/DeviceContext";
import { RemediationProvider } from "./context/RemediationContext";

export default function App() {
  return (
    <ComplianceRulesProvider>
      <DeviceProvider>
        <RemediationProvider>
          <RouterProvider router={router} />
        </RemediationProvider>
      </DeviceProvider>
    </ComplianceRulesProvider>
  );
}

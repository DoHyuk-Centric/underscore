import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { TDSMobileAITProvider } from "@toss/tds-mobile-ait";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

const app = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TDSMobileAITProvider>{app}</TDSMobileAITProvider>
    </QueryClientProvider>
  </StrictMode>,
);

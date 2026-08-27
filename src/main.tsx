import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.tsx";
import { primeVoices } from "./lib/speech.ts";

// Chrome loads its voice list asynchronously; asking for it now means the
// first spoken line of the session already has a good voice.
primeVoices();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

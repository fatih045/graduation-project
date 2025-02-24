import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
//import { Provider } from "react-redux";
import {BrowserRouter} from "react-router-dom";
//import {store} from "./store/store";


import App from "./App.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

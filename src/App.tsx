

import './index.css'

import Footer from "./components/layout/Footer.tsx";
import truckLogo from "../src/assets/Truck.jpg";

import AppRoutes from './routes/routes.tsx';
import Header from './components/layout/Header.tsx';

function App() {

  return (
      <>
        <div className="app-container">
            <Header appName="TruckLink" logoUrl={truckLogo} />
          <main className="main-content">

              <AppRoutes />
          </main>
            <Footer/>
        </div>

      </>
  )
}

export default App

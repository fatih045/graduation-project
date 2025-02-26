
import './App.css'
import './index.css'

import Footer from "./components/layout/Footer.tsx";
import truckLogo from "../src/assets/Truck.jpg";

import AppRoutes from './routes/routes.tsx';
import Header from './components/layout/Header.tsx';

function App() {

  return (
      <>
        <div className="app-container">
          <main className="main-content">
              <Header appName="TruckLink"  logoUrl={truckLogo}/>
          <AppRoutes/>
          </main>
          <Footer/>
        </div>
      </>
  )
}

export default App

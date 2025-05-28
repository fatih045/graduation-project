import './index.css'

import Footer from "./components/layout/Footer.tsx";
import truckLogo from "../src/assets/Truck.jpg";
// main.tsx
import '@fortawesome/fontawesome-free/css/all.min.css';


import AppRoutes from './routes/routes.tsx';
import Header from './components/layout/Header.tsx';
import Sidebar from "./components/layout/Sidebar.tsx";
import NotificationListener from './components/notification/NotificationListener.tsx';


function App() {

  return (
      <>
        <NotificationListener />
        <div className="app-container">
            <Header appName="TruckLink" logoUrl={truckLogo} />
            <div className="content-with-sidebar">
                <Sidebar />
                <main className="main-content">

                    <AppRoutes />
                </main>
            </div>

            <Footer/>
        </div>

      </>
  )
}

export default App

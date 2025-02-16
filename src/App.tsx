
import './App.css'
import './index.css'
import Footer from "./components/layout/Footer.tsx";

import LandingPage from './pages/LandingPage.tsx';

function App() {

  return (
      <>
        <div className="app-container">
          <main className="main-content">

           <LandingPage/>

          </main>
          <Footer/>
        </div>
      </>
  )
}

export default App

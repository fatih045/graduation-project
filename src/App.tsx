
import './App.css'
import './index.css'
import Footer from "./components/layout/Footer.tsx";


import AppRoutes from './routes/routes.tsx';

function App() {

  return (
      <>
        <div className="app-container">
          <main className="main-content">
          <AppRoutes/>
          </main>
          <Footer/>
        </div>
      </>
  )
}

export default App

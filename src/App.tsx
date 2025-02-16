
import './App.css'
import './index.css'
import Footer from "./components/layout/Footer.tsx";
import Register from './pages/Register.tsx';

function App() {

  return (
      <>
        <div className="app-container">
          <main className="main-content">
            <h1>Merhaba, Hoş Geldiniz!</h1>
           <Register></Register>

            <p>Bu sayfa içerik ekledikçe büyüyecek.</p>
          </main>
          <Footer/>
        </div>
      </>
  )
}

export default App

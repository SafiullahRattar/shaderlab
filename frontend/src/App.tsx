import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import Gallery from "./pages/Gallery";
import ShaderView from "./pages/ShaderView";
import ShaderEditor from "./pages/ShaderEditor";
import "./App.css";

export default function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        <Navbar />
        <main className="main">
          <Routes>
            <Route path="/" element={<Gallery />} />
            <Route path="/shader/:id" element={<ShaderView />} />
            <Route path="/write" element={<ShaderEditor />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

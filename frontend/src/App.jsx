import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Footer from "./components/Footer.jsx";

export default function App() {
    return (
        <div className="app-shell">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/page/:page" element={<HomePage />} />
                <Route
                    path="/games/:id"
                    element={<Navigate to="/page/1" replace />}
                />
                <Route
                    path="*"
                    element={<Navigate to="/page/1" replace />}
                />
            </Routes>

            <Footer />
        </div>
    );
}

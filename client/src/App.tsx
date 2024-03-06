import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/styles.scss";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path='/portfolio/:param?' element={<Portfolio />} />
                    <Route path='/transactions' element={<Transactions />} />
                    <Route path='*' element={<Dashboard />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

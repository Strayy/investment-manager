import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, createContext } from "react";

import { IToastMessage } from "./types/toastMessage";

import "./styles/styles.scss";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import Transactions from "./pages/Transactions";

export const Context = createContext<[IToastMessage[], any]>([[], () => null]);

function App() {
    const [toastMessages, setToastMessages] = useState<IToastMessage[]>([]);

    return (
        <Context.Provider value={[toastMessages, setToastMessages]}>
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
        </Context.Provider>
    );
}

export default App;

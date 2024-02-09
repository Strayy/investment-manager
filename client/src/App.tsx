import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/styles.scss";

import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Table from "./components/Table";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="/test" element={<Table />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;

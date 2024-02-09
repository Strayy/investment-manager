import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/styles.scss";

import Home from "./pages/Home";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;

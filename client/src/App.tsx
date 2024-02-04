import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import NavBar from "./components/Navbar";
import "./styles/styles.scss";

function App() {
    return (
        <div className="app">
            <div className="navbar">
                <NavBar />
            </div>
            <div className="content">
                <Header />
                <Dashboard />
            </div>
        </div>
    );
}

export default App;

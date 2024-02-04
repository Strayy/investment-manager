import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import "./styles/styles.scss";

function App() {
    return (
        <div className="app">
            <div className="header-container">
                <Header />
            </div>
            <hr />
            <div className="dashboard-container">
                <Dashboard />
            </div>
        </div>
    );
}

export default App;

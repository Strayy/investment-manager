import Dashboard from "../components/Dashboard";
import Header from "../components/Header";
import NavBar from "../components/Navbar";

import "../styles/home.scss";

function Home() {
    return (
        <div className="home">
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

export default Home;

import Graph from "./Graph";
import Table from "./Table";
import Watchlist from "./Watchlist";

function Dashboard() {
    return (
        <div className="dashboard">
            <div className="upper-dashboard-container">
                <Watchlist />
            </div>
            <div className="lower-dashboard-container">
                <div>
                    <Graph />
                </div>
                <div>
                    <Table />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

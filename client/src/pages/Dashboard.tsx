import Graph from "../components/Graph";
import Table from "../components/Table";
import Watchlist from "../components/Watchlist";

function Dashboard() {
    return (
        <div className='dashboard'>
            <div className='upper-dashboard-container'>
                <Watchlist />
            </div>
            <div className='lower-dashboard-container'>
                <div>{/* <Graph /> */}</div>
                <div>{/* <Table /> */}</div>
            </div>
        </div>
    );
}

export default Dashboard;

import Graph from "../components/Graph";
import Table from "../components/Table";

function Portfolio() {
    return (
        <div className="portfolio">
            <div className="portfolio-title">
                <h1>Portfolio</h1>
                <div>
                    <div>Buy</div>
                    <div>Sell</div>
                </div>
            </div>
            <div className="portfolio-elements">
                <div className="table">
                    <Table />
                </div>
                <div className="graph">
                    <Graph />
                </div>
            </div>
        </div>
    );
}

export default Portfolio;

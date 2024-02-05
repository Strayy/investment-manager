function Table() {
    function returnPortfolio() {
        return (
            <tr className="portfolio">
                <td>Portfolio</td>
                <td>$2,478.76</td>
                <td>$69.65 (2.81%)</td>
                <td>$1,076.67 (43.44%)</td>
                {/* <td>$500</td> */}
                <td>-</td>
            </tr>
        );
    }

    function returnFavourites() {
        return (
            <>
                <tr>
                    {/* <td className="trend-change">
                        <i className="fi fi-br-arrow-trend-up"></i>
                    </td> */}
                    <td>TSLA</td>
                    <td>$185.90</td>
                    <td>$5.36 (2.97%)</td>
                    <td>$77.80 (71.97%)</td>
                    {/* <td>Lorem.</td> */}
                    <td>38.5%</td>
                </tr>

                <tr>
                    {/* <td className="trend-change">
                        <i className="fi fi-br-arrow-trend-up"></i>
                    </td> */}
                    <td>MSFT</td>
                    <td>$289.84</td>
                    <td>$6.35 (2.24%)</td>
                    <td>$50.26 (20.98%)</td>
                    {/* <td>Lorem.</td> */}
                    <td>36.7%</td>
                </tr>

                <tr>
                    {/* <td className="trend-change">
                        <i className="fi fi-br-arrow-trend-up"></i>
                    </td> */}
                    <td>AAPL</td>
                    <td>$165.56</td>
                    <td>$5.46 (3.41%)</td>
                    <td>$40.49 (32.37%)</td>
                    {/* <td>Lorem.</td> */}
                    <td>24.8%</td>
                </tr>
            </>
        );
    }

    return (
        <table className="returns-table">
            <tbody>
                <tr className="headings">
                    {/* <td></td> */}
                    <th>Item</th>
                    <th>Value</th>
                    <th>Daily Change</th>
                    <th>YTD</th>
                    {/* <th>All-Time</th> */}
                    <th>Portfolio</th>
                </tr>

                {returnPortfolio()}
                {returnFavourites()}
            </tbody>
        </table>
    );
}

export default Table;

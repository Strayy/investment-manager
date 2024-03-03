import { Link } from "react-router-dom";

const applicationLogoPath = require("../resources/logos/logo_white.png") as string;

function NavBar() {
    return (
        <div className='navbar-container'>
            <Link to='/'>
                <div className='logo'>
                    <img src={applicationLogoPath} alt='logo' />
                </div>
            </Link>

            <div className='tabs'>
                <Link to='/portfolio'>
                    <div>
                        <i className='fi fi-rr-rectangle-list'></i>
                        <span>Portfolio</span>
                    </div>
                </Link>
                <Link to='/transactions'>
                    <div>
                        <i className='fi fi-rr-time-past'></i>
                        <span>Transactions</span>
                    </div>
                </Link>
            </div>

            <div className='tab-end'>
                <Link to='/portfolio/buy'>
                    <div>
                        <i className='fi fi-rr-plus-hexagon'></i>
                        <span>Add Transaction</span>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default NavBar;

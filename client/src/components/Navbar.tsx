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
                    <i className='fi fi-rr-rectangle-list'></i>
                </Link>
            </div>

            <div className='tab-end'>
                <Link to='/portfolio/buy'>
                    <div>
                        <i className='fi fi-rr-plus-hexagon'></i>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default NavBar;

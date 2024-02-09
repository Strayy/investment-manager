import { Link } from "react-router-dom";

const applicationLogoPath =
    require("../resources/logos/logo_white.png") as string;

function NavBar() {
    return (
        <div className="navbar-container">
            <Link to="/">
                <div className="logo">
                    <img src={applicationLogoPath} alt="logo" />
                </div>
            </Link>
            <div className="tabs">
                <span>
                    <i className="fi fi-rr-rectangle-list"></i>
                </span>
            </div>

            <div className="tab-end">
                <div>
                    <i className="fi fi-rr-plus-hexagon"></i>
                </div>
            </div>
        </div>
    );
}

export default NavBar;

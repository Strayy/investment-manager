const applicationLogoPath =
    require("../resources/logos/logo_white.png") as string;

function NavBar() {
    return (
        <div className="navbar-container">
            <div className="logo">
                <img src={applicationLogoPath} alt="logo" />
            </div>
            <div className="tabs">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );
}

export default NavBar;

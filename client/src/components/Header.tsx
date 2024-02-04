function Header() {
    return (
        <div className="header-container">
            <span>
                <p>Investment Management Dashboard</p>
            </span>
            <span>
                <select>
                    <option>USD $</option>
                </select>
                <input type="text" placeholder="Search..."/>
            </span>
        </div>
    );
}

export default Header;

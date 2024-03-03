import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import NavBar from "../components/Navbar";

function Layout() {
    return (
        <div className='layout'>
            <div className='navbar' style={{ overflow: "visible" }}>
                <NavBar />
            </div>
            <div className='content'>
                <Header />
                <Outlet />
            </div>
        </div>
    );
}

export default Layout;

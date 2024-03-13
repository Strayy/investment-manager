import { Outlet } from "react-router-dom";

import Header from "./Header";
import NavBar from "./Navbar";
import Toast from "./Toast";

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
            <div className='toast'>
                <Toast />
            </div>
        </div>
    );
}

export default Layout;

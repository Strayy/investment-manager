function Header() {
    return (
        <div className='header-container'>
            <span>
                <input type='text' placeholder='Search...' />
            </span>
            <span>
                <select>
                    <option>USD $</option>
                    <option>EUR €</option>
                    <option>JPY ¥</option>
                    <option>GBP £</option>
                    <option>CNY ¥</option>
                    <option>AUD $</option>
                    <option>CAD $</option>
                    <option>CHF Fr.</option>
                    <option>HKD $</option>
                    <option>SGD $</option>
                    <option>SEK kr</option>
                    <option>KRW ₩</option>
                    <option>NOK kr</option>
                    <option>NZD $</option>
                    <option>INR ₹</option>
                </select>
                <div className='notifications'>
                    {Math.random() < 0.5 ? (
                        <>
                            <div className='notifications-circle'></div>
                            <i className='fi fi-ss-bell'></i>
                        </>
                    ) : (
                        <>
                            <i className='fi fi-rr-bell'></i>
                        </>
                    )}
                </div>
                <div
                    className='profile-picture'
                    style={{
                        backgroundImage: `url("https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")`,
                    }}
                ></div>
            </span>
        </div>
    );
}

export default Header;

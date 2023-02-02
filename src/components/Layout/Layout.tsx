import React from 'react';
import Navbar from '../Navbar/Navbar';

type Layoutprops = {
    children: React.ReactNode
}

const Layout: React.FC<Layoutprops> = ({ children }) => {

    return (
        <>
            <Navbar />
            <main>{children}</main>
        </>
    )
}
export default Layout;


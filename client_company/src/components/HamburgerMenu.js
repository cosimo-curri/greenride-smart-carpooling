import NavLinks from "./NavLinks";

function HamburgerMenu(props) {
    return (
        <div id="hamburger-menu">
            <img src="./images/x.svg" alt="X" onClick={ () => props.setHamburgerOpen(false) } />

            <NavLinks
                setHamburgerOpen={ props.setHamburgerOpen }
                showToast={ props.showToast }
                pending={ props.pending }
                setPending={ props.setPending }
            />
        </div>
    );
}

export default HamburgerMenu;
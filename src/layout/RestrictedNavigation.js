import { Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { auth, st } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { getStorage, ref, storage, getDownloadURL } from "firebase/storage";


const RestrictedNavigation = () => {

  const [user, setUser] = useState({});


  onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });


  const logout = async () => {
    await signOut(auth)
  }

  useEffect(() => {
    const storage = getStorage();
  }, [])

  return (
    <div>
      <Navbar collapseOnSelect expand="lg" className="custom-nav">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img id="brand-img" src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FLogo.png?alt=media&token=4a122e42-8aac-4f96-8221-453a40294d52">
            </img>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav>
              <NavDropdown
                id="nav-dropdown-dark-example"
                title={user?.displayName}
              >
                <LinkContainer to="/profilemanagement">
                  <NavDropdown.Item>Account</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout} href="/login">Logout</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>



    </div>

  );


}
export default RestrictedNavigation;

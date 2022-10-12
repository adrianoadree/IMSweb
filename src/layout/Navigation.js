import { Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { auth, st } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { getStorage, ref, storage, getDownloadURL } from "firebase/storage";


const Navigation = () => {

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
          <LinkContainer to="/home">
            <Navbar.Brand>
              <img id="brand-img" src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FLogo.png?alt=media&token=4a122e42-8aac-4f96-8221-453a40294d52">
            </img>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <NavDropdown title="Records" id="collasible-nav-dropdown">
                <LinkContainer to="/records">
                  <NavDropdown.Item>Transaction History</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <LinkContainer to="/supplier">
                  <NavDropdown.Item>Supplier List</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
              <NavDropdown title="Inventory" id="collasible-nav-dropdown">
                <LinkContainer to="/inventory">
                  <NavDropdown.Item>Inventory </NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <LinkContainer to="/stockcard">
                  <NavDropdown.Item>Stockcard </NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <LinkContainer to="/warehouse">
                  <NavDropdown.Item>Warehouse</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
              <LinkContainer to="/itemforecasting">
                <Nav.Link>Analytics</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/community">
                <Nav.Link>Community</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/testpage">
                <Nav.Link>Test</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/betapage">
                <Nav.Link>Beta</Nav.Link>
              </LinkContainer>
              
            </Nav>

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
export default Navigation;

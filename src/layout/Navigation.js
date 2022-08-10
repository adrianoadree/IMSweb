import { Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { auth } from '../firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useState } from 'react';

function Navigation() {

  const [user, setUser] = useState({});


  onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });


  const logout = async () => {
    await signOut(auth)
  }
    /*
    <LinkContainer to="/inventory">
    <NavDropdown.Item>Inventory </NavDropdown.Item>
  </LinkContainer>


              <LinkContainer to="/testPage">
                <Nav.Link>Test Page</Nav.Link>
              </LinkContainer>
*/
  return (
    <div>

      <Navbar collapseOnSelect expand="lg" className="custom-nav">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand><img src=".../assets/logo.png"/></Navbar.Brand>
          </LinkContainer>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <NavDropdown title="RECORDS" id="collasible-nav-dropdown">
                <LinkContainer to="/records">
                  <NavDropdown.Item>TRASACTION HISTORY</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/supplier">
                  <NavDropdown.Item>SUPPLIER LIST</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
              <NavDropdown title="INVENTORY" id="collasible-nav-dropdown">
                <LinkContainer to="/inventory">
                  <NavDropdown.Item>INVENTORY</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/warehouse">
                  <NavDropdown.Item>WAREHOUSE</NavDropdown.Item>
                </LinkContainer>
              <LinkContainer to="/stockcard">
                <NavDropdown.Item>STOCKCARD</NavDropdown.Item>
              </LinkContainer>
              </NavDropdown>
              <LinkContainer to="/analytics">
                <Nav.Link>ANALYTICS</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/community">
                <Nav.Link>COMMUNITY</Nav.Link>
              </LinkContainer>
            </Nav>
            <Nav>
              <NavDropdown
                id="nav-dropdown-dark-example"
                title={user?.displayName}
                menuVariant="dark"
              >
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

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

  return (
    <div>

      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>IMS</Navbar.Brand>
          </LinkContainer>
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <NavDropdown title="Records" id="collasible-nav-dropdown">
                <LinkContainer to="/records">
                  <NavDropdown.Item>Transaction History</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/supplier">
                  <NavDropdown.Item>Supplier List</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
              <NavDropdown title="Inventory" id="collasible-nav-dropdown">
                <LinkContainer to="/inventory">
                  <NavDropdown.Item>Inventory </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/stockcard">
                  <NavDropdown.Item>Stockcard</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/warehouse">
                  <NavDropdown.Item>Warehouse</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>
              <LinkContainer to="/analytics">
                <Nav.Link>Analytics</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/community">
                <Nav.Link>Community</Nav.Link>
              </LinkContainer>
            </Nav>

            <Nav>
              <NavDropdown
                id="nav-dropdown-dark-example"
                title={user?.email}
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

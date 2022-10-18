import { Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { auth, db, st } from '../firebase-config';
import { ref } from 'firebase/storage';
import { collection, doc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { HelpCircleOutline, HelpCircle } from 'react-ionicons'
import Tips from '../components/Tips';
import { UserAuth } from '../context/AuthContext'


const Navigation = (props) => {
  const { user } = UserAuth();//user credentials

  const [showTips, setShowTips] = useState(false);
  const [userCollection, setUserCollection] = useState([]);
  const userCollectionRef = collection(db, "user");
  const [userID, setUserID] = useState("");
  const [userProfileID, setUserProfileID] = useState("");
  const [userName, setUserName] = useState("");
  const [isNew, setIsNew] = useState(true);
  const [tipsVisibilityTogglerIcon, setTipsVisibilityTogglerIcon] = useState(true)
  

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  //read Functions


  const handleTipsVisibility = () => {
    if(showTips) {
      updateDoc(doc(db, "user", userProfileID),
      {
        showTips: false
      });
    }
    else
    {
      updateDoc(doc(db, "user", userProfileID),
      {
        showTips: true
      });
    }
  }


  const logout = async () => {
    await signOut(auth)
  }


  useEffect(() => {
    if (userID === undefined) {
          const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));
    
          const unsub = onSnapshot(q, (snapshot) =>
            setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
          );
          return unsub;
        }
        else {
          const userCollectionRef = collection(db, "user");
          const q = query(userCollectionRef, where("user", "==", userID));
    
          const unsub = onSnapshot(q, (snapshot) =>
            setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
          );
          return unsub;
          
        }
  }, [userID])



  useEffect(() => {
    userCollection.map((metadata) => {
        setShowTips(metadata.showTips);
        setUserProfileID(metadata.id);
        setUserName(metadata.name);
        setIsNew(metadata.isNew)
        console.log(showTips)
    });
  }, [userCollection])

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
              
            </Nav>

            <Nav>
              {showTips === undefined?
                <>
                </>
              :
                <div id="IMS-tips-outer-container" className="d-flex justify-content-center align-items-center">
                  <div id="IMS-tips-inner-visibility-toggler" className="me-1">
                    <button className="d-flex align-items-center"
                      data-title="Show/Hide Tips"
                      onMouseEnter={()=> setTipsVisibilityTogglerIcon(false)}
                      onMouseLeave={()=> setTipsVisibilityTogglerIcon(true)}
                      onClick={()=>handleTipsVisibility()}
                    >
                      {showTips == true?
                        <>
                          {tipsVisibilityTogglerIcon?
                            <HelpCircle
                              color={'#0d6efd'} 
                              title={'Category'}
                              height="20px"
                              width="20px"
                            />
                          :
                            <HelpCircleOutline
                              color={'#0d6efd'} 
                              title={'Category'}
                              height="20px"
                              width="20px"
                            />
                          }
                        </>
                      :
                        <>
                          {tipsVisibilityTogglerIcon?
                            <HelpCircleOutline
                              color={'#000'} 
                              title={'Category'}
                              height="20px"
                              width="20px"
                            />
                          :
                            <HelpCircle
                              color={'#000'} 
                              title={'Category'}
                              height="20px"
                              width="20px"
                            />
                          }
                        </>
                      }
                    </button>
                 </div>
                </div>
              }
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

      {showTips?
      <Tips
        name={userName}
        page={props.page}
        isNew={isNew}
      />
      :
      <></>
    }
    
    </div>
  );


}
/*

*/
export default Navigation;

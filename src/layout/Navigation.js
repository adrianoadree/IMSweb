import { useState, useEffect } from 'react';

import { auth, db } from '../firebase-config';
import { collection, doc, updateDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

import { UserAuth } from '../context/AuthContext'
import QuickAccess from '../components/QuickAccess';

import { Nav, Navbar, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { HelpCircleOutline, HelpCircle, Star, StarOutline  } from 'react-ionicons'

const Navigation = (props) => {
  const { user } = UserAuth(); // user credentials
  const userCollectionRef = collection(db, "user"); // users collection reference
  const [userCollection, setUserCollection] = useState([]); // users collection 
  const [userID, setUserID] = useState(""); // current user id
  const [userProfileID, setUserProfileID] = useState(""); // current user profile
  const [isNew, setIsNew] = useState(false); // user newness
  const [status, setStatus] = useState("verified"); // user verification status
  const [preferencesTips, setPreferencesTips] = useState() // user tips preference
  const [preferencesQuickAccess, setPreferencesQuickAccess] = useState() // user quick access preference
  
  const [prodNearROP, setProdNearROP] = useState([]) //notifications items

  const [tipsVisibilityTogglerIcon, setTipsVisibilityTogglerIcon] = useState(true) //guidelines visibility listener
  const [quickAccessVisibilityTogglerIcon, setQuickAccessVisibilityTogglerIcon] = useState(true) //quick access visibility listener
  
  //=============================== START OF STATE LISTENERS ===============================
  // set user id
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  // fetch user collection
  useEffect(() => {
    if (userID === undefined) {
      const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));
    
      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else 
    {
      const userCollectionRef = collection(db, "user");
      const q = query(userCollectionRef, where("user", "==", userID));
    
      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
          
    }
  }, [userID])
  
  // assign user profile
  useEffect(() => {
    userCollection.map((metadata) => {
      setPreferencesTips(metadata.preferences.showTips);
      setPreferencesQuickAccess(metadata.preferences.showQuickAccess);
      setUserProfileID(metadata.id);
      setIsNew(metadata.isNew)
      setStatus(metadata.status)
    });
  }, [userCollection])
  
  // fetch products needed to be ordered
  useEffect(() => {
    if (userID !== undefined) {
        const stockcardCollectionRef = collection(db, "stockcard")
        const q = query(stockcardCollectionRef, where("user", "==", userID), where("analytics.analyticsBoolean", "==", true), orderBy("analytics.daysROP", "asc"));

        const unsub = onSnapshot(q, (snapshot) =>
            setProdNearROP(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
    }
  }, [userID])
  //================================ END OF STATE LISTENERS ================================
  
//=================================== START OF HANDLERS ==================================
  // change user tips preference
  const handlePreferencesTipsChange = () => {
    var pref_tips = !preferencesTips
    var pref_qa = preferencesQuickAccess
    updateDoc(doc(db, "user", userProfileID),
    {
      preferences: {showTips: pref_tips, showQuickAccess: pref_qa}
    });
  }

  // change quick access user preference
  const handlePreferencesQuickAccessChange = () => {
    var pref_tips = preferencesTips
    var pref_qa = !preferencesQuickAccess
    updateDoc(doc(db, "user", userProfileID),
    {
      preferences: {showTips: pref_tips, showQuickAccess: pref_qa}
    });
  }

  // logout module
  const logout = async () => {
    await signOut(auth)
  }
  //=================================== END OF HANDLERS  ===================================

  return (
    <div>
      <Navbar collapseOnSelect expand="lg" id="IMS-nav">
        <Container>
          <LinkContainer to="/home">
            <Navbar.Brand>
              <img 
                id="brand-img"
                src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FLogo.png?alt=media&token=4a122e42-8aac-4f96-8221-453a40294d52"
                >
              </img>
              <div id="badge" className={prodNearROP.length > 0 ? "" : "d-none"}>
                .
              </div>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Collapse id="responsive-navbar-nav">
            {isNew === true && status != "verified" ?
              <></>
              :
              <Nav className="me-auto">
                <NavDropdown title="Records" id="collasible-nav-dropdown">
                  <LinkContainer to="/salesrecord">
                    <NavDropdown.Item>Transactions</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <LinkContainer to="/supplier">
                    <NavDropdown.Item>Suppliers</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
                <LinkContainer to="/stockcard">
                  <Nav.Link>Stockcard</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/warehouse">
                  <Nav.Link>Warehouses</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/itemforecasting">
                  <Nav.Link>Analytics</Nav.Link>
                </LinkContainer>
                <NavDropdown title="Tools" id="collasible-nav-dropdown">
                  <LinkContainer to="/printbarcodes">
                    <NavDropdown.Item>Print Codes</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <LinkContainer to="/generateisr">
                    <NavDropdown.Item>Generate Reports</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <LinkContainer to="/adjustinventory">
                    <NavDropdown.Item>Adjust Inventory</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>

              </Nav>
            }
            <Nav>
              {userCollection === undefined ?
                <></>
                :
                <>
                  <div id="IMS-tips-outer-container" className="d-flex justify-content-center align-items-center">
                    <div id="IMS-tips-inner-visibility-toggler" className="me-1">
                      <button
                        className="d-flex align-items-center"
                        data-title={preferencesTips ? "Hide Guidelines" : "Show Guidelines"}
                        onMouseEnter={() => setTipsVisibilityTogglerIcon(false)}
                        onMouseLeave={() => setTipsVisibilityTogglerIcon(true)}
                        onClick={() => { handlePreferencesTipsChange() }}
                      >
                        {preferencesTips ?
                          <>
                            {tipsVisibilityTogglerIcon ?
                              <HelpCircle
                                color={'#0d6efd'}
                                height="20px"
                                width="20px"
                              />
                              :
                              <HelpCircleOutline
                                color={'#0d6efd'}
                                height="20px"
                                width="20px"
                              />
                            }
                          </>
                          :
                          <>
                            {tipsVisibilityTogglerIcon ?
                              <HelpCircleOutline
                                color={'#000'}
                                height="20px"
                                width="20px"
                              />
                              :
                              <HelpCircle
                                color={'#000'}
                                height="20px"
                                width="20px"
                              />
                            }
                          </>
                        }
                      </button>
                    </div>
                  </div>
                  {!isNew ?
                    <div id="IMS-tips-outer-container" className="d-flex justify-content-center align-items-center">
                      <div id="IMS-tips-inner-visibility-toggler" className="me-1">
                        <button
                          className="d-flex align-items-center"
                          data-title={preferencesQuickAccess ? "Hide Quick Access" : "Show Quick Access"}
                          onMouseEnter={() => setQuickAccessVisibilityTogglerIcon(false)}
                          onMouseLeave={() => setQuickAccessVisibilityTogglerIcon(true)}
                          onClick={() => { handlePreferencesQuickAccessChange() }}
                        >
                          {preferencesQuickAccess ?
                            <>
                              {quickAccessVisibilityTogglerIcon ?
                                <Star
                                  color={'#0d6efd'}
                                  height="20px"
                                  width="20px"
                                />
                                :
                                <StarOutline
                                  color={'#0d6efd'}
                                  height="20px"
                                  width="20px"
                                />
                              }
                            </>
                            :
                            <>
                              {quickAccessVisibilityTogglerIcon ?
                                <StarOutline
                                  color={'#000'}
                                  height="20px"
                                  width="20px"
                                />
                                :
                                <Star
                                  color={'#000'}
                                  height="20px"
                                  width="20px"
                                />
                              }
                            </>
                          }
                        </button>
                      </div>
                    </div>
                    :
                    <></>
                  }
                </>
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
      {!isNew ?
        <>
          {preferencesQuickAccess ?
            <QuickAccess />
            :
            <></>
          }
        </>
        :
        <></>
      }
    </div>
  );
}

export default Navigation;

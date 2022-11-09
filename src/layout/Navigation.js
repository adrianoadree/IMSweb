import { Nav, Navbar, Container, NavDropdown, Placeholder } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { auth, db } from '../firebase-config';
import { collection, doc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { HelpCircleOutline, HelpCircle, Star, StarOutline  } from 'react-ionicons'
import Tips from '../components/Tips';
import QuickAccess from '../components/QuickAccess';
import { UserAuth } from '../context/AuthContext'


const Navigation = (props) => {
  const { user } = UserAuth();//user credentials

  const [preferencesTips, setPreferencesTips] = useState()
  const [preferencesQuickAccess, setPreferencesQuickAccess] = useState()
  const [userCollection, setUserCollection] = useState([]);
  const userCollectionRef = collection(db, "user");
  const [userID, setUserID] = useState("");
  const [userProfileID, setUserProfileID] = useState("");
  const [userName, setUserName] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState("verified");
  const [tipsVisibilityTogglerIcon, setTipsVisibilityTogglerIcon] = useState(true)
  const [quickAccessVisibilityTogglerIcon, setQuickAccessVisibilityTogglerIcon] = useState(true)
  
  

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  //read Functions

  useEffect(() => {
    console.log(preferencesQuickAccess)
  })

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
  
  useEffect(() => {
    userCollection.map((metadata) => {
      setPreferencesTips(metadata.preferences.showTips);
      setPreferencesQuickAccess(metadata.preferences.showQuickAccess);
      setUserProfileID(metadata.id);
      setUserName(metadata.name);
      setIsNew(metadata.isNew)
      setStatus(metadata.status)
    });
  }, [userCollection])

  const logout = async () => {
    await signOut(auth)
  }

  const handlePreferencesTipsChange = () => {
    var pref_tips = !preferencesTips
    var pref_qa = preferencesQuickAccess
    updateDoc(doc(db, "user", userProfileID),
    {
      preferences: {showTips: pref_tips, showQuickAccess: pref_qa}
    });
  }

  const handlePreferencesQuickAccessChange = () => {
    var pref_tips = preferencesTips
    var pref_qa = !preferencesQuickAccess
    updateDoc(doc(db, "user", userProfileID),
    {
      preferences: {showTips: pref_tips, showQuickAccess: pref_qa}
    });
  }


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
            {isNew === true && status != "verified"?
              <></>
            :
              <Nav className="me-auto">
                <LinkContainer to="/warehouse">
                  <Nav.Link>Warehouse</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/stockcard">
                  <Nav.Link>Stockcard</Nav.Link>
                </LinkContainer>
                <NavDropdown title="Records" id="collasible-nav-dropdown">
                  <LinkContainer to="/records">
                    <NavDropdown.Item>Transaction History</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <LinkContainer to="/supplier">
                    <NavDropdown.Item>Supplier List</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
                <LinkContainer to="/itemforecasting">
                  <Nav.Link>Analytics</Nav.Link>
                </LinkContainer>
                <NavDropdown title="Tools" id="collasible-nav-dropdown">
                  <LinkContainer to="">
                    <NavDropdown.Item>Print Codes</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <LinkContainer to="/home">
                    <NavDropdown.Item>Generate Reports</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <LinkContainer to="/home">
                    <NavDropdown.Item></NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
                <LinkContainer to="/community">
                  <Nav.Link>Community</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/testpage">
                  <Nav.Link>Test</Nav.Link>
                </LinkContainer>
              </Nav>
            }
            <Nav>
              {userCollection === undefined?
                <></>
              :
              <>
              
              <div id="IMS-tips-outer-container" className="d-flex justify-content-center align-items-center">
                  <div id="IMS-tips-inner-visibility-toggler" className="me-1">
                    <button
                      className="d-flex align-items-center"
                      data-title={preferencesTips?"Hide Guidelines":"Show Guidelines"}
                      onMouseEnter={()=> setTipsVisibilityTogglerIcon(false)}
                      onMouseLeave={()=> setTipsVisibilityTogglerIcon(true)}
                      onClick={()=>{handlePreferencesTipsChange()}}
                    >
                      {preferencesTips?
                        <>
                          {tipsVisibilityTogglerIcon?
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
                          {tipsVisibilityTogglerIcon?
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
              {!isNew?
                    <div id="IMS-tips-outer-container" className="d-flex justify-content-center align-items-center">
                      <div id="IMS-tips-inner-visibility-toggler" className="me-1">
                        <button
                          className="d-flex align-items-center"
                          data-title={preferencesQuickAccess?"Hide Quick Access":"Show Quick Access"}
                          onMouseEnter={()=> setQuickAccessVisibilityTogglerIcon(false)}
                          onMouseLeave={()=> setQuickAccessVisibilityTogglerIcon(true)}
                          onClick={()=>{handlePreferencesQuickAccessChange()}}
                        >
                          {preferencesQuickAccess?
                            <>
                              {quickAccessVisibilityTogglerIcon?
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
                              {quickAccessVisibilityTogglerIcon?
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

      {preferencesTips?
        <Tips
          name={userName}
          page={props.page}
          isNew={isNew}
        />
      :
        <></>
      }
      {!isNew?
        <>
        {preferencesQuickAccess?
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
/*

*/
export default Navigation;

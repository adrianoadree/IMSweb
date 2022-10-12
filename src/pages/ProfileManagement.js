import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase-config';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';

import { Button, Card, Nav  } from 'react-bootstrap';
import { InformationCircle } from 'react-ionicons'

import { UserAuth } from '../context/AuthContext';
import RestrictedNavigation from '../layout/RestrictedNavigation';
import Navigation from '../layout/Navigation';
import NewUserBanner from '../components/NewUserBanner';
import  UserRouter  from '../pages/UserRouter'


function ProfileManagement() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]); 
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newBName, setNewBName] = useState("");
  const [newBAddress, setNewBAddress] = useState("");
  const [newBNature, setNewBNature] = useState("");
  const [newBPhone, setNewBPhone] = useState("");
  const [newBEmail, setNewBEmail] = useState("");
  const [newBType, setNewBType] = useState("physical");
  const [isComplete, setIsComplete] = useState(false);



  //---------------------FUNCTIONS---------------------

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  //read Functions

  useEffect(() => {
    if (userID === undefined) {

          const userCollectionRef = collection(db, "user")
          const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));
    
          const unsub = onSnapshot(q, (snapshot) =>
            setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
          );
          return unsub;
        }
        else {
    
          const userCollectionRef = collection(db, "user")
          const q = query(userCollectionRef, where("user", "==", userID));
    
          const unsub = onSnapshot(q, (snapshot) =>
            setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
          );
          return unsub;
          
        }
  }, [userID])
  
  const handleInputChange = (event) => {
    const target = event.target;
    const name = target.name;
    let element = document.getElementById('errormessage')

    if (!target.value) {
      
      document.getElementById('errortext').innerHTML = name + ' can not be empty'
      element.classList.remove('d-none')
      element.classList.add('d-inline-block')
    }
    else 
    {
      element.classList.add('d-none')
      element.classList.remove('d-inline-block')
    }
    
  }

  const handleInputChangePhone = (event) => {
    const target = event.target;
    const value = target.value;
    let element = document.getElementById('errormessage')
    
    if (value.substring(0,2) != '09') {
      document.getElementById('errortext').innerHTML = 'Invalid prefix'
      element.classList.remove('d-none')
      element.classList.add('d-inline-block')
    }
    else if (value.length != 11) {
      document.getElementById('errortext').innerHTML = 'Phone number should be 11 digits'
      element.classList.remove('d-none')
      element.classList.add('d-inline-block')
    }
    else 
    {
      element.classList.add('d-none')
      element.classList.remove('d-inline-block')
    }
  }

  let circle = document.getElementById('errormessage');const onMouseMove = (e) =>{
    if(circle) {
      circle.style.left = e.pageX + 'px';
      circle.style.top = e.pageY + 'px';
    }
  }
  
  document.addEventListener('mousemove', onMouseMove);

  const getVerified = async (id) => {
    await updateDoc(doc(db, 'user', id), {
      name: newName,
      phone: newPhone,
      address: newAddress,
      bname: newBName,
      baddress: newBAddress,
      bnature: newBNature,
      bphone: newBPhone,
      bemail: newBEmail,
      btype: newBType,
      inVerification: true,
      accounts: []
    });
  }

  const updateInfo = async (id) => {
    await updateDoc(doc(db, 'user', id), {
      name: newName,
      phone: newPhone,
      address: newAddress,
    });
  }

  useEffect(() => {
    userCollection.map((metadata) => {
      setNewName(metadata.name)
      setNewAddress(metadata.address)
      setNewPhone(metadata.phone)
      setNewBName(metadata.bname)
      setNewBAddress(metadata.baddress)
      setNewBEmail(metadata.bemail)
      setNewBNature(metadata.bnature)
      setNewBPhone(metadata.bphone)
    });
  }, [userCollection])  

  useEffect(() => {
    if (
      !newAddress ||
      !newPhone ||
      !newBName ||
      !newBAddress ||
      !newBEmail ||
      !newBNature ||
      !newBPhone 
    ) {
      setIsComplete(false)
    }
    else {
      setIsComplete(true);
    }
  })

  return (
    <div>
      <UserRouter
        route='/profileManagement'
      />
      {userCollection.map((metadata) => {
        return(
          <>
            {metadata.isNew ?
              <RestrictedNavigation/>
            :
              <Navigation />
            }
            {metadata.isNew ?
              <NewUserBanner
              name={metadata.name} />
            :
              <div></div>
            }
            <div id="errormessage">
              <InformationCircle
                className="me-2 pull-down"
                color={'#cd4a4a'}
                title={'Category'}
                height="17px"
                width="17px" />
              <span id="errortext"></span>
            </div>
            <div>
              <div className="row contents">
                <div className="row  py-4 px-5">
                  <div className='sidebar'>
                    <Card className="sidebar-card">
                      <Card.Header className="bg-primary text-white py-3 text-center left-curve right-curve">
                        <h4><strong>User Management</strong></h4>
                      </Card.Header>
                      <Card.Body>
                        <Nav className="user-management-tab mb-3 flex-column" defaultActiveKey="/profilemanagement">
                        <Nav.Item>
                          <Nav.Link as={Link} to="/profilemanagement" active>Profile</Nav.Link>
                        </Nav.Item>
                          {metadata.isVerified ?
                            <Nav.Item>
                              <Nav.Link as={Link} to="/accountmanagement">Accounts</Nav.Link>
                            </Nav.Item>
                            :
                            <div></div>
                          }
                        </Nav>
                      </Card.Body>
                    </Card>
                  </div>
                  <div className="divider"></div>
                  <div className='data-contents'>
                    <div className="module-contents row py-1 m-0">
                      <div className='row m-0'>
                        <h1 className='text-center pb-2 module-title'>Profile</h1>
                        <hr></hr>
                      </div>
                      <div className="row m-0 user-management-form">
                        <div className="user-management-form-section">
                          <div className="row m-0">
                            <h4>User Profile</h4>
                          </div>

                          <div className="row m-0 user-management-form-section-contents">
                            <div className="col-6">
                              <input type="text"
                                name="Name"
                                className="form-control"
                                defaultValue={metadata.name}
                                required
                                autoFocus
                                onChange={(event) => { handleInputChange(event); setNewName((event.target.value));} }/>
                              <span className="floating-label">Name</span>
                            </div>
                            <div className="col-6">
                              <input type="text"
                                name="Email Address"
                                className="form-control no-click"
                                value={metadata.email}
                                onChange={(_event) => { } }
                                style={{ background: '#f5f5f5' }} />
                              <span className="floating-label">Email Address</span>
                            </div>
                            <div className="col-4">
                              <input type="text"
                                name="Phone Number"
                                className="form-control"
                                defaultValue={metadata.phone}
                                required
                                onChange={(event) => { handleInputChangePhone(event); setNewPhone((event.target.value)); } } />
                              <span className="floating-label">Phone Number</span>
                            </div>
                            <div className="col-8">
                              <input type="text"
                                name="Address"
                                className="form-control"
                                defaultValue={metadata.address}
                                required
                                onChange={(event) => { handleInputChange(event); setNewAddress((event.target.value)); } } />
                              <span className="floating-label">Address</span>
                            </div>
                          </div>

                        </div>
                        {metadata.isVerified ?
                          <div></div>
                          :
                          <div className="user-management-form-section">
                            <div className="row m-0">
                              <h4>Business Profile</h4>
                            </div>
                            <div className="row m-0 user-management-form-section-contents">
                              <div className="col-12">
                                <input type="text"
                                  name="Business Name"
                                  className="form-control"
                                  defaultValue={metadata.bname}
                                  required
                                  onChange={(event) => { handleInputChange(event); setNewBName((event.target.value)); } } />
                                <span className="floating-label">Business Name</span>
                              </div>
                              <div className="col-12">
                                <input type="text"
                                  name="Business Address"
                                  className="form-control"
                                  defaultValue={metadata.baddress}
                                  required
                                  onChange={(event) => { handleInputChange(event); setNewBAddress((event.target.value)); } } />
                                <span className="floating-label">Business Address</span>
                              </div>
                              <div className="col-6">
                                <input type="text"
                                  name="Nature of Business"
                                  className="form-control"
                                  defaultValue={metadata.bnature}
                                  required
                                  onChange={(event) => { handleInputChange(event); setNewBNature((event.target.value)); } } />
                                <span className="floating-label">Nature of Business (e.g. reseller, boutique) </span>
                              </div>
                              <div className="col-6">
                                <select type="text"
                                  className="form-control"
                                  defaultValue={metadata.btype}
                                  required
                                  onChange={(event) => { setNewBType((event.target.value)); } }>
                                  <option value="physical">Operation Type</option>
                                  <option value="online">Online</option>
                                  <option value="physical">Physical</option>
                                  <option value="both">Both online and physical</option>
                                </select>
                              </div>
                              <div className="col-4">
                                <input type="text"
                                  name="Phone Number"
                                  className="form-control"
                                  defaultValue={metadata.bphone}
                                  required
                                  onChange={(event) => { handleInputChangePhone(event); setNewBPhone((event.target.value)); } } />
                                <span className="floating-label">Phone Number</span>
                              </div>
                              <div className="col-8">
                                <input type="text"
                                  name="Email Address"
                                  className="form-control"
                                  defaultValue={metadata.bemail}
                                  required
                                  onChange={(event) => { handleInputChange(event); setNewBEmail((event.target.value)); } } />
                                <span className="floating-label">Email Address</span>
                              </div>
                              <div className="col-12">
                                <label>Business Requirements</label>
                                <form action="">
                                  <div className="row">
                                    <div className="col-10 m-0 pe-0">
                                      <input type="file" id="requirement" className="form-control" name="file" />
                                    </div>
                                    <div className="col-2 m-0 p-0">
                                      <input type="submit" className="form-control" name="Upload" value="Upload" />
                                    </div>
                                  </div>
                                </form>
                              </div>
                            </div>
                          </div>}
                        {isComplete?
                          <div id="submit-button">
                            {metadata.isVerified ?
                              <Button
                                className="btn btn-success"
                                style={{ width: "150px" }}
                                onClick={() => { updateInfo(metadata.id) } }>
                                Save Changes
                              </Button>
                              :
                              <Button
                                className="btn btn-success"
                                style={{ width: "150px" }}
                                onClick={() => { getVerified(metadata.id)} }>
                                Submit
                              </Button>
                            }
                          </div>
                          :
                          <div id="submit-message">
                            Submit button will appear once all fields are filled in.
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      })}
    </div>
  );
}

export default ProfileManagement;
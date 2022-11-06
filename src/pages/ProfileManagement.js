import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, st } from "../firebase-config";
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';

import { Button, Card, Nav  } from 'react-bootstrap';
import { InformationCircle } from 'react-ionicons'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { UserAuth } from '../context/AuthContext';
import Navigation from '../layout/Navigation';
import  UserRouter  from '../pages/UserRouter'
import { Spinner } from 'loading-animations-react';
import { ActionCodeURL } from 'firebase/auth';


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
  const [isUpdateComplete, setIsUpdateComplete] = useState(false);
  
  const [fileUpload, setFileUpload] = useState([]);
  const [fileUrls, setFileUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadFinished, setUploadFinished] = useState(false);


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
  


  const handleInputChange = (value) => {
    if (!value) {
      return "Field can not be empty"
    }
    else
    {
      return "hide-warning-message"
    }
  }

  useEffect(()=>{
    console.log(fileUpload)
    console.log(fileUrls)
  })

  const handleInputChangePhone = (value, required) => {
    if (!value) {
      if(required)
      {
        return "Field can not be empty"
      }
      else
      {
        return "hide-warning-message"
      }
    }
    else if (value.substring(0,2) != '09')
    {
      return "Invalid prefix"
    }
    else if (value.length != 11)
    {
      return 'Phone number should be 11 digits'
    }
    else 
    {
      return "hide-warning-message"
    }
  }

  const uploadFile = () => {
    if (fileUpload == null) return;
    Array.from(fileUpload).map((file, index)=>{
      uploadBytes(ref(st, `${userID}/documents/${file.name}`), file).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setFileUrls((prev) => [...prev, url]);
        });
      });
    })
  };

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
      status: 'inVerification',
      accounts: [],
      documents: fileUrls
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
      handleInputChange(newName) != "hide-warning-message" ||
      handleInputChange(newBName) != "hide-warning-message" ||
      handleInputChange(newBAddress) != "hide-warning-message" ||
      handleInputChange(newBEmail) != "hide-warning-message" ||
      handleInputChange(newBNature) != "hide-warning-message" ||
      handleInputChangePhone(newBPhone, true) != "hide-warning-message" ||
      !uploadFinished
    ) 
    {
      setIsComplete(false)
    }
    else {
      setIsComplete(true);
    }
    if(fileUrls.length > 0)
    {
      if(fileUrls.length != fileUpload.length) {
      }
      else
      {
        if(fileUrls.length == fileUpload.length)
        {
          setUploadFinished(true)
        }
        setUploading(false)
      }
    }
    if (handleInputChange(newName) != "hide-warning-message")
    {
      setIsUpdateComplete(false)
    }
    else
    {
      setIsUpdateComplete(true)
    }
  })

  return (
    <div>
      <UserRouter
        route='/profileManagement'
      />
      <Navigation 
        page='/profileManagement'
      />
      {userCollection.map((metadata) => {
        return(
          <>
            <div>
              <div id="contents" className="row">
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
                          {metadata.status == 'verified'?
                            <Nav.Item>
                              <Nav.Link as={Link} to="/accountmanagement">Accounts</Nav.Link>
                            </Nav.Item>
                            :
                            <></>
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
                                onChange={(event) => {setNewName((event.target.value));} }
                              />
                              <span className="floating-label">
                                Name
                                <a 
                                  style={{color: '#b42525'}}
                                  className="header-tooltip"
                                  data-title="This field is required"
                                >
                                   *
                                </a>
                              </span>
                              <div 
                                className={"field-warning-message red-strip my-1 m-0 " + (handleInputChange(newName))}
                              >
                                {handleInputChange(newName)}
                              </div>
                            </div>
                            <div className="col-6">
                              <input type="text"
                                name="Email Address"
                                className="form-control no-click"
                                value={metadata.email}
                                onChange={(_event) => { } }
                                style={{ background: '#f5f5f5' }}
                              />
                              <span className="floating-label">Email Address</span>
                            </div>
                            <div className="col-4">
                              <input type="text"
                                name="Phone Number"
                                className="form-control"
                                defaultValue={metadata.phone}
                                required
                                onChange={(event) => {setNewPhone((event.target.value));}}
                                />
                              <span className="floating-label">Phone Number</span>
                              <div 
                                className={"field-warning-message yellow-strip my-1 m-0 " + (handleInputChangePhone(newPhone))}
                              >
                                {handleInputChangePhone(newPhone, false)}
                              </div>
                            </div>
                            <div className="col-8">
                              <input type="text"
                                name="Address"
                                className="form-control"
                                defaultValue={metadata.address}
                                required
                                onChange={(event) => {setNewAddress((event.target.value)); } } />
                              <span className="floating-label">Address</span>
                            </div>
                          </div>

                        </div>
                        {metadata.status == 'new'?
                          
                          <div className="user-management-form-section">
                            <div className="row m-0">
                              <h4>
                                Business Profile
                                <a 
                                  style={{color: '#b42525'}}
                                  className="header-tooltip"
                                  data-title="All fields are required"
                                >
                                   *
                                </a>
                              </h4>
                            </div>
                            <div className="row m-0 user-management-form-section-contents">
                              <div className="col-12">
                                <input type="text"
                                  name="Business Name"
                                  className="form-control"
                                  defaultValue={metadata.bname}
                                  required
                                  onChange={(event) => {setNewBName((event.target.value)); } }
                                />
                                <span className="floating-label">Business Name</span>
                                <div 
                                  className={"field-warning-message red-strip my-1 m-0 " + (handleInputChange(newBName))}
                                >
                                  {handleInputChange(newBName)}
                                </div>
                              </div>
                              <div className="col-12">
                                <input type="text"
                                  name="Business Address"
                                  className="form-control"
                                  defaultValue={metadata.baddress}
                                  required
                                  onChange={(event) => {setNewBAddress((event.target.value)); } } />
                                <span className="floating-label">Business Address</span>
                                <div 
                                  className={"field-warning-message red-strip my-1 m-0 " + (handleInputChange(newBAddress))}
                                >
                                  {handleInputChange(newBAddress)}
                                </div>
                              </div>
                              <div className="col-6">
                                <input type="text"
                                  name="Nature of Business"
                                  className="form-control"
                                  defaultValue={metadata.bnature}
                                  required
                                  onChange={(event) => {setNewBNature((event.target.value)); } } />
                                <span className="floating-label">Nature of Business (e.g. reseller, boutique)</span>
                                <div 
                                  className={"field-warning-message red-strip my-1 m-0 " + (handleInputChange(newBNature))}
                                >
                                  {handleInputChange(newBNature)}
                                </div>
                              </div>
                              <div className="col-6">
                                <select type="text"
                                  className="form-control"
                                  value={metadata.btype}
                                  required
                                  onChange={(event) => { setNewBType((event.target.value)); } }
                                >
                                  <option value="Physical">Operation Type</option>
                                  <option value="Online">Online</option>
                                  <option value="Physical">Physical</option>
                                  <option value="Both">Both online and physical</option>
                                </select>
                              </div>
                              <div className="col-4">
                                <input type="text"
                                  name="Phone Number"
                                  className="form-control"
                                  defaultValue={metadata.bphone}
                                  required
                                  onChange={(event) => {setNewBPhone((event.target.value)); } } />
                                <span className="floating-label">Phone Number</span>
                                <div 
                                  className={"field-warning-message red-strip my-1 m-0 " + (handleInputChangePhone(newBPhone, true))}
                                >
                                  {handleInputChangePhone(newBPhone, true)}
                                </div>
                              </div>
                              <div className="col-8">
                                <input type="text"
                                  name="Email Address"
                                  className="form-control"
                                  defaultValue={metadata.bemail}
                                  required
                                  onChange={(event) => {setNewBEmail((event.target.value)); } } />
                                <span className="floating-label">Email Address</span>
                                <div 
                                  className={"field-warning-message red-strip my-1 m-0 " + (handleInputChange(newBEmail))}
                                >
                                {handleInputChange(newBEmail)}
                              </div>
                              </div>
                              <div className="col-12">
                                <label>Business Requirements</label>
                                  <div className="row">
                                    <div className="col-10 m-0 pe-0">
                                      <input type="file"
                                        id="requirement"
                                        className="form-control"
                                        multiple
                                        onChange={(event) => {
                                          setFileUpload(event.target.files);
                                          setFileUrls([])
                                          setUploading(false);
                                          setUploadFinished(false);
                                        }}
                                      />
                                    </div>
                                    <div className="col-2 m-0 p-0">
                                      <Button
                                        type="button"
                                        className="form-control"
                                        disabled={fileUpload.length == 0 || uploading || uploadFinished}
                                        onClick={()=>{setUploadFinished(false);setUploading(true);uploadFile()}}
                                      >
                                        {uploading?
                                          <Spinner 
                                            color1="#fff"
                                            color2="#fff"
                                            textColor="rgba(0,0,0,0)"
                                            className="w-25 h-25"
                                          />
                                        :
                                        <>
                                          {uploadFinished?
                                              <>Complete</>
                                          :
                                              <>Upload</>
                                          
                                          }
                                        </>
                                        }
                                        </Button>
                                    </div>
                                  </div>
                              </div>
                            </div>
                          </div>
                          :
                          <></>
                        }
                        {metadata.status == 'verified'?
                          <div className="user-management-form-section">
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                        <h5 className="mb-2"><strong>Need to change your business information?</strong></h5>
                        <p className="d-flex align-items-center justify-content-center">
                          <span style={{color: '#0d6efd'}}>Email us at ims-bodegako@gmail.com</span>
                        </p>
                      </div>
                          </div>
                        :
                        <></>
                        }
                          <div id="submit-button">
                            {metadata.status == 'new' ?
                              <Button
                                className="btn btn-success"
                                style={{ width: "150px" }}
                                disabled={!isComplete}
                                onClick={() => { getVerified(metadata.id)} }>
                                Submit
                              </Button>
                              :
                              <Button
                                className="btn btn-success"
                                style={{ width: "150px" }}
                                disabled={!isUpdateComplete}
                                onClick={() => { updateInfo(metadata.id) } }>
                                Save Changes
                              </Button>
                            }
                          </div>
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
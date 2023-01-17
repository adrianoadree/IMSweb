import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, st } from "../firebase-config";
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';

import { Button, Card, Nav  } from 'react-bootstrap';
import { InformationCircle } from 'react-ionicons'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faSave, faClose } from '@fortawesome/free-solid-svg-icons'

import { UserAuth } from '../context/AuthContext';
import Navigation from '../layout/Navigation';
import  UserRouter  from '../pages/UserRouter'
import { Spinner } from 'loading-animations-react';


function ProfileManagement() {

  //---------------------VARIABLES---------------------
  const [masterdata, setMasterdata] = useState([])

  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]); 

  const [userProfileId, setUserProfileId] = useState("")
  const [email, setEmail] = useState(false)
  const [status, setStatus] = useState("")
  const [newness, setNewness] = useState(false)
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newBName, setNewBName] = useState("");
  const [newBAddress, setNewBAddress] = useState("");
  const [newBNature, setNewBNature] = useState("");
  const [newBPhone, setNewBPhone] = useState("");
  const [newBEmail, setNewBEmail] = useState("");
  const [newBType, setNewBType] = useState("physical");
  const [fileUpload, setFileUpload] = useState([]);
  const [fileUrls, setFileUrls] = useState([]);

  const [isComplete, setIsComplete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFinished, setUploadFinished] = useState(false);
  const [isUpdateComplete, setIsUpdateComplete] = useState(false);
  const [editing, setEditing] = useState(false)

  //---------------------FUNCTIONS---------------------

  onSnapshot(doc(db, "masterdata", "user"), (doc) => {
    setMasterdata(doc.data())
  }, []);

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
    console.log(Array.from(fileUpload).length)
    console.log(fileUrls.length)
  }, [fileUrls])

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

  const checkIfEmpty = (value) => {
    if(value === undefined || value == "" || value == "")
    {
      return " "
    }
    else
    {
      return value
    }
  }

  const uploadFile = () => {
    if (fileUpload == null) return;
    Array.from(fileUpload).map((file, index)=>{
      uploadBytes(ref(st, `${userID}/documents/${fileUpload[index].name}`), file).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          console.log(url)
          setFileUrls((prev) => [...prev, url]);
        });
      });
    })
  };

  const getVerified = () => {
    updateDoc(doc(db, 'user', userProfileId), {
      name: checkIfEmpty(newName),
      phone: checkIfEmpty(newPhone),
      address: checkIfEmpty(newAddress),
      bname: checkIfEmpty(newBName),
      baddress: checkIfEmpty(newBAddress),
      bnature: checkIfEmpty(newBNature),
      bphone: checkIfEmpty(newBPhone),
      bemail: checkIfEmpty(newBEmail),
      btype: checkIfEmpty(newBType),
      status: 'inVerification',
      documents: fileUrls
    });
  }

  const updateInfo = async () => {
    await updateDoc(doc(db, 'user', userProfileId), {
      name: newName,
      phone: newPhone,
      address: newAddress,
    });
  }

  useEffect(() => {
    userCollection.map((metadata) => {
      setUserProfileId(metadata.id)
      setNewness(metadata.isNew)
      setStatus(metadata.status)
      setEmail(metadata.email)
      setNewName(metadata.name)
      setNewAddress(metadata.address)
      setNewPhone(metadata.phone)
      setNewBName(metadata.bname)
      setNewBAddress(metadata.baddress)
      setNewBEmail(metadata.bemail)
      setNewBNature(metadata.bnature)
      setNewBPhone(metadata.bphone)
      if(metadata.status != "verified")
      {
        setEditing(true)
      }
    });
  }, [userCollection])  

  useEffect(() => {
    if (
      handleInputChange(newName) != "hide-warning-message" ||
      handleInputChange(newBName) != "hide-warning-message" ||
      handleInputChange(newBAddress) != "hide-warning-message" ||
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
            if(fileUrls.length === fileUpload.length)
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
      {userCollection === undefined || userCollection.length == 0?
         <></>
      : 
            <div>
              <div id="contents" className="row">
                <div className="row  py-4 px-5">
                  <div className='sidebar'>
                    <Card className="sidebar-card">
                      <Card.Header className="bg-primary text-white py-3 text-center left-curve right-curve">
                        <h4><strong>Account Management</strong></h4>
                      </Card.Header>
                      <Card.Body>
                        <Nav className="user-management-tab mb-3 flex-column" defaultActiveKey="/profilemanagement">
                        <Nav.Item>
                          <Nav.Link as={Link} to="/profilemanagement" active>Profile</Nav.Link>
                        </Nav.Item>
                          {status == 'verified'?
                            <Nav.Item>
                              <Nav.Link as={Link} to="/accountmanagement">Users</Nav.Link>
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
                              {status == 'verified'?
                                <>
                                <h4 className={editing?"editing":""}>Owner Profile</h4>
                                <div className="user-options">
                                {editing?
                                  <>
                                  <Button
                                    className="delete me-1"
                                    data-title="Cancel"
                                    onClick={()=>{setEditing(false)}}
                                  >
                                    <FontAwesomeIcon icon={faClose} />
                                  </Button>
                                  <Button
                                    className="edit me-1"
                                    data-title="Save Changes"
                                    onClick={()=>{updateInfo();editing?setEditing(false):setEditing(true)}}
                                  >
                                    <FontAwesomeIcon icon={faSave} />
                                  </Button>
                                  </>
                                :
                                  <Button
                                    className="edit me-1"
                                    data-title="Edit Profile"
                                    onClick={()=>{editing?setEditing(false):setEditing(true)}}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                </Button>
                                }
                                </div>
                                </>
                              :
                                <>
                                <h4>Owner Profile</h4>
                                </>
                              }
                          </div>
                          <div className="row m-0 d-flex align-items center justify-content-end">
                            
                          </div>
                          <div className="row m-0 user-management-form-section-contents">
                            <div className="col-6">
                              <input type="text"
                                name="Name"
                                className={"form-control " + (editing?"":"no-click form")}
                                value={newName}
                                required
                                onChange={(event) => {setNewName((event.target.value));} }
                              />
                              <span className="floating-label">
                                Name
                                <a 
                                  style={{color: '#b42525'}}
                                  className={"header-tooltip"}
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
                                className="form-control no-click form"
                                value={email}
                                onChange={(_event) => { } }
                              />
                              <span className="floating-label">Email Address</span>
                            </div>
                            <div className="col-4">
                              <input type="text"
                                name="Phone Number"
                                className={"form-control " + (editing?"":"no-click form")}
                                value={newPhone}
                                required
                                onChange={(event) => {setNewPhone((event.target.value));}}
                                />
                              <span className="floating-label">Phone Number</span>
                              {status == "new"?
                              <div 
                                className={"field-warning-message yellow-strip my-1 m-0 " + (handleInputChangePhone(newPhone))}
                              >
                                {handleInputChangePhone(newPhone, false)}
                              </div>
                              :
                              <></>
                              }
                            </div>
                            <div className="col-8">
                              <input type="text"
                                name="Address"
                                className={"form-control " + (editing?"":"no-click form")}
                                value={newAddress}
                                required
                                onChange={(event) => {setNewAddress((event.target.value)); } } />
                              <span className="floating-label">Address</span>
                            </div>
                          </div>

                        </div>
                        {status == 'new'?
                          
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
                                  value={newBName}
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
                                  defaultValue={newBAddress}
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
                                  defaultValue={newBNature}
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
                                  value={newBType}
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
                                  defaultValue={newBPhone}
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
                                  defaultValue={newBEmail}
                                  required
                                  onChange={(event) => {setNewBEmail((event.target.value)); } } />
                                <span className="floating-label">Email Address</span>
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
                        {status == 'verified'?
                          <div className="user-management-form-section">
                            {editing?
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                                <h5 className="mb-2"><strong>Need to change your business information?</strong></h5>
                                <p className="d-flex align-items-center justify-content-center">
                                  <span className="text-center" style={{color: '#707070'}}>
                                    Email us at any of the following accounts:
                                    <br />
                                    {masterdata.support_accounts.map((account) => {
                                      return(
                                        <a style={{color: '#0d6efd'}} href={"mailto:" + account}>{account}</a>
                                      )
                                    })}
                                  </span>
                                </p>
                              </div>
                            :
                                <></>
                            }
                          </div>
                        :
                        <></>
                        }
                          <div id="submit-button">
                            {status == 'new' ?
                              <Button
                                className="btn btn-success"
                                style={{ width: "150px" }}
                                disabled={!isComplete}
                                onClick={() => { getVerified()} }>
                                Submit
                              </Button>
                            :
                              <></>
                            }
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      }
    </div>
  );
}

export default ProfileManagement;
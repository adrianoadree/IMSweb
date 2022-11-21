import React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';

import { Tab, Card, Table, ListGroup } from 'react-bootstrap';
import {InformationCircle } from 'react-ionicons'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

import { UserAuth } from '../context/AuthContext';
import Navigation from '../layout/Navigation';
import ModRouter from '../pages/ModRouter';

function ManageUsers() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();// user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]);

  const [docId, setDocId] = useState(0);

  //---------------------FUNCTIONS---------------------
  
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  // read Functions

  useEffect(() => {
    const userCollectionRef = collection(db, "user")
    
    const unsub = onSnapshot(userCollectionRef, (snapshot) =>
      setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return unsub;
  }, [userID])

  // change selected user
  const handleDocChange = (user_id) => {
    userCollection.map((user, index)=>{
      if(user.id == user_id)
      {
        setDocId(index)
      }
    })
  }

  // get file names
  const getFileName = (url) => {
    var first_half = url.substring(121, url.length)
    return first_half.substring(0, first_half.length - 53)
  }

  // verify chosen account
  const VerifyAccount = (id) => {
    const saveVerification = async () => {
      await updateDoc(doc(db, 'user', id), {
        isNew: true,
        status: 'verified',
        preferences: {showTips: true, showQuickAccess: true,}
      });
  }
    saveVerification()
  }

  // undo account verification
  const UndoVerifyAccount = (id) => {
    const saveUndoVerification = async () => {
      await updateDoc(doc(db, 'user', id), {
        isNew: true,
        status: 'inVerification',
        preferences: {showTips: true, showQuickAccess: false,}
      });
  }
    saveUndoVerification()
  }

  return (
    <div>
      <ModRouter
        route="/manageusers"
      />
      <Navigation />
      <ToastContainer
        newestOnTop={false}
        rtl={false}
        pauseOnFocusLoss
      />
      <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
        <div id="contents" className="row">
          <div className="row  py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header>
                  <div className='row'>
                    <div className="col-12 text-center">
                      <h4><strong>List of Users</strong></h4>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className='scrollbar' style={{ height: "500px" }}>
                  <div className="row g-1 sidebar-header">
                    <div className="col-3 left-curve">
                      User Name
                    </div>
                    <div className="col-7">
                      Email Address
                    </div>
                    <div className="col-2 right-curve" style={{fontSize: "11pt"}}>
                      Status
                    </div>
                  </div>
                  <div >
                    <ListGroup variant="flush">
                      {userCollection.map((user) => {
                        return (
                          <ListGroup.Item
                            action
                            key={user.id}
                            eventKey={user.id}
                            onClick={() => { handleDocChange(user.id) }}
                          >
                            <div className="row gx-0 sidebar-contents">
                              <div className="col-3" style={{fontSize: "9pt"}}>
                                {user.name}
                              </div>
                              <div className="col-7" style={{fontSize: "9pt"}}>
                                {user.email}
                              </div>
                              <div className="col-2" style={{fontSize: "9pt"}}>
                                {user.status == 'new'?
                                  <span>New</span>
                                :
                                  <span></span>
                                }
                                {user.status == 'inVerification'?
                                  <span>In Verification</span>
                                :
                                  <span></span>
                                }
                                {user.status == 'verified'?
                                  <span>Verified</span>
                                :
                                  <span></span>
                                }
                                {user.status == '' || user.status === undefined?
                                  <span>N/A</span>
                                :
                                  <span></span>
                                }
                              </div>
                            </div>
                          </ListGroup.Item>
                        )
                      })}
                    </ListGroup>
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="divider"></div>
            <div className='data-contents'>
              <Tab.Content>
                <Tab.Pane eventKey={0}>
                  <div className="module-contents row py-1 m-0">
                    <div className='row m-0'>
                      <h1 className='text-center pb-2 module-title'>Manage Users</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                      <div className="col">
                      <span>
                          <InformationCircle
                            className="me-2 pull-down"
                            color={'#0d6efd'} 
                            title={'Category'}
                            height="40px"
                            width="40px"
                          />
                        </span>
                        <h4 className="data-id">USER ID</h4>
                      </div>
                      <div className="col">
                        <div className="float-end">
                        <label className="horizontal-switch">
                          <span className="horizontal-slider round"></span>
                        </label>
                        </div>
                      </div>
                    </div>
                    <div className="row py-1 data-specs m-0" id="supplier-info">
                      <div className="col-12 py-3">
                    </div>
                  </div>
                </div>
                </Tab.Pane>
                {userCollection === undefined || userCollection.length == 0 || docId == undefined?
                  <></>
                :
                  <Tab.Pane eventKey={userCollection[docId].id}>
                    <div className='row py-1 m-0' id="supplier-contents">
                      <div className='row m-0'>
                        <h1 className='text-center pb-2 module-title'>Manage Users</h1>
                        <hr></hr>
                      </div>
                      <div className="row py-1 m-0">
                        <div className="col d-flex align-items-center">
                        <span>
                            <InformationCircle
                              className="me-2 pull-down"
                              height="40px"
                              width="40px"
                            />
                          </span>
                          <h4 className="data-id">{userCollection[docId].id}</h4>
                        </div>
                        <div className="col">
                          <div className="float-end d-flex align-items-center">
                            <h4 className="data-id me-3">Status:</h4>
                            <div className="d-inline-block">
                                {userCollection[docId].status == 'new'?
                                  <label className="horizontal-switch new">
                                    <span className="horizontal-slider round"></span>
                                    <h6>New User</h6>
                                  </label>
                                :
                                  <></>
                                }
                                {userCollection[docId].status == 'inVerification'?
                                  <label className="horizontal-switch unchecked">
                                    <input 
                                      type="checkbox"
                                      defaultValue="false"
                                      onChange={()=>VerifyAccount(userCollection[docId].id)}
                                    />
                                    <span className="horizontal-slider round"></span>
                                    <h6>Unverified</h6>
                                  </label>
                                :
                                  <></>
                                }
                                {userCollection[docId].status == 'verified'?
                                  <label className="horizontal-switch">
                                    <input 
                                      type="checkbox"
                                      checked="checked"
                                      onChange={()=>UndoVerifyAccount(userCollection[docId].id)}
                                    />
                                    <span className="horizontal-slider round"></span>
                                    <h6>Verified</h6>
                                  </label>
                                :
                                  <></>
                                }
                                {userCollection[docId].status == '' || userCollection[docId].status === undefined?
                                  <label className="horizontal-switch na">
                                    <span className="horizontal-slider round"></span>
                                    <h6>Unavailable</h6>
                                      </label>
                                :
                                  <></>
                                }
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="row py-1 data-specs">
                        <div className="col-12 p-3" id="user-table">
                          <Table bordered size="sm">
                            <tbody>
                              <tr>
                                <td className="header left-curve">Name</td>
                                <td className="content right-curve">{userCollection[docId].name}</td>
                              </tr>
                              <tr>
                                <td className="header">Email</td>
                                <td className="content">{userCollection[docId].email}</td>
                              </tr>
                              <tr>
                                <td className="header">Phone Number</td>
                                <td className="content">{userCollection[docId].phone}</td>
                              </tr>
                              <tr>
                                <td className="header">Address</td>
                                <td className="content">{userCollection[docId].address}</td>
                              </tr>
                            </tbody>
                          </Table>
                          <Table bordered size="sm">
                            <tbody>
                              <tr>
                                <td className="header business left-curve">Business Name</td>
                                <td className="content right-curve">{userCollection[docId].bname}</td>
                              </tr>
                              <tr>
                                <td className="header business">Business Address</td>
                                <td className="content">{userCollection[docId].baddress}</td>
                              </tr>
                              <tr>
                                <td className="header business">Nature of Business</td>
                                <td className="content">{userCollection[docId].bnature}</td>
                              </tr>
                              <tr>
                                <td className="header business">Business Type</td>
                                <td className="content">{userCollection[docId].btype}</td>
                              </tr>
                              <tr>
                                <td className="header business">Business Phone Number</td>
                                <td className="content">{userCollection[docId].bphone}</td>
                              </tr>
                              <tr>
                                <td className="header business">Business Email Address</td>
                                <td className="content">{userCollection[docId].bemail}</td>
                              </tr>
                              <tr>
                                <td className="header business">Business Documents</td>
                                <td className="content">
                                  {userCollection[docId].documents == undefined?
                                    <></>
                                  :
                                    <>
                                    {userCollection[docId].documents.map((document)=>{
                                      return(
                                        <div>
                                          <a href={document}>{getFileName(document)}</a>
                                        </div>
                                      )
                                    })}
                                    </>
                                  }
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                      </div>
                      </div>
                    </div>
                  </Tab.Pane>
                }
              </Tab.Content>
            </div>
          </div>
        </div>
      </Tab.Container>
    </div>
  );
}

export default ManageUsers;
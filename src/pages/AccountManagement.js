import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase-config';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faBan, faEdit } from '@fortawesome/free-solid-svg-icons'
import { Tab, Button, Card, Modal, Nav, Table } from 'react-bootstrap';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

import { UserAuth } from '../context/AuthContext';
import Navigation from '../layout/Navigation';
import  UserRouter  from '../pages/UserRouter'

function AccountManagement() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]);

  const [editModalShow, setEditModalShow] = useState(false); //display/hide edit modal
  const [addModalShow, setAddModalShow] = useState(false);//display/hide add modal
  const [profileID, setProfileID] = useState([]); //user profile id
  const [account, setAccount] = useState([]);//accounts container
  const [selectedAccount, setSelectedAccount] = useState(0);

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

  //update accounts and profileID
  useEffect(() => {
    userCollection.map((metadata) => {
      setAccount(metadata.accounts)
      setProfileID(metadata.id)
    });
  }, [userCollection])  

  const successToast = (name) => {
    toast.success('Account for ' + name + ' created', {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
  const deleteToast = (name) => {
      toast.error(name + ' removed', {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
      });
  }

  const handleClose = () => setEditModalShow(false);
  function EditAccountModal(param) {
    var acc = account;//get accounts list and place in temp array
    var index = selectedAccount;//index of account to edit
    const [name, setName] = useState(acc[index].name);
    const [designation, setDesignation] = useState(acc[index].designation);
    const [password, setPassword] = useState(acc[index].password);
    const [isComplete, setIsComplete] = useState(2);
    
    const saveEdit = async () => {
      //change the values of the array
      acc[index].name = name;
      acc[index].designation = designation;
      acc[index].password = password;

      await updateDoc(doc(db, 'user', profileID), {
        accounts: acc,//replace firestore accounts array with temp array
      });
      param.onHide()
    }

    return (
      <Modal
      {... param}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal"
      >
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
                    <Modal.Body >
                <div className="px-3 py-2">
                    <div className="module-header mb-4">
                        <h3 className="text-center">Editing <span style={{color: '#000'}}>{acc[index].name}</span></h3>
                    </div>
                    <div className="row my-2 mb-3">
                        <div className='col-12 ps-4'>
                        <label>Employee Name</label>
                  <input type="text"
                    className="form-control shadow-none"
                    placeholder="Annie Batumbakal"
                    autoFocus
                    value={name}
                    onChange={(e)=>{setName(e.target.value)}}
                  />
                        </div>
                    </div>
                    <div className="row my-2 mb-3">
                        <div className='col-12 ps-4'>
                        <label>Designation</label>
                  <input type="text"
                    className="form-control shadow-none"
                    placeholder="Warehouse Supervisor"
                    value={designation}
                    onChange={(e)=>setDesignation(e.target.value)}
                  />
                        </div>
                    </div>
                    <div className="row my-2 mb-3">
                        <div className='col-12 ps-4'>
                        <label>Password</label>
                  <input type="text"
                    className="form-control shadow-none"
                    placeholder="junathan121257"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                  />
                        </div>
                    </div>
                </div>
            </Modal.Body> 
        <Modal.Footer
          className="d-flex justify-content-center"
        >
                <Button
                    className="btn btn-danger"
                    style={{ width: "6rem" }}
                    onClick={() => param.onHide()}
                >
                    Cancel
                </Button>
                <Button
                    className="btn btn-light float-start"
                    style={{ width: "6rem" }}
                    disabled={isComplete<2? true: false}
                    onClick={()=>saveEdit()}>
                    Save
                </Button>
            </Modal.Footer>

      </Modal>
    );
  }

  function AddAccountModal(param) {
    var acc = param.list;//get accounts list and place in temp array
    var object = {
      name: '',
      designation: '',
      password: '',
      isActive: true,
    }//create a temp account object
    const [name, setName] = useState("");
    const [designation, setDesignation] = useState("");
    const [password, setPassword] = useState("");
    
    const saveAdd = async () => {
      //change the values of the object
      object.name = name;
      object.designation = designation;
      object.password = password;
      acc.push(object)

      await updateDoc(doc(db, 'user', profileID), {
        accounts: acc,//replace firestore accounts array with temp array
      });

      successToast(name)
      param.onHide()
    }

    return (
      <Modal
      {... param}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal"
      >
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
                            <Modal.Body >
                <div className="px-3 py-2">
                    <div className="module-header mb-4">
                        <h3 className="text-center">Add an Account</h3>
                    </div>
                    <div className="row my-2 mb-3">
                        <div className='col-12 ps-4'>
                        <label>Employee Name</label>
                  <input type="text"
                    className="form-control shadow-none"
                    placeholder="Annie Batumbakal"
                    autoFocus
                    onChange={(e)=>setName(e.target.value)}
                  />
                        </div>
                    </div>
                    <div className="row my-2 mb-3">
                        <div className='col-12 ps-4'>
                        <label>Designation</label>
                  <input type="text"
                    className="form-control shadow-none"
                    placeholder="Warehouse Supervisor"
                    onChange={(e)=>setDesignation(e.target.value)}
                  />
                        </div>
                    </div>
                    <div className="row my-2 mb-3">
                        <div className='col-12 ps-4'>
                        <label>Password</label>
                  <input type="text"
                    className="form-control shadow-none"
                    placeholder="junathan121257"
                    onChange={(e)=>setPassword(e.target.value)}
                  />
                        </div>
                    </div>
                </div>
            </Modal.Body> 
        <Modal.Footer
          className="d-flex justify-content-center"
        >
                <Button
                    className="btn btn-danger"
                    style={{ width: "6rem" }}
                    onClick={() => param.onHide()}
                >
                    Cancel
                </Button>
                <Button
                    className="btn btn-light float-start"
                    style={{ width: "6rem" }}
                    onClick={()=>saveAdd()}>
                    Save
                </Button>
            </Modal.Footer>

      </Modal>
    );
  }

  const DeleteAccount = (list, index) => {
    var acc = list;//get accounts list and place in temp array
    var i = index;//index of account to delete
    var splideAcc = acc.splice(i, 1);//pop account from array through index
    
    const saveDelete = async () => {
      await updateDoc(doc(db, 'user', profileID), {
        accounts: acc,//replace firestore accounts array with temp array
      });

      deleteToast(acc[index].name)
    }

    saveDelete()
  }

  const DeactivateAccount = (list, index) => {
    var acc = list;;//get accounts list and place in temp array
    var i = index;//index of account to delete
    
    const saveDeactivate = async () => {
      //activeness toggling
      if ( acc[index].isActive )
      {
        acc[index].isActive = false
      }
      else
      {
        acc[index].isActive = true
      }
      
      await updateDoc(doc(db, 'user', profileID), {
        accounts: acc,
      });

  }

    saveDeactivate()
  }

  return (
    <div>
      <UserRouter
      route='/accountmanagement'
      />

      <Navigation />

      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Tab.Container id="list-group-tabs-example"defaultActiveKey={0}>
        <div id="contents" className="row">
          <div className="row  py-4 px-5">
            <div className='sidebar'>
              <Card className="sidebar-card">
                  <Card.Header className="bg-primary text-white py-3 text-center left-curve right-curve">
                    <h4><strong>User Management</strong></h4>
                  </Card.Header>
                  <Card.Body>
                    <Nav className="user-management-tab mb-3 flex-column" defaultActiveKey="/accountmanagement">
                      <Nav.Link as={Link} to="/profilemanagement">Profile</Nav.Link>
                      <Nav.Link as={Link} to="/accountmanagement" active>Accounts</Nav.Link>
                    </Nav>
                  </Card.Body>
              </Card>
            </div>
            <div className="divider"></div>
            <div className='data-contents'>
              <div className="module-contents row py-1 m-0">
                <div className='row m-0'>
                  <h1 className='text-center pb-2 module-title'>Manage Accounts</h1>
                  <hr></hr>
                </div>
                <div className="row m-0">
                <div className="row py-1 m-0 mb-2 d-flex align-items-center">
                      <div className="col">
                        <h5>List of User Accounts</h5>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <AddAccountModal
                                show={addModalShow}
                                onHide={() => setAddModalShow(false)}
                                list={account}
                              />
                          <Button
                            className="add me-1"
                            data-title="Add an Account"
                            onClick={()=>setAddModalShow(true)}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  <Table bordered hover size="sm" className="accounts-table">
                    <thead>
                      <tr>
                        <th className='nm pth text-center'>Name</th>
                        <th className='ds pth text-center'>Designation</th>
                        <th className='ps pth text-center'>Password</th>
                        <th className='mn pth text-center'>Manage Account</th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {account.map((acc, i) => {
                        return(
                          <>   
                        <EditAccountModal
                        show={editModalShow}
                        onHide={() => setEditModalShow(false)}
                        />
                          <tr key={i}>
                            {acc.isActive?
                              <td className="nm pt-entry text-center">
                                {acc.isAdmin?
                                <strong>{acc.name}</strong>
                                :
                                <>{acc.name}</>
                                  }
                                
                              </td>
                            :
                              <td className="nm pt-entry text-center"  style={{color: 'red'}}>
                                {acc.name}
                              </td>
                            }
                            <td className="ds pt-entry text-center">
                              {acc.designation}
                            </td>
                            <td className="ps pt-entry text-center">
                              {acc.password}
                            </td>
                            <td className="mn pt-entry text-center" >
                              {acc.isAdmin?
                              <Button
                              className="edit me-1"
                              data-title="Edit Account"
                              onClick={()=>{setSelectedAccount(i); setEditModalShow(true)}}
                              >
                              
                                <FontAwesomeIcon icon={faEdit} />
                              </Button>
                              :
<>
                              <Button
                              className="edit me-1"
                              data-title="Edit Account"
                              onClick={()=>{setSelectedAccount(i); setEditModalShow(true)}}
                              >
                              
                                <FontAwesomeIcon icon={faEdit} />
                              </Button>
                              <Button
                                className="deactivate me-1"
                                data-title="Activate/Deactivate Account"
                                onClick={()=>DeactivateAccount(account, i)}
                              >
                                <FontAwesomeIcon icon={faBan} />
                              </Button>
                              <Button
                              className="delete"
                              data-title="Delete Account"
                              onClick={()=>DeleteAccount(account, i)}
                              >
                                <FontAwesomeIcon icon={faTrashCan} />
                              </Button></>
                              }
                            </td>
                          </tr>
                          </> 
                        )
                       })
                      }
                    </tbody>
                    
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tab.Container>
    </div>
  );
}

export default AccountManagement;
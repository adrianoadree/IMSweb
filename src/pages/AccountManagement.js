import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase-config';
import { collection, doc, onSnapshot, query, updateDoc, where, orderBy } from 'firebase/firestore';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faBan, faEdit } from '@fortawesome/free-solid-svg-icons'
import { Tab, Button, Card, Modal, Nav, Table } from 'react-bootstrap';
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast, Zoom } from "react-toastify";
import { Spinner } from 'loading-animations-react';
import { UserAuth } from '../context/AuthContext';

import Navigation from '../layout/Navigation';
import  UserRouter  from '../pages/UserRouter'

function AccountManagement() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [userCollection, setUserCollection] = useState([]);

  const [showEditModal, setShowEditModal] = useState(false); // display/hide edit modal
  const [showAddModal, setShowAddModal] = useState(false);// display/hide add modal
  const [showDeleteModal, setShowDeleteModal] = useState(false); // display/hide edit modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false); // display/hide edit modal
  
  const [profileID, setProfileID] = useState([]); //user profile id
  const [account, setAccount] = useState();// accounts container
  const [selectedAccount, setSelectedAccount] = useState(0);
  const [salesRecordCollection, setSalesRecordCollection] = useState([]);
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([])

  //---------------------FUNCTIONS---------------------
  
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  // fetch user collection
  useEffect(() => {
    if (userID === undefined) {

      const userCollectionRef = collection(db, "user")
      const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));
    
      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else
    {
      const userCollectionRef = collection(db, "user")
      const q = query(userCollectionRef, where("user", "==", userID));
    
      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub; 
    }
  }, [userID])

  // get user's profile
  useEffect(() => {
    userCollection.map((metadata) => {
      setAccount(metadata.accounts)
      setProfileID(metadata.id)
    });
  }, [userCollection])  

  // fetch records
  useEffect(() => {
    //read purchase_record collection
    if (userID === undefined) {
      const purchaseRecordCollectionRef = collection(db, "purchase_record")
      const q = query(purchaseRecordCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const purchaseRecordCollectionRef = collection(db, "purchase_record")
      const q = query(purchaseRecordCollectionRef, where("user", "==", userID), orderBy("transaction_number", "desc"));

      const unsub = onSnapshot(q, (snapshot) =>
        setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])

  useEffect(() => {
    //read sales_record collection
    if (userID === undefined) {

      const collectionRef = collection(db, "sales_record")
      const q = query(collectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {

      const collectionRef = collection(db, "sales_record")
      const q = query(collectionRef, where("user", "==", userID), orderBy("transaction_number", "desc"));

      const unsub = onSnapshot(q, (snapshot) =>
        setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;

    }

  }, [userID])

  /*const checkIfInteracted = (name) => {
    if((purchaseRecordCollection === undefined || purchaseRecordCollection.length == 0)|| (salesRecordCollection === undefined || salesRecordCollection.length == 0))
    {

    }
    else
    {
      setPurchaseRecordCollection([... purchaseRecordCollection, salesRecordCollection])
      purchaseRecordCollection.map((record) => {
        if(record.issuer == name)
        {
          return true
        }
      })
      return false
    }
  }*/

  // edit account modal
  function EditAccountModal(param) {
    var acc = [] // get accounts list and place in temp array
    if(account === undefined)
    {
      acc = [{name: "", designation: "", isActive: false,}]
    }
    else
    {
      acc = account;
    }
    var index = selectedAccount; // index of account to edit
    const [name, setName] = useState(acc[index].name);
    const [designation, setDesignation] = useState(acc[index].designation);
    const [password, setPassword] = useState(acc[index].password);
    const [isComplete, setIsComplete] = useState(2);

    const editSuccessToast = () => {
      toast.info('Updating account of ' + name, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    
    const saveEdit = async () => {
      //change the values of the array
      acc[index].name = name;
      acc[index].designation = designation;
      acc[index].password = password;

      await updateDoc(doc(db, 'user', profileID), {
        accounts: acc,//replace firestore accounts array with temp array
      });

      editSuccessToast()
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
            onClick={()=>saveEdit()}
          >
              Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // add accout modal
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
    
    const addSuccessToast = (name) => {
      toast.success('Account for ' + name + ' created', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    const saveAdd = async () => {
      //change the values of the object
      object.name = name;
      object.designation = designation;
      object.password = password;
      acc.push(object)

      await updateDoc(doc(db, 'user', profileID), {
        accounts: acc,//replace firestore accounts array with temp array
      });

      addSuccessToast(name)
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
                <input
                  type="text"
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
            onClick={()=>saveAdd()}
          >
              Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // delete acccount modal
  function DeleteAccountModal(props) {
    var acc = [];//get accounts list and place in temp array
    if(account === undefined)
    {
      acc = [{name: "", designation: "", isActive: false,}]
    }
    else
    {
      acc = account;
    }
    var index = selectedAccount;//index of account to edit
    //delete row 

    const deleteToast = () => {
      toast.error("Removing " + acc[index].name, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Zoom,
      });
    }

    const deleteAccount = () => {
      var splideAcc = acc.splice(selectedAccount, 1);//pop account from array through index

      const saveDelete = async () => {
        await updateDoc(doc(db, 'user', profileID), {
          accounts: acc,//replace firestore accounts array with temp array
        });

        deleteToast(acc[index].name)
      }

      saveDelete()
      setSelectedAccount(0)
      props.onHide()
    }

    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal danger"
      >
        <Modal.Body >
          <div className="px-3 py-2">
            <div className="module-header mb-4">
              <h3 className="text-center">Deleting {acc[selectedAccount].name}</h3>
            </div>
            <div className="row m-0 p-0 mb-3">
              <div className="col-12 px-3 text-center">
                <strong>
                  Are you sure you want to delete
                  <br />
                  <span style={{ color: '#b42525' }}>{acc[selectedAccount].name}?</span>
                </strong>
              </div>
            </div>
            <div className="row m-0 p-0">
              <div className="col-12 px-3 d-flex justify-content-center">
                <Table size="sm">
                  <tbody>
                    <tr>
                      <td>Name</td>
                      <td>{acc[selectedAccount].name}</td>
                    </tr>
                    <tr>
                      <td>Designation</td>
                      <td>{acc[selectedAccount].designation}</td>
                    </tr>
                    <tr>
                      <td>Password</td>
                      <td>{acc[selectedAccount].password}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer
          className="d-flex justify-content-center"
        >
          <Button
            className="btn btn-light"
            style={{ width: "6rem" }}
            onClick={() => props.onHide()}
          >
            Cancel
          </Button>
          <Button
            className="btn btn-danger float-start"
            style={{ width: "9rem" }}
            onClick={() => { deleteAccount() }}
          >
            Delete Account
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  // delete acccount modal
  function DeactivateAccountModal(props) {
    var acc = [];//get accounts list and place in temp array
    if(account === undefined)
    {
      acc = [{name: "", designation: "", isActive: false,}]
    }
    else
    {
      acc = account;
    }
    var index = selectedAccount;//index of account to edit
    //delete row 

    const deactivateToast = () => {
      acc[selectedAccount].isActive?
      toast.info("Activating "  + acc[index].name, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Zoom,
      })
      :
      toast.error("Deactivating "  + acc[index].name, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Zoom,
      })
    }

    const deactivateAccount = () => {
      
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
      setSelectedAccount(0)
      deactivateToast()
      props.onHide()
    }

    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className={"IMS-modal " + (acc[selectedAccount].isActive?"warning":"")}
      >
        <Modal.Body >
          <div className="px-3 py-2">
            <div className="module-header mb-4">
              <h3 className="text-center">
                {acc[selectedAccount].isActive?
                  <>Deactivating {acc[selectedAccount].name}</>
                :
                  <>Activating {acc[selectedAccount].name}</>
                }
              </h3>
            </div>
            <div className="row m-0 p-0 mb-3">
              <div className="col-12 px-3 text-center">
                <strong>
                  Are you sure you want to
                  {acc[selectedAccount].isActive?
                  <> deactivate</>
                  :
                  <> activate</>
                  }
                  <br />
                  <span style={acc[selectedAccount].isActive?{ color: "#eda726" }:{ color: "#0d6efd" }}>
                    {acc[selectedAccount].name}?
                  </span>
                </strong>
              </div>
            </div>
            <div className="row m-0 p-0">
              <div className="col-12 px-3 d-flex justify-content-center">
                <Table size="sm">
                  <tbody>
                    <tr>
                      <td>Name</td>
                      <td>{acc[selectedAccount].name}</td>
                    </tr>
                    <tr>
                      <td>Designation</td>
                      <td>{acc[selectedAccount].designation}</td>
                    </tr>
                    <tr>
                      <td>Password</td>
                      <td>{acc[selectedAccount].password}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer
          className="d-flex justify-content-center"
        >
          <Button
            className={"btn " + (acc[selectedAccount].isActive?"btn-light":"btn-warning") +" float-start"}
            style={{ width: "6rem" }}
            onClick={() => props.onHide()}
          >
            Cancel
          </Button>
          <Button
            className={"btn " + (acc[selectedAccount].isActive?"btn-warning":"btn-light") +" float-start"}
            style={{ width: "11rem", color: (acc[selectedAccount].isActive?"#ffffff":"#000000") }}
            onClick={() => { deactivateAccount() }}
          >
            {acc[selectedAccount].isActive?
            <>Deactivate </>
            :
            <>Activate </>
            }
            Account
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  return (
    <div>
      <UserRouter
        route='/accountmanagement'
      />

      <Navigation
        page='/profileManagement'
      />


      <AddAccountModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        list={account}
      />

      <EditAccountModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
      />
      <DeleteAccountModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      />
      <DeactivateAccountModal
        show={showDeactivateModal}
        onHide={() => setShowDeactivateModal(false)}
      />
      <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
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
                    <Nav.Link as={Link} to="/accountmanagement" active>Users</Nav.Link>
                  </Nav>
                </Card.Body>
              </Card>
            </div>
            <div className="divider"></div>
            <div className='data-contents'>
              <div className="module-contents row py-1 m-0 align-items-start flex-column" style={{ height: "800px" }}>
                <div className='row m-0'>
                  <h1 className='text-center pb-2 module-title'>Manage Users</h1>
                  <hr></hr>
                  <div className="accounts-toast">
                    <div className="IMS-toast-container">
                      <div className="IMS-toast">
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                          <ToastContainer
                            className="w-100 h-100 d-flex align-items-center justify-content-center"
                            newestOnTop={false}
                            rtl={false}
                            pauseOnFocusLoss
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
                <div className="row m-0">
                  <div className="row py-1 m-0 mb-2 d-flex align-items-center">
                    <div className="col">
                      <h5>List of Users</h5>
                    </div>
                    <div className="col">
                      <div className="float-end">
                        <Button
                          className="add me-1"
                          data-title="Add an Account"
                          onClick={() => setShowAddModal(true)}
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
                        <th className='mn pth text-center'>Manage User</th>
                      </tr>
                    </thead>

                    <tbody>
                      {account === undefined?
                      <tr>
                        <td colSpan={4} className="text-center">
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-5">
                        <Spinner
                          color1="#b0e4ff"
                          color2="#fff"
                          textColor="rgba(0,0,0, 0.5)"
                          className="w-25 h-25"
                        />
                      </div>
                        </td>
                      </tr>
                      :
                        <>
                        {account.map((acc, i) => {
                          return (
                            <>
                              <tr
                                key={i}
                                style={acc.isActive ? {} : { color: "#939899" }}
                              >
                                <td className="nm pt-entry text-center">
                                  {acc.isAdmin ?
                                    <strong>{acc.name}</strong>
                                    :
                                    <>{acc.name}</>
                                  }
                                </td>
                                <td className="ds pt-entry text-center">
                                  {acc.designation}
                                </td>
                                <td className="ps pt-entry text-center">
                                  {acc.password}
                                </td>
                                <td className="mn pt-entry text-center" >
                                  {acc.isAdmin ?
                                    <Button
                                      className="edit me-1"
                                      data-title="Edit Account"
                                      onClick={() => { setSelectedAccount(i); setShowEditModal(true) }}
                                    >
                                      <FontAwesomeIcon icon={faEdit} />
                                    </Button>
                                    :
                                    <>
                                      <Button
                                        className="edit me-1"
                                        data-title="Edit Account"
                                        onClick={() => { setSelectedAccount(i); setShowEditModal(true) }}
                                      >
                                        <FontAwesomeIcon icon={faEdit} />
                                      </Button>
                                      <Button
                                        className="deactivate me-1"
                                        data-title="Activate/Deactivate Account"
                                        onClick={() => { setSelectedAccount(i); setShowDeactivateModal(true) }}
                                      >
                                        <FontAwesomeIcon icon={faBan} />
                                      </Button>
                                      <Button
                                        className="delete"
  
                                        data-title="Delete Account"
                                        onClick={() => { setSelectedAccount(i); setShowDeleteModal(true) }}
                                      >
                                        <FontAwesomeIcon icon={faTrashCan} />
                                      </Button>
                                    </>
                                  }
                                </td>
                              </tr>
                            </>
                          )
                        })}
                        </>
                      
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
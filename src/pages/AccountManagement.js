import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase-config';
import { collection, doc, onSnapshot, query, updateDoc, where, orderBy } from 'firebase/firestore';

import { UserAuth } from '../context/AuthContext';
import Tips from '../components/Tips';
import UserRouter from '../pages/UserRouter'

import { Tab, Button, Card, Modal, Nav, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faEdit, faMinusCircle, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast, Zoom } from "react-toastify";
import { Spinner } from 'loading-animations-react';


function AccountManagement() {
  const { user } = UserAuth(); // user credentials
  const [userID, setUserID] = useState(""); // user id
  const [userCollection, setUserCollection] = useState([]); // users collection
  const [profileID, setProfileID] = useState([]); // user profile id
  const [account, setAccount] = useState(); // user accounts
  const [selectedAccount, setSelectedAccount] = useState(0); // selected user account

  const [salesRecordCollection, setSalesRecordCollection] = useState([]);
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([])

  const [showEditModal, setShowEditModal] = useState(false); // display/hide edit modal
  const [showAddModal, setShowAddModal] = useState(false); // display/hide add modal
  const [showDeleteModal, setShowDeleteModal] = useState(false); // display/hide edit modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false); // display/hide edit modal

  //=============================== START OF STATE LISTENERS ===============================
  // set user id
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  // fetch users collection
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

  // assign user's profile
  useEffect(() => {
    userCollection.map((metadata) => {
      setAccount(metadata.accounts)
      setProfileID(metadata.id)
    });
  }, [userCollection])

  // fetch purchase records collection
  useEffect(() => {
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

  // fetch sales records collection
  useEffect(() => {
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
  //=============================== END OF STATE LISTENERS ===============================

  // edit user modal
  function EditUserModal(param) {
    var acc = [] // get users list and place in temp array
    if (account === undefined) {
      acc = [{ name: "", designation: "", isActive: false, }]
    }
    else {
      acc = account;
    }
    var index = selectedAccount; // index of user to edit
    const [name, setName] = useState(acc[index].name); // user name variable
    const [designation, setDesignation] = useState(acc[index].designation); // user designation variable
    const [password, setPassword] = useState(acc[index].password); // user password variable
    const [isComplete, setIsComplete] = useState(2); // user input completion checker

    // user editing prompt
    const editSuccessToast = () => {
      toast.info('Updating ' + name, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    // apply changes
    const saveEdit = async () => {
      // change the values of the array
      acc[index].designation = designation;
      acc[index].password = password;

      await updateDoc(doc(db, 'user', profileID), {
        accounts: acc,// replace firestore accounts array with temp array
      });
      editSuccessToast()
      param.onHide()
    }

    return (
      <Modal
        {...param}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal"
      >
        <Modal.Body >
          <div className="px-3 py-2">
            <div className="module-header mb-4">
              <h3 className="text-center">Editing <span style={{ color: '#000' }}>{acc[index].name}</span></h3>
            </div>
            <div className="row my-2 mb-3">
              <div className='col-12 ps-4'>
                <label>Designation</label>
                <input type="text"
                  className="form-control shadow-none"
                  placeholder="Warehouse Supervisor"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
            disabled={isComplete < 2 ? true : false}
            onClick={() => saveEdit()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // add user modal
  function AddUserModal(param) {
    var acc = param.list;//get user list and place in temp array
    var object = {// create a temp account object
      name: '',
      designation: '',
      password: '',
      isActive: true,
    }
    const [name, setName] = useState(""); // user name variable
    const [designation, setDesignation] = useState(""); // user designation variable
    const [password, setPassword] = useState(""); // user password variable

    // user addition prompt
    const addSuccessToast = (name) => {
      toast.success('User for ' + name + ' created', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    // add user
    const saveAdd = async () => {
      // change the values of the object
      object.name = name;
      object.designation = designation;
      object.password = password;
      acc.push(object)

      await updateDoc(doc(db, 'user', profileID), {
        accounts: acc,// replace firestore accounts array with temp array
      });
      addSuccessToast(name)
      param.onHide()
    }

    return (
      <Modal
        {...param}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal"
      >
        <Modal.Body >
          <div className="px-3 py-2">
            <div className="module-header mb-4">
              <h3 className="text-center">Add a User</h3>
            </div>
            <div className="row my-2 mb-3">
              <div className='col-12 ps-4'>
                <label>Employee Name</label>
                <input type="text"
                  className="form-control shadow-none"
                  placeholder="Annie Batumbakal"
                  autoFocus
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            <div className="row my-2 mb-3">
              <div className='col-12 ps-4'>
                <label>Designation</label>
                <input type="text"
                  className="form-control shadow-none"
                  placeholder="Warehouse Supervisor"
                  onChange={(e) => setDesignation(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
            onClick={() => saveAdd()}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  // check if user has issued transactions
  function checkUserActivity(name) {
    var all_records = salesRecordCollection.concat(purchaseRecordCollection) // records container
    for (var i = 0; i < all_records.length; i++) {
      if (all_records[i].issuer == name) {
        return true;
      }
    }
  }

  // delete user modal
  function DeleteUserModal(props) {
    var acc = []; // get users list and place in temp array
    if (account === undefined) {
      acc = [{ name: "", designation: "", isActive: false, }]
    }
    else {
      acc = account;
    }
    var index = selectedAccount; // index of account to edit

    // user deletion prompt
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

    // delete user
    const deleteUser = () => {
      var spliceAcc = acc.splice(selectedAccount, 1);//pop account from array through index

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
            onClick={() => { deleteUser() }}
          >
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  // deactivate user modal
  function DeactivateUserModal(props) {
    var acc = []; //get users list and place in temp array
    if (account === undefined) {
      acc = [{ name: "", designation: "", isActive: false, }]
    }
    else {
      acc = account;
    }
    var index = selectedAccount; // index of account to edit

    const deactivateToast = () => {
      acc[selectedAccount].isActive ?
        toast.info("Activating " + acc[index].name, {
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
        toast.error("Deactivating " + acc[index].name, {
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

    // deactivate/activate user
    const deactivateUser = () => {
      const saveDeactivate = async () => {
        //activeness toggling
        if (acc[index].isActive) {
          acc[index].isActive = false
        }
        else {
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
        className={"IMS-modal " + (acc[selectedAccount].isActive ? "warning" : "")}
      >
        <Modal.Body >
          <div className="px-3 py-2">
            <div className="module-header mb-4">
              <h3 className="text-center">
                {acc[selectedAccount].isActive ?
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
                  {acc[selectedAccount].isActive ?
                    <> deactivate</>
                  :
                    <> activate</>
                  }
                  <br />
                  <span style={acc[selectedAccount].isActive ? { color: "#eda726" } : { color: "#0d6efd" }}>
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
            className={"btn " + (acc[selectedAccount].isActive ? "btn-light" : "btn-warning") + " float-start"}
            style={{ width: "6rem" }}
            onClick={() => props.onHide()}
          >
            Cancel
          </Button>
          <Button
            className={"btn " + (acc[selectedAccount].isActive ? "btn-warning" : "btn-light") + " float-start"}
            style={{ width: "11rem", color: (acc[selectedAccount].isActive ? "#ffffff" : "#000000") }}
            onClick={() => { deactivateUser() }}
          >
            {acc[selectedAccount].isActive ?
              <>Deactivate </>
              :
              <>Activate </>
            }
            User
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
      <Tips
        page='/profileManagement'
      />
      <AddUserModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        list={account}
      />
      <EditUserModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
      />
      <DeleteUserModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      />
      <DeactivateUserModal
        show={showDeactivateModal}
        onHide={() => setShowDeactivateModal(false)}
      />
      <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
        <div id="contents" className="row">
          <div className="row  py-4 px-5">
            <div className='sidebar'>
              <Card className="sidebar-card">
                <Card.Header className="bg-primary text-white py-3 text-center left-curve right-curve">
                  <h4><strong>Account Management</strong></h4>
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
                          data-title="Add a User"
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
                      {account === undefined ?
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
                                        data-title="Edit User"
                                        onClick={() => { setSelectedAccount(i); setShowEditModal(true) }}
                                      >
                                        <FontAwesomeIcon icon={faEdit} />
                                      </Button>
                                    :
                                      <>
                                        <Button
                                          className="edit me-1"
                                          data-title="Edit User"
                                          onClick={() => { setSelectedAccount(i); setShowEditModal(true) }}
                                        >
                                          <FontAwesomeIcon icon={faEdit} />
                                        </Button>
                                        <Button
                                          className={(acc.isActive ? "deactivate" : "activate") + " me-1"}
                                          data-title={(acc.isActive ? "Deactivate" : "Activate") + " User"}
                                          onClick={() => { setSelectedAccount(i); setShowDeactivateModal(true) }}
                                        >
                                          {acc.isActive ?
                                            <FontAwesomeIcon icon={faMinusCircle} />
                                          :
                                            <FontAwesomeIcon icon={faCheckCircle} />
                                          }
                                        </Button>
                                        <Button
                                          className={checkUserActivity(acc.name) ? "delete disabled-conditionally" : "delete"}
                                          disabled={checkUserActivity(acc.name)}
                                          data-title={checkUserActivity(acc.name) ? "User issued transactions" : "Delete User"}
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
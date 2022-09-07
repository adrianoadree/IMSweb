import React from 'react';
import { Tab, Button, Card, ListGroup, Modal, Form, Alert, Nav } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch } from '@fortawesome/free-solid-svg-icons'
import { Person, Location, PhonePortrait, Layers, Mail, Call, InformationCircle } from 'react-ionicons'
import NewSupplierModal from '../components/NewSupplierModal';
import { useNavigate, Link } from 'react-router-dom';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import Barcode from 'react-barcode';
import JsBarcode from "jsbarcode";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";




function BetaPage() {

  //---------------------VARIABLES---------------------
  const [editShow, setEditShow] = useState(false); //display/ hide edit modal
  const [modalShow, setModalShow] = useState(false);//display/hide modal
  const [supplier, setSupplier] = useState([]); //supplier Collection
  const [supplierDoc, setSupplierDoc] = useState([]); //supplier Doc
  const [docId, setDocId] = useState("xx"); //document id variable
  let navigate = useNavigate();

  //---------------------FUNCTIONS---------------------
  
  //Read supplier collection from database
  useEffect(() => {
      const supplierCollectionRef = collection(db, "supplier")
      const q = query(supplierCollectionRef);
      const unsub = onSnapshot(q, (snapshot) =>
          setSupplier(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
  }, [])


  useEffect(() => {
      async function readSupplierDoc() {
          const salesRecord = doc(db, "supplier", docId)
          const docSnap = await getDoc(salesRecord)
          if (docSnap.exists()) {
              setSupplierDoc(docSnap.data());
          }
      }
      console.log("Updated Supplier Info")
      readSupplierDoc()
  }, [docId])




  //delete Toast
  const deleteToast = () => {
      toast.error('Supplier DELETED from the Database', {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
      });
  }
  //Delete collection from database
  const deleteSupplier = async (id) => {
      const supplierDoc = doc(db, "supplier", id)
      deleteToast();
      await deleteDoc(supplierDoc);
  }




  const handleClose = () => setEditShow(false);

  function EditSupplierModal(props) {


    //-----------------VARIABLES------------------
    const [newSuppName, setNewSuppName] = useState("");
    const [newSuppAddress, setNewSuppAddress] = useState("");
    const [newSuppEmail, setNewSuppEmail] = useState("");
    const [newSuppMobileNum, setSuppNewMobileNum] = useState(0);
    const [newSuppTelNum, setNewSuppTelNum] = useState(0);

    //SetValues
    useEffect(() => {
        setNewSuppName(supplierDoc.supplier_name)
        setNewSuppAddress(supplierDoc.supplier_address)
        setNewSuppEmail(supplierDoc.supplier_emailaddress)
        setSuppNewMobileNum(supplierDoc.supplier_mobileNum)
        setNewSuppTelNum(supplierDoc.supplier_telNum)
    }, [docId])


    //delete Toast
    const updateToast = () => {
        toast.info(' Supplier Information Successfully Updated', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        })
    }

    //update Supplier Document
    function updateSupplier() {
        updateDoc(doc(db, "supplier", docId), {
            supplier_name: newSuppName
            , supplier_emailaddress: newSuppEmail
            , supplier_address: newSuppAddress
            , supplier_mobileNum: Number(newSuppMobileNum)
            , supplier_telNum: Number(newSuppTelNum)
        });
        updateToast()
        handleClose();
    }




    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
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

            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Edit <strong>{newSuppName}</strong>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <div className="p-3">
                    <div className="row my-2">
                        <div className='row'>
                            <div className='col-8'>
                                <label>Supplier Name</label>

                                <input type="text"
                                    className="form-control"
                                    placeholder="Supplier Name"
                                    value={newSuppName}
                                    onChange={(event) => { setNewSuppName(event.target.value); }}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="row my-2">
                        <div className="col-12">
                            <label>Address</label>
                            <input type="text"
                                className="form-control"
                                placeholder="Address"
                                rows={3}
                                value={newSuppAddress}
                                onChange={(event) => { setNewSuppAddress(event.target.value); }}
                            />
                        </div>
                    </div>


                    <h5>Contact Information</h5>
                    <hr></hr>

                    <div className="row my-2">
                        <div className="col-7">
                            <label>Email Address</label>
                            <input type="email"
                                className="form-control"
                                placeholder="*****@email.com"
                                value={newSuppEmail}
                                onChange={(event) => { setNewSuppEmail(event.target.value); }}
                            />
                        </div>
                    </div>

                    <div className="row my-2">
                        <div className="col-6">
                            <label>Mobile Number</label>
                            <input type="number"
                                className="form-control"
                                placeholder="09---------"
                                value={newSuppMobileNum}
                                onChange={(event) => { setSuppNewMobileNum(event.target.value); }}
                            />
                        </div>
                    </div>

                    <div className="row my-2">
                        <div className="col-6">
                            <label>Telephone Number</label>
                            <input type="number"
                                className="form-control"
                                placeholder="Contact Number"
                                value={newSuppTelNum}
                                onChange={(event) => { setNewSuppTelNum(event.target.value); }}
                            />
                        </div>
                    </div>


                </div>

            </Modal.Body>
            <Modal.Footer>
                <Button
                    onClick={() => { updateSupplier(docId) }}
                >
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

  return (
    <div>
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
        <div className="row contents">
          <div className="row  py-4 px-5">
            <div className='sidebar'>
              <Card className="sidebar-card">
                  <Card.Header className="bg-primary text-white py-3 text-center left-curve right-curve">
                    <h4><strong>Account Management</strong></h4>
                  </Card.Header>
                  <Card.Body>
                    <Nav className="account-management-tab mb-3 flex-column" defaultActiveKey="/betapage">
                      <Nav.Link as={Link} to="/betapage" active>Profile</Nav.Link>
                      <Nav.Link as={Link} to="/betapage">Accounts</Nav.Link>
                    </Nav>
                  </Card.Body>
              </Card>
            </div>
            <div className="divider"></div>
            <div className='data-contents'>
              <div className="module-contents row py-1 m-0">
                <div className='row m-0'>
                  <h1 className='text-center pb-2 module-title'>User Profile</h1>
                  <hr></hr>
                </div>
                <div className="row m-0 account-management-form">
                  <div className="account-management-form-section">
                    <div className="row m-0">
                      <h4>Profile</h4>
                    </div>
                    <div className="row m-0 account-management-form-section-contents">
                      <div className="col-6">
                        <input type="text"
                          className="form-control"
                          required
                          autoFocus
                          onChange={(event) => {  }}
                        />
                        <span className="floating-label">Name</span>
                      </div>
                      <div className="col-6">
                        <input type="text"
                          className="form-control"
                          required
                          onChange={(event) => {  }}
                        />
                        <span className="floating-label">Email Address</span>
                      </div>
                      <div className="col-4">
                        <input type="text"
                          className="form-control"
                          required
                          autoFocus
                          onChange={(event) => {  }}
                        />
                        <span className="floating-label">Phone Number</span>
                      </div>
                      <div className="col-8">
                        <input type="text"
                          className="form-control"
                          required
                          onChange={(event) => {  }}
                        />
                        <span className="floating-label">Address</span>
                      </div>
                    </div>
                  </div>
                  <div className="account-management-form-section">
                    <div className="row m-0">
                      <h4>Business Profile</h4>
                    </div>
                    <div className="row m-0 account-management-form-section-contents">
                      <div className="col-12">
                        <input type="text"
                          className="form-control"
                          required
                          autoFocus
                          onChange={(event) => {  }}
                        />
                        <span className="floating-label">Business Name</span>
                      </div>
                      <div className="col-12">
                        <input type="text"
                          className="form-control"
                          required
                          onChange={(event) => {  }}
                        />
                        <span className="floating-label">Business Address</span>
                      </div>
                      <div className="col-6">
                        <input type="text"
                          className="form-control"
                          required
                          onChange={(event) => {  }}
                        />
                        <span className="floating-label">Nature of Business</span>
                      </div>
                      <div className="col-6">
                        <select type="text"
                          className="form-control"
                          required
                          onChange={(event) => {  }}>
                            <option>Operation Type</option>
                            <option value="online">Online</option>
                            <option value="physical">Physical</option>
                            <option value="both">Both online and physical</option>
                        </select>
                      </div>
                      <div className="col-4">
                        <input type="text"
                          className="form-control"
                          required
                          autoFocus
                          onChange={(event) => {  }}
                        />
                        <span className="floating-label">Phone Number</span>
                      </div>
                      <div className="col-8">
                        <input type="text"
                          className="form-control"
                          required
                          onChange={(event) => {  }}
                        />
                        <span className="floating-label">Email Address</span>
                      </div>
                      <div className="col-12">
                        <label>Business Requirements</label>
                        <form action="">
                          <input type="file" id="requirement" name="file"/>
                          <input type="submit" name="Submit"/>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Tab.Container>
    </div>
  );
}

export default BetaPage;
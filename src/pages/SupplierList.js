import React from 'react';
import { Tab, Button, Card, ListGroup, Modal, Form, Alert } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch } from '@fortawesome/free-solid-svg-icons'
import { Person, Location, PhonePortrait, Layers, Mail, Call, InformationCircle } from 'react-ionicons'
import NewSupplierModal from '../components/NewSupplierModal';
import { useNavigate } from 'react-router-dom';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc, where } from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import Barcode from 'react-barcode';
import JsBarcode from "jsbarcode";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { UserAuth } from '../context/AuthContext'




function SupplierList() {

  //---------------------VARIABLES---------------------

  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [key, setKey] = useState('main');//Tab controller

  const [editShow, setEditShow] = useState(false); //display/ hide edit modal
  const [modalShow, setModalShow] = useState(false);//display/hide modal
  const [supplier, setSupplier] = useState([]); //supplier Collection
  const [supplierDoc, setSupplierDoc] = useState([]); //supplier Doc
  const [docId, setDocId] = useState("xx"); //document id variable

  //---------------------FUNCTIONS---------------------


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])



  useEffect(() => {
    //read sales_record collection
    if (userID === undefined) {

      const supplierCollectionRef = collection(db, "supplier")
      const q = query(supplierCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setSupplier(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {

      const supplierCollectionRef = collection(db, "supplier")
      const q = query(supplierCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setSupplier(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;

    }

  }, [userID])

  useEffect(() => {
    async function readSupplierDoc() {
      const salesRecord = doc(db, "supplier", docId)
      const docSnap = await getDoc(salesRecord)
      if (docSnap.exists()) {
        setSupplierDoc(docSnap.data());
      }
    }
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
    setKey('main')
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

      <Tab.Container
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}>
        <div className="row contents">
          <div className="row  py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header>
                  <div className='row'>
                    <div className="col-1">
                      <Button className="fc-search left-full-curve no-click me-0"
                        onClick={() => setModalShow(true)}>
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                    <div className="col-11">
                      <FormControl
                        placeholder="Search"
                        aria-label="Search"
                        aria-describedby="basic-addon2"
                        className="fc-search right-full-curve mw-0"
                      />
                    </div>
                  </div>
                </Card.Header>
                <Card.Body style={{ height: "500px" }}>
                  <div className="row g-1 sidebar-header">
                    <div className="col-4 left-curve">
                      Supplier ID
                    </div>
                    <div className="col-8 right-curve">
                      Supplier Name
                    </div>
                  </div>
                  <div id='scrollbar'>
                    {supplier.length === 0 ?

                      <div className='py-4 px-2'>
                        <Alert variant="secondary" className='text-center'>
                          <p>
                            <strong>No Recorded Supplier</strong>
                          </p>
                        </Alert>
                      </div>
                      :
                      <ListGroup variant="flush">
                      {supplier.map((supplier) => {
                        return (
                          <ListGroup.Item
                            action
                            key={supplier.id}
                            eventKey={supplier.id}
                            onClick={() => { setDocId(supplier.id) }}>
                            <div className="row gx-0 sidebar-contents">
                              <div className="col-4">
                                <small>{supplier.id}</small>
                              </div>
                              <div className="col-8">
                                <small>{supplier.supplier_name}</small>
                              </div>
                            </div>
                          </ListGroup.Item>
                        )
                      })}

                    </ListGroup>
                    }

                  
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="divider"></div>
            <div className='data-contents'>
              <Tab.Content>
                <Tab.Pane eventKey='main'>
                  <div className="module-contents row py-1 m-0">
                    <div className='row m-0'>
                      <h1 className='text-center pb-2 module-title'>Supplier List</h1>
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
                        <h4 className="data-id">ITEM CODE</h4>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <NewSupplierModal
                            show={modalShow}
                            onHide={() => setModalShow(false)}
                          />
                          <Button
                            className="add me-1"
                            data-title="Add New Supplier"
                            onClick={() => setModalShow(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          <Button
                            disabled
                            className="edit me-1"
                            data-title="Edit Supplier">
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            disabled
                            className="delete me-1"
                            data-title="Delete Supplier">
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="row py-1 data-specs m-0" id="supplier-info">
                      <div className="col-12 py-3">
                        <div className="row m-0 mb-4">
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Person
                                className="me-2 pull-down"
                                color={'#000000'}
                                height="25px"
                                width="25px"
                                title={'Description'}
                              />
                            </span>
                            <span className="data-label">Supplier Name</span>
                          </div>
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Location
                                className="me-2 pull-down"
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label">
                              Address
                            </span>
                          </div>
                        </div>
                        <div className="row m-0 mb-4">
                          <div className="col-3 px-1">
                            <span className="data-icon sm">
                              <PhonePortrait
                                className="me-2 pull-down"
                                color={'#000000'}
                                height="25px"
                                width="25px"
                                title={'Selling Price'}
                              />
                            </span>
                            <span className="data-label sm">Selling Price</span>
                          </div>
                          <div className="col-3 px-1">
                            <span className="data-icon sm">
                              <Call
                                className="me-2 pull-down"
                                color={'#00000'}
                                title={'Purchase Price'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label sm">
                              Purchase Price
                            </span>
                          </div>
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Mail
                                className="me-2 pull-down"
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label">
                              Barcode
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey={docId}>
                  <div className='row py-1 m-0' id="supplier-contents">
                    <div className='row m-0'>
                      <h1 className='text-center pb-2 module-title'>Supplier List</h1>
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
                        <h4 className="data-id">{docId}</h4>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <NewSupplierModal
                            show={modalShow}
                            onHide={() => setModalShow(false)}
                          />
                          <Button
                            className="add me-1"
                            data-title="Add New Supplier"
                            onClick={() => setModalShow(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          <EditSupplierModal
                            show={editShow}
                            onHide={() => setEditShow(false)}
                          />
                          <Button
                            className="edit me-1"
                            data-title="Edit Supplier"
                            onClick={() => setEditShow(true)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            className="delete me-1"
                            data-title="Delete Supplier"
                            onClick={() => { deleteSupplier(docId) }}>
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="row py-1 data-specs" id="supplier-info">
                      <div className="col-12 py-3">
                        <div className="row m-0 mb-4">
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Person
                                className="me-2 pull-down"
                                color={'#000000'}
                                height="25px"
                                width="25px"
                                data-title={'Supplier Description'}
                              />
                            </span>
                            <span className="data-label">
                              {supplierDoc.supplier_name}
                            </span>
                          </div>
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Location
                                className="me-2 pull-down"
                                color={'#00000'}
                                data-title={'Supplier Category'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label">
                              {supplierDoc.supplier_address}
                            </span>
                          </div>
                        </div>
                        <div className="row m-0 mb-4">
                          <div className="col-3 px-1">
                            <span className="data-icon md">
                              <PhonePortrait
                                className="me-2 pull-down"
                                color={'#000000'}
                                height="25px"
                                width="25px"
                                data-title={'Selling Price'}
                              />
                            </span>
                            <span className="data-label md">
                              {supplierDoc.supplier_mobileNum}
                            </span>
                          </div>
                          <div className="col-3 px-1">
                            <span className="data-icon md">
                              <Call
                                className="me-2 pull-down"
                                color={'#00000'}
                                data-title={'Purchase Price'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label md">
                              {supplierDoc.supplier_telNum}
                            </span>
                          </div>
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Mail
                                className="me-2 pull-down"
                                color={'#00000'}
                                data-title="Barcode"
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label">
                              {supplierDoc.supplier_emailaddress}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
              </Tab.Content>
            </div>
          </div>
        </div>
      </Tab.Container>
    </div>
  );
}

export default SupplierList;
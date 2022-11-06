import RPersoneact from 'react';
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
import UserRouter from '../pages/UserRouter'
import { UserAuth } from '../context/AuthContext'
import { Spinner } from 'loading-animations-react';




function SupplierList() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [key, setKey] = useState('main');//Tab controller
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved

  const [editShow, setEditShow] = useState(false); //display/ hide edit modal
  const [modalShow, setModalShow] = useState(false);//display/hide modal
  const [supplier, setSupplier] = useState(); //supplier Collection
  const [supplierDoc, setSupplierDoc] = useState([]); //supplier Doc
  const [docId, setDocId] = useState("xx"); //document id variable

  //---------------------FUNCTIONS---------------------


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  useEffect(() => {
    console.log(isFetched)
  },)

  useEffect(() => {
    if (supplier === undefined) {
      setIsFetched(false)
    }
    else {
      setIsFetched(true)
    }
  }, [supplier])

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



  // ===================================== START OF SEARCH FUNCTION =====================================



  const [searchValue, setSearchValue] = useState('');    // the value of the search field 
  const [searchResult, setSearchResult] = useState();    // the search result


  useEffect(() => {
    setSearchResult(supplier)
  }, [supplier])



  const filter = (e) => {
    const keyword = e.target.value;

    if (keyword !== '') {
      const results = supplier.filter((supplier) => {
        return supplier.supplier_name.toLowerCase().startsWith(keyword.toLowerCase()) ||
          supplier.id.toLowerCase().startsWith(keyword.toLowerCase());
        // Use the toLowerCase() method to make it case-insensitive
      });
      setSearchResult(results);
    } else {
      setSearchResult(supplier);
      // If the text field is empty, show all users
    }

    setSearchValue(keyword);
  };

  // ====================================== END OF SEARCH FUNCTION ======================================


  return (
    <div>
      <UserRouter
        route='supplier'
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

      <Tab.Container
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}>
        <div id="contents" className="row">
          <div className="row  py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header>
                  <div className='row'>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="basic-addon1">
                        <FontAwesomeIcon icon={faSearch} />
                      </InputGroup.Text>
                      <FormControl
                        type="search"
                        value={searchValue}
                        onChange={filter}
                        className="input"
                        placeholder="Search by Supplier ID/Name"
                      />
                    </InputGroup>
                  </div>
                </Card.Header>
                <Card.Body style={{ height: "500px" }}>
                  <div className="row g-1 sidebar-header">
                    <div className="col-2 left-curve">
                      <div  style={{fontSize: '0.6em'}}>Supplier</div>
                      ID
                    </div>
                    <div className="col-6">
                      Supplier Name
                    </div>
                    <div className="col-4 right-curve">
                      Contact Number
                    </div>
                  </div>
                  <div id='scrollbar' style={{ height: '400px' }}>
                    {isFetched ?
                      (
                        supplier.length === 0 ?
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                            <h5 className="mb-3"><strong>No <span style={{ color: '#0d6efd' }}>supplier</span> to show.</strong></h5>
                            <p className="d-flex align-items-center justify-content-center">
                              <span>Click the</span>
                              <Button
                                className="add ms-1 me-1 static-button no-click"
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </Button>
                              <span>
                                button to add one.
                              </span>
                            </p>
                          </div>
                          :
                          <ListGroup variant="flush">
                            {searchResult && searchResult.length > 0 ? (
                              searchResult.map((supplier) => (
                                <ListGroup.Item
                                  action
                                  key={supplier.id}
                                  eventKey={supplier.id}
                                  onClick={() => { setDocId(supplier.id) }}
                                >
                                  <div className="row gx-0 sidebar-contents">
                                    <div className="col-4">
                                      {supplier.id}
                                    </div>
                                    <div className="col-8">
                                      {supplier.supplier_name}
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              ))
                            ) : (
                              <div className='mt-5 text-center'>
                                <Alert variant='danger'>
                                  No Search Result for
                                  <br /><strong>{searchValue}</strong>
                                </Alert>
                              </div>
                            )}

                          </ListGroup>
                      )
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
                              <div className="col-2">
                                <small>{supplier.id.substring(0,5)}</small>
                              </div>
                              <div className="col-6">
                                <small>{supplier.supplier_name}</small>
                              </div>
                              <div className="col-4">
                                <small>{supplier.supplier_mobileNum}</small>
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
                                color={'#000000'}
                                height="25px"
                                width="25px"
                                title={'Mobile Number'}
                              />
                            </span>
                            <span className="data-label sm">Mobile Number</span>
                          </div>
                          <div className="col-3 px-1">
                            <span className="data-icon sm">
                              <Call
                                color={'#00000'}
                                title={'Telephone Number'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label sm">
                              Telephone Number
                            </span>
                          </div>
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Mail
                                color={'#00000'}
                                title={'Email Address'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label">
                              Email Address
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>

                <Tab.Pane eventKey={docId}>
                  <div className='row py-1 m-0' id="supplier-contents">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Supplier List</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                      <div className="col d-flex align-items-center">
                          <div className="me-2">
                            <InformationCircle
                              color="#0d6efd"
                              height="40px"
                              width="40px"
                            />
                          </div>
                          <div>
                            <h4 className="data-id">
                              <strong>{docId.substring(0, 5)}</strong>
                            </h4>
                          </div>
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
                    <div className="row p-1 m-0 data-specs d-flex align-items-center" id="supplier-info">
                      <div className="mb-3">
                        <div className="row m-0 mt-2">
                          <div className="col-12">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-1 data-icon d-flex align-items-center justify-content-center"
                                data-title="Supplier Name"
                              >
                              <Person
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-11 data-label">
                                {supplierDoc.supplier_name}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row m-0 mt-2">
                          <div className="col-12">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-1 data-icon d-flex align-items-center justify-content-center"
                                data-title="Address"
                              >
                              <Location
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-11 data-label">
                                {supplierDoc.supplier_address}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row m-0 mt-2">
                          <div className="col-4">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Mobile Number"
                              >
                              <PhonePortrait
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-9 data-label">
                                {supplierDoc.supplier_mobileNum === undefined || supplierDoc.supplier_mobileNum == "" || supplierDoc.supplier_mobileNum == " "?
                                  <div style={{fontStyle: 'italic', opacity: '0.8'}}>None</div>
                                :
                                  <>{supplierDoc.supplier_mobileNum}</>
                                }
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Telephone Number"
                              >
                              <Call
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-9 data-label">
                                {supplierDoc.supplier_telNum === undefined || supplierDoc.supplier_telNum == "" || supplierDoc.supplier_telNum == " "?
                                  <div style={{fontStyle: 'italic', opacity: '0.8'}}>None</div>
                                :
                                  <>{supplierDoc.supplier_telNum}</>
                                }
                              </div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Email Address"
                              >
                              <Mail
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-9 data-label">
                                {supplierDoc.supplier_emailaddress === undefined || supplierDoc.supplier_emailaddress == "" || supplierDoc.supplier_emailaddress == " "?
                                  <div style={{fontStyle: 'italic', opacity: '0.8'}}>None</div>
                                :
                                  <>{supplierDoc.supplier_emailaddress}</>
                                }
                              </div>
                            </div>
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
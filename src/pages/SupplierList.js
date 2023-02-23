import RPersoneact from 'react';
import { Tab, Button, Card, ListGroup, Modal, Form, Alert, Nav, Table } from 'react-bootstrap';
import Tips from '../components/Tips';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch } from '@fortawesome/free-solid-svg-icons'
import { Person, Location, PhonePortrait, Layers, Mail, Call, InformationCircle } from 'react-ionicons'
import NewSupplierModal from '../components/NewSupplierModal';
import { useNavigate } from 'react-router-dom';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc, where } from 'firebase/firestore';
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import Barcode from 'react-barcode';
import JsBarcode from "jsbarcode";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import UserRouter from '../pages/UserRouter'
import { UserAuth } from '../context/AuthContext'
import { Spinner } from 'loading-animations-react';
import  ProductQuickView  from '../components/ProductQuickView'

import RecordQuickView from "../components/RecordQuickView";




function SupplierList() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [key, setKey] = useState('main');//Tab controller
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved
  
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([]); //purchase_record Collection

  const [stockcardCollection, setStockcardCollection] = useState([]); // stockcardCollection variable
  const [showEditModal, setShowEditModal] = useState(false); //display/ hide edit modal
  const [showAddModal, setShowAddModal] = useState(false);//display/hide modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);//display/hide modal
  const [supplier, setSupplier] = useState(); //supplier Collection
  const [docId, setDocId] = useState(); //document id variable
  const [catalogue, setCatalogue] = useState([])
  const [transactions, setTransactions] = useState([])
  const [productToView, setProductToView] = useState(["IT0000001"])
  const [productQuickViewModalShow, setProductQuickViewModalShow] = useState(false); //product quick view modal
  const [collectionUpdateMethod, setCollectionUpdateMethod] = useState("add")
  
  const [recordQuickViewModalShow, setRecordQuickViewModalShow] = useState(false);
  const [recordToView, setRecordToView] = useState()

  //---------------------FUNCTIONS---------------------


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  useEffect(() => {
    console.log(catalogue)
  },)
  

  useEffect(() => {
    if (supplier === undefined) {
      setIsFetched(false)
    }
    else {
      setIsFetched(true)
      if(supplier.length > 0)
      {
        if(collectionUpdateMethod == "add")
        {
          setDocId(supplier.length-1)
          setKey(supplier[supplier.length-1].id)
        }
        else
        {
          setCollectionUpdateMethod("add")
        }
      }
      else
      {
        setDocId()
        setKey("main")
      }
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

  //Read stock card collection from database
  useEffect(() => {
    if (userID === undefined) {

      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setStockcardCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const purchaseCollectionRef = collection(db, "purchase_record")
      const qq = query(purchaseCollectionRef, where("user", "==", userID));

      const unsubscribe = onSnapshot(qq, (snapshot) =>
        setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );

      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setStockcardCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])


  const handleDocChange = (doc) => {
    supplier.map((supp, index)=>{
      if(supp.id == doc)
      {
        setDocId(index)
      }
    })
  }

  const getProductInfo = (product_id) => {
    var tempProd = {}
    stockcardCollection.map((prod)=>{
      if(prod.id == product_id){
        tempProd = prod
      }
    })
    return tempProd
  }

  const getTransactions = () => {
    var temp_transactions = []
    purchaseRecordCollection.map((purch)=>{
      if(purch.transaction_supplier == supplier[docId].id || purch.transaction_supplier == supplier[docId].supplier_name)
      {
        temp_transactions.push(purch)
      }
    })
    setTransactions(temp_transactions)
  }

  const fillCatalogue = () => {
    var temp_catalogue = []
    transactions.map((transaction)=>{
      transaction.product_list.map((product)=>{
        console.log(temp_catalogue.indexOf(product.itemId))
        if(temp_catalogue.indexOf(product.itemId) == -1)
        {
          
          temp_catalogue.push(product.itemId)
        }
      })
    })
    setCatalogue(temp_catalogue)
  }

  useEffect(() => {
    if(purchaseRecordCollection === undefined || docId === undefined)
    {

    }
    else
    {
      getTransactions()
    }
  }, [docId])

  useEffect(() => {
    if(transactions === undefined || stockcardCollection === undefined)
    {

    }
    else
    {
      fillCatalogue()
    }
  }, [transactions])


  // edit supplier Modal-----------------------------------------------------------------------------
  function EditSupplierModal(props) {

    //-----------------VARIABLES------------------
    const [newSuppName, setNewSuppName] = useState("");
    const [newSuppAddress, setNewSuppAddress] = useState("");
    const [newSuppEmail, setNewSuppEmail] = useState("");
    const [newSuppMobileNum, setNewSuppMobileNum] = useState("");
    const [newSuppTelNum, setNewSuppTelNum] = useState("");

    //SetValues
    useEffect(() => {
      if (supplier === undefined || docId === undefined) {

      }
      else
      {
      setNewSuppName(supplier[docId].supplier_name)
      setNewSuppAddress(supplier[docId].supplier_address)
      setNewSuppEmail(supplier[docId].supplier_emailaddress)
      setNewSuppMobileNum(supplier[docId].supplier_mobileNum)
      setNewSuppTelNum(supplier[docId].supplier_telNum)
      }
    }, [docId])


    //delete Toast
    const updateToast = () => {
      toast.info("Updating " + supplier[docId].supplier_name, {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Zoom
      })
    }

    //update Supplier Document
    function updateSupplier() {
      updateDoc(doc(db, "supplier", supplier[docId].id), {
        supplier_name: newSuppName
        , supplier_emailaddress: newSuppEmail
        , supplier_address: newSuppAddress
        , supplier_mobileNum: newSuppMobileNum
        , supplier_telNum: newSuppTelNum
      });
      updateToast()
      props.onHide()
    }

    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal"
      >

        <Modal.Body
          className="d-flex justify-content-center">

          {supplier ===  undefined || supplier.length == 0 || docId == undefined?
          <></>
          :
  
          <div className="px-3 py-2">
            <div className="module-header mb-4">
              <h3 className="text-center">Editing {supplier[docId].supplier_name}</h3>
            </div>
            <div className="row my-2 mb-3">
              <div className='col-3 ps-4'>
                <label>Supplier ID</label>

                <input type="text"
                  readOnly
                  className="form-control shadow-none no-click"
                  placeholder=""
                  value={supplier[docId].id.substring(0,5)}
                />
              </div>
              <div className='col-9 ps-4'>
                <label>
                  Supplier Name
                  <span style={{ color: '#b42525' }}> *</span>
                </label>
                <input type="text"
                  className="form-control shadow-none"
                  value={newSuppName}
                  autoFocus
                  onChange={(event) => { setNewSuppName(event.target.value); }}
                />
              </div>
            </div>
            <div className="row my-2 mb-3">
              <div className="col-12 ps-4">
                <label>Address</label>
                <input type="text"
                  className="form-control shadow-none"
                  value={newSuppAddress}
                  onChange={(event) => { setNewSuppAddress(event.target.value); }}
                />
              </div>
            </div>
            <hr></hr>
            <div className="row my-2 mb-3">
              <div className="col-6 ps-4">
                <label>Mobile Number</label>
                <input type="text"
                  className="form-control shadow-none"
                  value={newSuppMobileNum}
                  onChange={(event) => { setNewSuppMobileNum(event.target.value); }}
                />
              </div>
              <div className="col-6 ps-4">
                <label>Telephone Number</label>
                <input type="text"
                  className="form-control shadow-none"
                  value={newSuppTelNum}
                  onChange={(event) => { setNewSuppTelNum(event.target.value); }}
                />
              </div>
            </div>
            <div className="row my-2 mb-3">
              <div className="col-12 ps-4">
                <label>Email Address</label>
                <input type="email"
                  className="form-control shadow-none"
                  value={newSuppEmail}
                  onChange={(event) => { setNewSuppEmail(event.target.value); }}
                />
              </div>
            </div>
          </div>
          }
        </Modal.Body>
        <Modal.Footer
          className="d-flex justify-content-center"
        >
          <Button
            className="btn btn-danger"
            style={{ width: "6rem" }}
            onClick={() => props.onHide()}
          >
            Cancel
          </Button>
          <Button
            className="btn btn-light float-start"
            disabled={newSuppName === undefined || newSuppName == "" || newSuppName == " "}
            style={{ width: "10rem" }}
            onClick={() => { updateSupplier() }}>
            Update Supplier
          </Button>
        </Modal.Footer>
      </Modal>
    );

  }

    //Edit Stockcard Data Modal-----------------------------------------------------------------------------
    function DeleteSupplierModal(props) {

      
    //Delete collection from database
    const deleteSupplier = async () => {
      setDocId(0)
      setKey("main")
      deleteToast();
      props.onHide()
      const supplierDoc = doc(db, "supplier", supplier[docId].id)
      await deleteDoc(supplierDoc);
    }
  
      //delete Toast
      const deleteToast = () => {
        toast.error("Deleting " + supplier[docId].id.name + " from the Database", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          transition: Zoom
        });
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
          {(supplier === undefined || supplier.length == 0) || docId === undefined ?
          <></>
          :
          <div className="px-3 py-2">
            <div className="module-header mb-4">
              <h3 className="text-center">Deleting {supplier[docId].id.substring(0,5)}</h3>
            </div>
            <div className="row m-0 p-0 mb-3">
              <div className="col-12 px-3 text-center">
                <strong>
                  Are you sure you want to delete
                  <br />
                  <span style={{color: '#b42525'}}>{supplier[docId].supplier_name}?</span>
                </strong>
              </div>
            </div>
            <div className="row m-0 p-0">
                  <div className="col-12 px-3 d-flex justify-content-center">
                    <Table size="sm">
                      <tbody>
                        <tr>
                          <td>Name</td>
                          <td>{supplier[docId].supplier_name}</td>
                        </tr>
                        <tr>
                          <td>Address</td>
                          <td>{supplier[docId].supplier_address}</td>
                        </tr>
                        <tr>
                          <td>Telephone Number</td>
                          <td>{supplier[docId].supplier_telNum}</td>
                        </tr>
                        <tr>
                          <td>Mobile Number</td>
                          <td>{supplier[docId].supplier_mobileNum}</td>
                        </tr>
                        <tr>
                          <td>Email Address</td>
                          <td>{supplier[docId].supplier_emailaddress}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
          </div>
          }
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
              onClick={() => { deleteSupplier() }}
            >
              Delete Supplier
            </Button>
          </Modal.Footer>
        </Modal>
  
  
      )
    }


  function Transactions(props) {
    return(
      <div id="supplier-transactions">
        <Table hover={transactions.length > 0} className="scrollable-table">
        <thead>
          <tr>
            <th style={{width: "20%"}}>Transaction ID</th>
            <th style={{width: "15%"}}>Date</th>
            <th style={{width: "45%"}}>Products</th>
            <th style={{width: "20%"}}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length > 0?
            <>
              {transactions.map((transaction)=>{
                return(
                  <tr
                    className="clickable"
                    onClick={()=>{setRecordToView(transaction.id); setRecordQuickViewModalShow(true)}}
                  >
                    <td style={{width: "15%"}}>{transaction.id.substring(0,7)}</td>
                    <td style={{width: "15%"}}>{transaction.transaction_date}</td>
                    <td style={{width: "40%"}}>
                      {transaction.product_list.map((product, index) => {
                        return(
                          <>
                            <span>{getProductInfo(product.itemId).description} [{product.itemQuantity} units]
                            {index != transaction.product_list.length - 1?<>,</>:<></>}
                            </span>
                            <br/>
                          </>
                        )
                      })}
                    </td>
                    <td style={{width: "30%"}}>{transaction.transaction_note}</td>
                  </tr>
                )
              })}
            </>
          :
            <>
              <tr>
                <td 
                  colSpan={4}
                  className="full-column text-center pt-5"
                > 
                  No transactions yet
                </td>
              </tr>
            </>
          }
        </tbody>
        <tfoot>

        </tfoot>
        </Table>
      </div>
      
    )
  }

  function Catalogue(props) {
    return(
      <div id="catalogue">
        <div className="row h-100">
          {catalogue.length > 0?
            <>
            {catalogue.map((product)=>{
              return(
                <div className="col-3 p-3 d-flex align-items-center justify-content-center">
                  <Card 
                    className="warehouse-template"
                    onClick={()=>{setProductToView(product); setProductQuickViewModalShow(true)}}
                  >
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center p-1">
                        {getProductInfo(product).img === undefined || getProductInfo(product).img == "" || getProductInfo(product).img == " "?
                          <h6 className="p-2">{getProductInfo(product).description}</h6>
                        :
                          <img src={getProductInfo(product).img} style={{height: "100%", width: "100%", objectFit: "contain"}}/>
                        }
                      </div>
                  </Card>
                </div>
              )
            })}
            </>
          :
            <div className="col-12 h-100 pt-5 px-3 d-flex align-items-start justify-content-center">
                <strong style={{color: "#8193a1"}}>Catalogue is empty</strong>
            </div>
          }
          
        </div>
      </div>
    )
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
          supplier.id.toLowerCase().startsWith(keyword.toLowerCase()) || supplier.supplier_name.toLowerCase().includes(keyword.toLowerCase()) || supplier.supplier_mobileNum.includes(keyword);
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
        route='/supplier'
      />
      <Tips 
        page="/supplier"
      />

    <ProductQuickView
                                show={productQuickViewModalShow}
                                onHide={() => setProductQuickViewModalShow(false)}
                                productid={productToView}
                              />
    <RecordQuickView
        show={recordQuickViewModalShow}
        onHide={() => setRecordQuickViewModalShow(false)}
        recordid={recordToView}
      />
      <NewSupplierModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
      />
      <EditSupplierModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
      />
      <DeleteSupplierModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
      />
      <Tab.Container
        activeKey={key}
        onSelect={(k) => setKey(k)}>
        <div id="contents" className="row">
          <div className="row  py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header>
                  <div className='row'>
                   <InputGroup  id="fc-search">
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faSearch} />
                      </InputGroup.Text>
                      <FormControl
                        type="search"
                        value={searchValue}
                        onChange={filter}
                        className="input"
                        placeholder="SU003, Cabral Bicolandia, 09284445186"
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
                  <div className='scrollbar' style={{ height: '400px' }}>
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
                          <ListGroup activeKey={key} variant="flush">
                            {searchResult && searchResult.length > 0 ? (
                              searchResult.map((supplier) => (
                                <ListGroup.Item
                                  action
                                  key={supplier.id}
                                  eventKey={supplier.id}
                                  onClick={() => { handleDocChange(supplier.id) }}
                                >
                                  <div className="row gx-0 sidebar-contents">
                                    <div className="col-2">
                                      {supplier.id.substring(0, 5)}
                                    </div>
                                    <div className="col-6">
                                      {supplier.supplier_name}
                                    </div>
                                    <div className="col-4">
                                      {supplier.supplier_mobileNum}
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              ))
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column"  style={{marginTop: '25%'}}>
                                <h5>
                                  <strong className="d-flex align-items-center justify-content-center flex-column">
                                    No supplier matched:
                                    <br />
                                    <span style={{color: '#0d6efd'}}>{searchValue}</span>
                                  </strong>
                                </h5>
                              </div>
                            )}

                          </ListGroup>
                      )
                      :
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-5">
                        <Spinner
                          color1="#b0e4ff"
                          color2="#fff"
                          textColor="rgba(0,0,0, 0.5)"
                          className="w-50 h-50"
                        />
                      </div>
                    }
                  </div>
                </Card.Body>
              </Card>
            </div>

            <div className="divider"></div>
            <div className='data-contents'>
              <Tab.Content>
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
                <Tab.Pane eventKey='main'>
                  <div className="module-contents row py-1 m-0 placeholder-content">
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
                              <strong>SU000</strong>
                            </h4>
                          </div>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <Button
                            className="add me-1"
                            data-title="Add New Supplier"
                            onClick={() => setShowAddModal(true)}>
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
                    <div className="row p-1 m-0 data-specs d-flex align-items-center" id="supplier-info">
                      <div id="message-to-select">
                        <div className="blur-overlay">
                          <div className="d-flex align-items-center justify-content-center" style={{width: '100%', height: '100%'}}>
                            
                            </div>
                        </div>
                      </div>
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
                                 
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                {(supplier === undefined || supplier.length == 0) || docId === undefined?
                  <></>
                :
                <Tab.Pane eventKey={supplier[docId].id}>
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
                              <strong>{supplier[docId].id.substring(0, 5)}</strong>
                            </h4>
                          </div>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <Button
                            className="add me-1"
                            data-title="Add New Supplier"
                            onClick={() => setShowAddModal(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          <Button
                            className="edit me-1"
                            data-title="Edit Supplier"
                            onClick={() => setShowEditModal(true)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            className="delete me-1 disabled-conditionally"
                            disabled={transactions.length > 0}
                            data-title={transactions.length > 0?"Supplier part of transactions":"Delete Supplier"}
                            onClick={() => setShowDeleteModal(true)}>
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
                                {supplier[docId].supplier_name}
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
                                {supplier[docId].supplier_address === undefined || supplier[docId].supplier_address == "" || supplier[docId].supplier_address == " "?
                                  <div style={{fontStyle: 'italic', opacity: '0.8'}}>None</div>
                                :
                                  <>{supplier[docId].supplier_address}</>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row m-0 mt-2">
                          <div className="col-6">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Mobile Number"
                              >
                              <PhonePortrait
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-10 data-label">
                                {supplier[docId].supplier_mobileNum === undefined || supplier[docId].supplier_mobileNum == "" || supplier[docId].supplier_mobileNum == " "?
                                  <div style={{fontStyle: 'italic', opacity: '0.8'}}>None</div>
                                :
                                  <>{supplier[docId].supplier_mobileNum}</>
                                }
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Telephone Number"
                              >
                              <Call
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-10 data-label">
                                {supplier[docId].supplier_telNum === undefined || supplier[docId].supplier_telNum == "" || supplier[docId].supplier_telNum == " "?
                                  <div style={{fontStyle: 'italic', opacity: '0.8'}}>None</div>
                                :
                                  <>{supplier[docId].supplier_telNum}</>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row m-0 mt-2">
                          <div className="col-12">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-1 data-icon d-flex align-items-center justify-content-center"
                                data-title="Email Address"
                              >
                              <Mail
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-11 data-label">
                                {supplier[docId].supplier_emailaddress === undefined || supplier[docId].supplier_emailaddress == "" || supplier[docId].supplier_emailaddress == " "?
                                  <div style={{fontStyle: 'italic', opacity: '0.8'}}>None</div>
                                :
                                  <>{supplier[docId].supplier_emailaddress}</>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="folder-style">
                        <Tab.Container id="list-group-tabs-example" defaultActiveKey={1}>
                          <Nav variant="pills" defaultActiveKey={1}>
                            <Nav.Item>
                              <Nav.Link eventKey={1}>
                                Catalogue
                              </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link eventKey={0}>
                                Transactions
                              </Nav.Link>
                            </Nav.Item>
                          </Nav>
                          <Tab.Content>
                            <Tab.Pane eventKey={1}>
                              <div className="row data-specs-add m-0">
                                <div className='row m-0 p-0'>
                                  <Catalogue/>
                                </div>
                              </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey={0}>
                              <div className="row data-specs-add m-0">
                                <div className="row m-0 p-0">
                                  <Transactions/>
                                </div>
                              </div>
                            </Tab.Pane>
                          </Tab.Content>
                        </Tab.Container>
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

export default SupplierList;
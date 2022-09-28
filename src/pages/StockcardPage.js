import React from 'react';
import { Tab, Button, Card, ListGroup, Modal, Form, Alert } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch, faTruck } from '@fortawesome/free-solid-svg-icons'
import { Cube, Grid, Pricetag, Layers, Barcode as Barc, Cart, InformationCircle, Delive } from 'react-ionicons'
import NewProductModal from '../components/NewProductModal';
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




function StockcardPage() {


  //---------------------VARIABLES---------------------
  const [key, setKey] = useState('main');//Tab controller
  const [barcodeModalShow, setBarcodeModalShow] = useState(false); //show/hide edit barcode modal
  const [editShow, setEditShow] = useState(false); //show/hide edit modal
  const [modalShow, setModalShow] = useState(false); //show/hide new product modal
  const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
  const [docId, setDocId] = useState("xx"); //document Id
  const [stockcardDoc, setStockcardDoc] = useState([]); //stockcard Document variable
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");


  //---------------------FUNCTIONS---------------------

  JsBarcode(".barcode").init();//initialize barcode



  //access stockcard document
  useEffect(() => {
    async function readStockcardDoc() {
      const stockcardRef = doc(db, "stockcard", docId)
      const docSnap = await getDoc(stockcardRef)
      if (docSnap.exists()) {
        setStockcardDoc(docSnap.data());
      }
    }
    readStockcardDoc()
  }, [docId])

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  //Read stock card collection from database
  useEffect(() => {
    if (userID === undefined) {

      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])


  //delete Toast
  const deleteToast = () => {
    toast.error('Product DELETED from the Database', {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  const checkBarcode = (bcdata) => {
    var bcdataInt = parseInt(bcdata);
    console.log(bcdata);
    if (bcdataInt >= 0)
      return false;
    else
      return true;
  }

  //delete row 
  const deleteStockcard = async (id) => {
    const stockcardDoc = doc(db, "stockcard", id)
    deleteToast();
    await deleteDoc(stockcardDoc);
    setKey('main')
  }

  const handleClose = () => setEditShow(false);

  //Edit Stockcard Data Modal-----------------------------------------------------------------------------
  function EditProductModal(props) {

    const [newStockcardDescription, setNewStockcardDescription] = useState("");
    const [newStockcardCategory, setNewStockcardCategory] = useState("");
    const [newStockcardPPrice, setNewStockcardPPrice] = useState(0);
    const [newStockcardSPrice, setNewStockcardSPrice] = useState(0);

    //SetValues
    useEffect(() => {
      setNewStockcardDescription(stockcardDoc.description)
      setNewStockcardCategory(stockcardDoc.category)
      setNewStockcardSPrice(stockcardDoc.s_price)
      setNewStockcardPPrice(stockcardDoc.p_price)
    }, [docId])


    //update stockcard Document
    function updateStockcard() {
      updateDoc(doc(db, "stockcard", docId), {
        description: newStockcardDescription
        , category: newStockcardCategory
        , s_price: Number(newStockcardSPrice)
        , p_price: Number(newStockcardPPrice)
      });
      updateToast()
      handleClose();
    }

    //delete Toast
    const updateToast = () => {
      toast.info(' Stockcard Information Successfully Updated', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
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
            Edit {docId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-3">
            <div className="row ">
              <div className="col-6">
                <label>Item Name</label>
                <input type="text"
                  className="form-control"
                  placeholder="Item name"
                  value={newStockcardDescription}
                  required
                  onChange={(event) => { setNewStockcardDescription(event.target.value); }}
                />
              </div>
              <div className="col-6">
                <label>Category</label>
                <input type="text"
                  className="form-control"
                  placeholder="Category"
                  value={newStockcardCategory}
                  required
                  onChange={(event) => { setNewStockcardCategory(event.target.value); }}

                />
              </div>
            </div>
            <div className="row mt-2">
              <div className='col-4'>
                <label>Purchase Price</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  placeholder="Purchase Price"
                  value={newStockcardPPrice}
                  onChange={(event) => { setNewStockcardPPrice(event.target.value); }}
                />
              </div>
              <div className="col-4">
                <label>Selling Price</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  placeholder="Selling Price"
                  value={newStockcardSPrice}
                  onChange={(event) => { setNewStockcardSPrice(event.target.value); }}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => { updateStockcard(docId) }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }


  //Edit Barcode Modal-----------------------------------------------------------------------------
  function EditBarcodeModal(props) {

    const [newBarcodeValue, setNewBarcodeValue] = useState(100000000000);
    const handleEditBarcodeClose = () => setBarcodeModalShow(false);

    //SetValues
    useEffect(() => {
      setNewBarcodeValue(stockcardDoc.barcode)
    }, [docId])

    function updateBarcode() {
      updateDoc(doc(db, "stockcard", docId), {
        barcode: newBarcodeValue
      });
      setupBarcodeValue()
      handleEditBarcodeClose()
    }

    //update Toast
    const setupBarcodeValue = () => {
      toast.info('Barcode Value Updated from the Database', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }


    return (
      <Modal
        {...props}
        size="md"
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
            Set Barcode value
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='row p-3'>

            <div className='row'>
              <label>Enter 12-digit Barcode Value</label>

              <Form.Control
                type="number"
                placeholder="EAN-13 Barcode Value"
                min={100000000000}
                value={newBarcodeValue}
                required
                onChange={(event) => { setNewBarcodeValue(event.target.value); }}
              />

            </div>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => { updateBarcode(docId) }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  function DisplayBarcodeInfo() {

    if (stockcardDoc.barcode !== 0)
      return (
        <Card className='shadow'>
          <Card.Header className='bg-primary text-white'>
            Barcode
          </Card.Header>
          <Card.Body>


            <Barcode
              format="EAN13"
              value={stockcardDoc.barcode}
              height="50"
              width="3"
            />
          </Card.Body>
          <Card.Footer className='bg-white'>
            <Button
              size='sm'
              variant="outline-dark"
              onClick={() => setBarcodeModalShow(true)}
            >
              Edit Barcode Value
            </Button>
            <EditBarcodeModal
              show={barcodeModalShow}
              onHide={() => setBarcodeModalShow(false)}
            />

          </Card.Footer>
        </Card>
      )

    else {
      return (
        <Card className='shadow'>
          <Card.Header className='bg-primary text-white'>
            Barcode
          </Card.Header>
          <Card.Body className="pt-4" style={{ height: "125px" }}>

            <Alert className="text-center" variant="warning">
              <FontAwesomeIcon icon={faTriangleExclamation} /> Empty Barcode value
            </Alert>

          </Card.Body>
          <Card.Footer className='bg-white'>
            <Button
              size='sm'
              variant="outline-dark"
              onClick={() => setBarcodeModalShow(true)}
            >
              Setup Barcode
            </Button>
            <EditBarcodeModal
              show={barcodeModalShow}
              onHide={() => setBarcodeModalShow(false)}
            />

          </Card.Footer>
        </Card>
      )
    }


  }

  //----------------------------------SALES TOTAL RECORD FUNCTION----------------------------------

  const [salesRecordCollection, setSalesRecordCollection] = useState([]); // sales_record collection
  const [filteredResults, setFilteredResults] = useState([])
  const [totalSales, setTotalSales] = useState(0); // total sales

  //query documents from sales_record that contains docId
  useEffect(() => {

    const collectionRef = collection(db, "sales_record")
    const q = query(collectionRef, where("product_ids", "array-contains", docId));

    const unsub = onSnapshot(q, (snapshot) =>
      setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return unsub;

  }, [docId])
  //query documents from sales_record that contains docId
  useEffect(() => {

    setFilteredResults(salesRecordCollection.map((element) => {
      return {
        ...element, product_list: element.product_list.filter((product_list) => product_list.itemId === docId)
      }
    }))

  }, [salesRecordCollection])

  //compute for total sales
  useEffect(() => {
    var temp = 0;
    filteredResults.map((value) => {
      value.product_list.map((prod) => {
        temp += prod.itemQuantity
      })
    })
    setTotalSales(temp)
  }, [filteredResults])
  //-----------------------------------------------------------------------------------------------

  //--------------------------------PURCHASE TOTAL RECORD FUNCTION---------------------------------
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([]); // sales_record collection
  const [purchaseFilteredResults, setPurchaseFilteredResults] = useState([])
  const [totalPurchase, setTotalPurchase] = useState(0); // total sales

  //query documents from sales_record that contains docId
  useEffect(() => {

    const collectionRef = collection(db, "purchase_record")
    const q = query(collectionRef, where("product_ids", "array-contains", docId));

    const unsub = onSnapshot(q, (snapshot) =>
      setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return unsub;

  }, [docId])
  //query documents from sales_record that contains docId
  useEffect(() => {

    setPurchaseFilteredResults(purchaseRecordCollection.map((element) => {
      return {
        ...element, product_list: element.product_list.filter((product_list) => product_list.itemId === docId)
      }
    }))

  }, [purchaseRecordCollection])

  //compute for total sales
  useEffect(() => {
    var tempPurch = 0;
    purchaseFilteredResults.map((purch) => {
      purch.product_list.map((purch) => {
        tempPurch += purch.itemQuantity
      })
    })
    setTotalPurchase(tempPurch)
  }, [purchaseFilteredResults])


  const [leadtimeModalShow, setLeadtimeModalShow] = useState(false);

  function EditLeadtimeModal(props) {
    const [newMinLeadtime, setNewMinLeadtime] = useState(0);
    const [newMaxLeadtime, setNewMaxLeadtime] = useState(0);

    const handleEditLeadtimeClose = () => setLeadtimeModalShow(false);

    //SetValues
    useEffect(() => {
      setNewMaxLeadtime(stockcardDoc.analytics_maxLeadtime)
      setNewMinLeadtime(stockcardDoc.analytics_minLeadtime)
    }, [docId])

    //update Toast
    const updateLeadtimeToast = () => {
      toast.info('Leadtime Value Updated from the Database', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }


    function updateLeadtime() {
      updateDoc(doc(db, "stockcard", docId), {
        analytics_maxLeadtime: Number(newMaxLeadtime),
        analytics_minLeadtime: Number(newMinLeadtime)
      });
      updateLeadtimeToast()
      handleEditLeadtimeClose()
    }


    return (
      <Modal
        {...props}
        size="md"
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
            Set Product Leadtime
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='row p-3'>

            <div className='row text-center'>
              <h6><label>Enter Minimum and Maximum days of Product Leadtime</label></h6>
              <br />
              <hr />
              <br />

              <div className='col-6'>
                <label>Minimum Leadtime</label>
                <Form.Control
                  type="number"
                  placeholder="Minumum Leadtime"
                  min={0}
                  value={newMinLeadtime}
                  onChange={(event) => { setNewMinLeadtime(event.target.value); }}
                  required
                />
              </div>
              <div className='col-6'>
                <label>Maximum Leadtime</label>
                <Form.Control
                  type="number"
                  placeholder="Maximum Leadtime"
                  value={newMaxLeadtime}
                  onChange={(event) => { setNewMaxLeadtime(event.target.value); }}
                  min={0}
                  required
                />
              </div>


            </div>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={newMaxLeadtime === 0 ? true : false}
            onClick={() => { updateLeadtime(docId) }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }


  //-----------------------------------------------------------------------------------------------

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
        onSelect={(k) => setKey(k)}
      >
        <div className="row contents">
          <div className="row py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header>
                  <div className='row'>
                    <div className="col-1 left-full-curve">
                      <Button className="fc-search no-click me-0">
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
                      Item Code
                    </div>
                    <div className="col-8 right-curve">
                      Description
                    </div>
                  </div>
                  <div id='scrollbar'>
                    {stockcard.length === 0 ?
                      <div className='py-4 px-2'>
                        <Alert variant="secondary" className='text-center'>
                          <p>
                            <strong>No Recorded Product Registered</strong>
                          </p>
                        </Alert>
                      </div>
                      :
                      <ListGroup variant="flush">
                        {stockcard.map((stockcard) => {
                          return (
                            <ListGroup.Item
                              action
                              key={stockcard.id}
                              eventKey={stockcard.id}
                              onClick={() => { setDocId(stockcard.id) }}>
                              <div className="row gx-0 sidebar-contents">
                                <div className="col-4">
                                  {stockcard.id}
                                </div>
                                <div className="col-8">
                                  {stockcard.description}
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
                  <div className="row py-1 m-0" id="product-contents">
                    <div className='row m-0'>
                      <h1 className='text-center pb-2 module-title'>Inventory</h1>
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
                          <NewProductModal
                            show={modalShow}
                            onHide={() => setModalShow(false)}
                          />
                          <Button
                            className="add me-1"
                            data-title="Add New Product"
                            onClick={() => setModalShow(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          <Button
                            disabled
                            className="edit me-1"
                            data-title="Edit Product">
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            disabled
                            className="delete me-1"
                            data-title="Delete Product">
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="row py-1 data-specs m-0" id="product-info">
                      <div className="col-2">
                        <div className="data-img">

                        </div>
                      </div>
                      <div className="col-10 py-3">
                        <div className="row mb-4">
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Cube
                                className="me-2 pull-down"
                                color={'#000000'}
                                height="25px"
                                width="25px"
                                title={'Description'}
                              />
                            </span>
                            <span className="data-label">Product Description</span>
                          </div>
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Grid
                                className="me-2 pull-down"
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label">
                              Product Category
                            </span>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <Pricetag
                                className="me-2 pull-down"
                                color={'#000000'}
                                height="25px"
                                width="25px"
                                title={'Selling Price'}
                              />
                            </span>
                            <span className="data-label sm">Selling Price</span>
                          </div>
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <Cart
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
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <Barc
                                className="me-2 pull-down"
                                color={'#00000'}
                                title={'Category'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label sm">
                              Barcode
                            </span>
                          </div>
                        </div>
                      </div>
                      <hr />


                    </div>
                  </div>
                  <>
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
                        <h4 className="data-id">ITEM LEADTIME</h4>
                      </div>
                      <div className="col">
                        <div className="float-end">

                          <Button
                            disabled
                            className="edit me-1"
                            data-title="Edit Leadtime"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className='row text-center mt-2'>
                      <div className="col-4">
                        <span style={{ display: 'inline-block' }}>
                          <h5><FontAwesomeIcon icon={faTruck} /></h5>
                        </span>
                        <span className="data-label sm">
                          <small>Minimum Leadtime</small>
                        </span>
                      </div>
                      <div className="col-4">
                        <span style={{ display: 'inline-block' }}>
                          <h5><FontAwesomeIcon icon={faTruck} /></h5>
                        </span>
                        <span className="data-label sm">
                          <small>Maximum Leadtime</small>
                        </span>
                      </div>
                      <div className="col-4">
                        <span style={{ display: 'inline-block' }}>
                          <h5><FontAwesomeIcon icon={faTruck} /></h5>
                        </span>
                        <span className="data-label sm">
                          <small>Average Leadtime</small>
                        </span>
                      </div>
                    </div>
                    <div className="row data-specs-add mt-4">
                      <div className="col-4">
                        Quantity:<br />
                      </div>
                      <div className="col-4">
                        Total Quantity In: <br />
                      </div>
                      <div className="col-4">
                        Total Quantity Out: <br />
                      </div>
                    </div>
                  </>
                </Tab.Pane>

                <Tab.Pane eventKey={docId}>
                  <div className='row py-1 m-0' id="product-contents">
                    <div className='row m-0'>
                      <h1 className='text-center pb-2 module-title'>Inventory</h1>
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
                          <NewProductModal
                            show={modalShow}
                            onHide={() => setModalShow(false)}
                          />
                          <Button
                            className="add me-1"
                            data-title="Add New Product"
                            onClick={() => setModalShow(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          <EditProductModal
                            show={editShow}
                            onHide={() => setEditShow(false)}
                          />
                          <Button
                            className="edit me-1"
                            data-title="Edit Product"
                            onClick={() => setEditShow(true)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            className="delete me-1"
                            data-title="Delete Product"
                            onClick={() => { deleteStockcard(docId) }}>
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="row py-1 data-specs m-0" id="product-info">
                      <div className="col-2">
                        <div className="data-img">

                        </div>
                      </div>
                      <div className="col-10 py-3">
                        <div className="row mb-4">
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Cube
                                className="me-2 pull-down"
                                color={'#000000'}
                                height="25px"
                                width="25px"
                                data-title={'Product Description'}
                              />
                            </span>
                            <span className="data-label">
                              {stockcardDoc.description}
                            </span>
                          </div>
                          <div className="col-6 px-1">
                            <span className="data-icon">
                              <Grid
                                className="me-2 pull-down"
                                color={'#00000'}
                                data-title={'Product Category'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label">
                              {stockcardDoc.category}
                            </span>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <Pricetag
                                className="me-2 pull-down"
                                color={'#000000'}
                                height="25px"
                                width="25px"
                                data-title={'Selling Price'}
                              />
                            </span>
                            <span className="data-label sm">
                              {stockcardDoc.s_price}
                            </span>
                          </div>
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <Cart
                                className="me-2 pull-down"
                                color={'#00000'}
                                data-title={'Purchase Price'}
                                height="25px"
                                width="25px"
                              />
                            </span>
                            <span className="data-label sm">
                              {stockcardDoc.p_price}
                            </span>
                          </div>
                          <div className="col-4 px-1">
                            <span className="data-icon sm">

                              <Button
                                className="plain-button bc-button"
                                data-hover="Edit Barcode"
                                onClick={DisplayBarcodeInfo()}
                              >
                                <Barc
                                  className="me-2 pull-down"
                                  color={'#00000'}
                                  data-title="Barcode"
                                  height="25px"
                                  width="25px"
                                />
                              </Button>
                            </span>



                            <span className="data-label sm">
                              {
                                checkBarcode(stockcard.barcode) ?
                                  <span>Barcode not initialized</span>
                                  :
                                  <span>{stockcard.barcode}</span>
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <hr />
                    </div>
                    <>
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
                          <h4 className="data-id">Item Leadtime</h4>
                        </div>
                        <div className="col">
                          <div className="float-end">
                            <EditLeadtimeModal
                              show={leadtimeModalShow}
                              onHide={() => setLeadtimeModalShow(false)}
                            />
                            <Button
                              className="edit me-1"
                              data-title="Edit Leadtime"
                              onClick={() => setLeadtimeModalShow(true)}>
                              <FontAwesomeIcon icon={faEdit} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className='row text-center mt-2'>
                        <div className="col-4">
                          <span style={{ display: 'inline-block' }}>
                            <h5><FontAwesomeIcon icon={faTruck} /></h5>
                          </span>
                          <span className="data-label sm">
                            <small>{stockcardDoc.analytics_minLeadtime} day(s)</small>
                          </span>
                        </div>
                        <div className="col-4">
                          <span style={{ display: 'inline-block' }}>
                            <h5><FontAwesomeIcon icon={faTruck} /></h5>
                          </span>
                          <span className="data-label sm">
                            <small>{stockcardDoc.analytics_maxLeadtime} day(s)</small>
                          </span>
                        </div>
                        <div className="col-4">
                          <span style={{ display: 'inline-block' }}>
                            <h5><FontAwesomeIcon icon={faTruck} /></h5>
                          </span>
                          <span className="data-label sm">
                            <small>{(stockcardDoc.analytics_maxLeadtime + stockcardDoc.analytics_minLeadtime) / 2} day(s)</small>
                          </span>
                        </div>
                      </div>
                      <div className="row data-specs-add mt-4">
                        <div className="col-4">
                          Quantity:<br /> {stockcardDoc.qty}
                        </div>
                        <div className="col-4">
                          Total Quantity In: <br /> {totalPurchase}
                        </div>
                        <div className="col-4">
                          Total Quantity Out: <br />{totalSales}
                        </div>
                      </div>
                    </>


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

export default StockcardPage;
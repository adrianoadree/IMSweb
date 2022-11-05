import React from 'react';
import { Tab, Button, Card, ListGroup, Modal, Form, Alert, Table, Tooltip, OverlayTrigger, Accordion, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch, faTruck, faBarcode, faFileLines, faInbox, faArrowRightFromBracket, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { Cube, Grid, Pricetag, Layers, Barcode as Barc, Cart, InformationCircle, Delive } from 'react-ionicons'
import NewProductModal from '../components/NewProductModal';
import { useNavigate } from 'react-router-dom';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc, where } from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { UserAuth } from '../context/AuthContext'
import Barcode from 'react-jsbarcode'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import UserRouter from '../pages/UserRouter'
import { Spinner } from 'loading-animations-react';


function StockcardPage({ isAuth }) {


  //---------------------VARIABLES---------------------
  const [key, setKey] = useState('main');//Tab controller
  const [barcodeModalShow, setBarcodeModalShow] = useState(false); //show/hide edit barcode modal
  const [editShow, setEditShow] = useState(false); //show/hide edit modal
  const [modalShow, setModalShow] = useState(false); //show/hide new product modal
  const [stockcard, setStockcard] = useState(); // stockcardCollection variable
  const [docId, setDocId] = useState("xx"); //document Id
  const [stockcardDoc, setStockcardDoc] = useState(); //stockcard Document variable
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [leadtimeAverage, setLeadtimeAverage] = useState()
  const [leadtimeMinimum, setLeadtimeMinimum] = useState()
  const [leadtimeMaximum, setLeadtimeMaximum] = useState()

  //---------------------FUNCTIONS---------------------



  useEffect(() => {
    console.log(selectedProducts)
  })
  const handleProductSelect = (product) => {
    let productIndex = selectedProducts.indexOf(product)
    var currentSelectedProduct = document.getElementById(product);

    if (currentSelectedProduct.classList.contains("product-selected")) {
      currentSelectedProduct.classList.remove("product-selected")
    }
    else {
      currentSelectedProduct.classList.add("product-selected")
    }
    console.log(currentSelectedProduct)
    if (productIndex >= 0) {
      setSelectedProducts([
        ...selectedProducts.slice(0, productIndex),
        ...selectedProducts.slice(productIndex + 1, selectedProducts.length)
      ]);
    }
    else {
      setSelectedProducts([...selectedProducts, product])
    }
  }

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
    setLeadtimeAverage()
    setLeadtimeMinimum()
    setLeadtimeMaximum()
    if (stockcardDoc !== undefined) {
      setLeadtimeAverage(stockcardDoc.analytics.leadtimeAverage)
      setLeadtimeMinimum(stockcardDoc.analytics.leadtimeMinimum)
      setLeadtimeMaximum(stockcardDoc.analytics.leadtimeMaximum)
    }
  }, [stockcardDoc])

  useEffect(() => {
    if (stockcard === undefined) {
      setIsFetched(false)
    }
    else {
      setIsFetched(true)
    }
  }, [stockcard])

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
      if (stockcardDoc !== undefined) {
        setNewStockcardDescription(stockcardDoc.description)
        setNewStockcardCategory(stockcardDoc.category)
        setNewStockcardSPrice(stockcardDoc.s_price)
        setNewStockcardPPrice(stockcardDoc.p_price)
      }
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
        barcode: Number(newBarcodeValue)
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
        <div className="row py-1 m-0">
          <div className="col-9">

            <Barcode
              format="EAN13"
              value={stockcardDoc.barcode}
              height="50"
              width="3"
            />
          </div>
          <div className="col-3">
            <div className="float-end">
              <EditBarcodeModal
                show={barcodeModalShow}
                onHide={() => setBarcodeModalShow(false)}
              />
              <Button
                className="edit me-1"
                data-title="Edit Barcode value"
                onClick={() => setBarcodeModalShow(true)}>
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            </div>
          </div>
        </div>
      )

    else {
      return (

        <div className="row py-1 m-0">
          <div className="col-9">

            <Alert className="text-center" variant="warning">
              <FontAwesomeIcon icon={faTriangleExclamation} /> Empty Barcode value
            </Alert>

          </div>
          <div className="col-3">
            <div className="float-end">
              <EditBarcodeModal
                show={barcodeModalShow}
                onHide={() => setBarcodeModalShow(false)}
              />
              <Button
                className="edit me-1"
                data-title="Edit Barcode value"
                onClick={() => setBarcodeModalShow(true)}>
                <FontAwesomeIcon icon={faEdit} />
              </Button>
            </div>
          </div>
        </div>
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
    const [newAverageLeadtime, setNewAverageLeadtime] = useState(0);

    
    const [safetyStock, setSafetyStock] = useState(0); // safetyStock
    const [reorderPoint, setReorderPoint] = useState(); // ReorderPoint
    const [daysROP, setDaysROP] = useState(); // days before ReorderPoint
    const [highestDailySales, setHighestDailySales] = useState(0); //highest daily sales
    const [averageDailySales, setAverageDailySales] = useState(0); //average daily sales 

    const handleEditLeadtimeClose = () => setLeadtimeModalShow(false);

    useEffect(()=>{
      computeAverageLeadtime()
    },[newMaxLeadtime, newMinLeadtime])

    function computeAverageLeadtime(){
      let x = 0
      let y = 0
      x = Number(newMaxLeadtime) + Number(newMinLeadtime)
      y = Number(x/2)
      setNewAverageLeadtime(y)
    }

    useEffect(()=>{
      if(stockcardDoc!==undefined){
        setSafetyStock(stockcardDoc.analytics.safetyStock)
        setReorderPoint(stockcardDoc.analytics.reorderPoint)
        setDaysROP(stockcardDoc.analytics.daysROP)
        setHighestDailySales(stockcardDoc.analytics.highestDailySales)
        setAverageDailySales(stockcardDoc.analytics.averageDailySales)
      }
    },[stockcardDoc])

    //compute SafetyStock
    useEffect(() => {

      let x = 0
      let y = 0
      let z = 0
      x = Number(highestDailySales) * Number(newMaxLeadtime)
      y = Number(averageDailySales) * Number(newAverageLeadtime)
      z = Number(x - y)

      setSafetyStock(z)
  }, [highestDailySales, averageDailySales, newMaxLeadtime, newAverageLeadtime, stockcardDoc])


    //compute reoderpoint
    //formula to calculate ROP = (average daily sales * leadtime in days) + safetystock
    useEffect(() => {
      setReorderPoint()
      let x = 0
      let y = 0
      let z = 0

      x = Number(averageDailySales * newAverageLeadtime)
      y = x + safetyStock
      z = Math.round(y)
      setReorderPoint(z)
  }, [safetyStock, averageDailySales, newAverageLeadtime])


    //compute days before ROP
    //formula to calculate Number of Days Before reaching ROP = ( Current Quantity of Product - Reorder Point ) / average daily usage
    useEffect(() => {
      setDaysROP()
      if (stockcardDoc !== undefined) {
          let x = stockcardDoc.qty - reorderPoint
          let y = averageDailySales
          let a = (x / y)
          let z = Math.round(a)
          setDaysROP(z)
      }
  }, [averageDailySales, reorderPoint, stockcardDoc])


    useEffect(()=>{
      console.log("newAverageLeadtime:", newAverageLeadtime)
    },[newAverageLeadtime])
    
    useEffect(()=>{
      console.log("newMinLeadtime:", newMinLeadtime)
    },[newMinLeadtime])

    useEffect(()=>{
      console.log("newMaxLeadtime:", newMaxLeadtime)
    },[newMaxLeadtime])



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
        "analytics.leadtimeMaximum": Number(newMaxLeadtime),
        "analytics.leadtimeMinimum": Number(newMinLeadtime),
        "analytics.leadtimeAverage": Number(newAverageLeadtime),
        "analytics.safetyStock": Number(safetyStock),
        "analytics.reorderPoint": Number(reorderPoint),
        "analytics.daysROP": Number(daysROP)
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


  const leadTimeTooltip = (props) => (
    <Tooltip id="LeadTime" className="tooltipBG" {...props}>
      Lead time is the amount of days it takes for your supplier to fulfill
      your order
    </Tooltip>
  );

  const salesQuantityReport = (props) => (
    <Tooltip id="salesQuantityReport" className="tooltipBG" {...props}>
      Displays a Report containing: Transaction Number, Date of Transaction, Quantity of a certain transaction
    </Tooltip>
  );

  //-----------------------------------------------------------------------------------------------


  // ==================================== START OF REPORT GENERATION ====================================

  // =============================== START OF PURCHASE REPORT FUNCTIONS ===============================

  const [purchaseReport, setPurchaseReport] = useState()
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [reportTotalPurchase, setReportTotalPurchase] = useState(0)

  const [filteredPurchaseReport, setFilteredPurchaseReport] = useState()
  const [startDateHolder, setStartDateHolder] = useState()
  const [endDateHolder, setEndDateHolder] = useState()

  const [purchaseReportHeaderBoolean, setPurchaseReportHeaderBoolean] = useState(true)


  //reset state values
  useEffect(() => {
    setPurchaseReport()
    setReportTotalPurchase(0)
    setDateRange(([null, null]))
  }, [docId])

  useEffect(() => {
    setStart(startDate)
    setEnd(endDate)
  }, [dateRange])



  useEffect(() => {

    if (start && end !== null) {


      start.setDate(start.getDate() + 1)
      end.setDate(end.getDate() + 2)
      let tempTotal = 0
      let tempDate
      let tempIDArr = []
      let tempQuantityArr = []
      let tempDateArr = []

      let tempArrReport = [{}]

      while (start < end) {
        tempDate = start.toISOString().substring(0, 10)
        purchaseRecordCollection.map((purch) => {
          if (purch.transaction_date === tempDate && userID === purch.user) {
            purch.product_list.map((prod) => {
              if (prod.itemId === docId) {
                tempTotal += prod.itemQuantity
                tempIDArr.push(purch.transaction_number)
                tempDateArr.push(purch.transaction_date)
                tempQuantityArr.push(prod.itemQuantity)
                tempArrReport.push({ ID: purch.transaction_number, Date: purch.transaction_date, Quantity: prod.itemQuantity })
              }
            })
          }
        })
        start.setDate(start.getDate() + 1)
      }
      setPurchaseReport(tempArrReport)
      setReportTotalPurchase(tempTotal)
    }

  }, [end])



  useEffect(() => {
    if (purchaseReport !== undefined) {
      const results = purchaseReport.filter(element => {
        if (Object.keys(element).length !== 0) {
          return true;
        }
        return false;
      });

      setFilteredPurchaseReport(results)
    }
  }, [purchaseReport])

  useEffect(() => {
    if (startDate !== null) {
      let x = new Date(startDate)
      let tempDate = new Date()

      if (x !== null) {
        tempDate = x
        setStartDateHolder(tempDate)
      }
    }
  }, [startDate])


  useEffect(() => {
    if (endDate !== null) {
      let x = new Date(endDate)
      let tempDate = new Date()

      if (x !== null) {
        tempDate = x
        setEndDateHolder(tempDate)
      }
    }
  }, [endDate])



  useEffect(() => {
    if (filteredPurchaseReport !== undefined) {
      if (filteredPurchaseReport.length === 0) {
        setPurchaseReportHeaderBoolean(true)
      }
      else {
        setPurchaseReportHeaderBoolean(false)
      }
    }
  }, [filteredPurchaseReport])


  useEffect(() => {
    if (filteredPurchaseReport !== undefined) {
      if (filteredPurchaseReport.length === 0) {
        setDateRange([null], [null])
      }
    }
  }, [filteredPurchaseReport])


  //-----------------PURCHASE REPORT HEADER FUNCTIONS-----------------
  function reportPurchaseHeader() {
    if (filteredPurchaseReport !== undefined) {
      return (
        <>
          {filteredPurchaseReport.length !== 0 ?
            reportPurchaseHeaderTrue()
            :
            reportPurchaseHeaderFalse()
          }
        </>
      )
    }
  }


  function reportPurchaseHeaderTrue() {
    return (
      <>
        <div className='row'>
          <div className='row text-center'>
            <div className='row p-3'>
              <h4 className='text-primary'>PURCHASE TRANSACTION REPORT <br />FOR DATE(S)</h4>
            </div>
            <div className='row'>
              <span>
                <strong>{moment(startDateHolder).format('ll')}</strong> to <strong>{moment(endDateHolder).format('ll')}</strong>
                <Button
                  className='ml-2'
                  size='sm'
                  variant="outline-primary"
                  onClick={() => { setStart(new Date()); setEnd(new Date()); }}
                >
                  reset
                </Button>
              </span>

            </div>
          </div>
        </div>
      </>
    )
  }


  function reportPurchaseHeaderFalse() {
    return (
      <div>

        <div className="row py-1 m-0 mb-2">
          <span>
            <InformationCircle
              className="me-2 pull-down"
              color={'#0d6efd'}
              title={'Category'}
              height="40px"
              width="40px"
            />
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={salesQuantityReport}
            >
              <h4 className="data-id">PURCHASE TRANSACTION REPORT</h4>
            </OverlayTrigger>
          </span>

        </div>
        <div className='row text-center mb-2'>
          <label>Date-Range to Report</label>
          <DatePicker
            placeholderText='Enter Date-Range'
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update);
            }}
            withPortal
          />
        </div>
      </div>

    )
  }
  //------------------------------------------------------------------

  //-----------------PURCHASE REPORT BODY FUNCTIONS-----------------

  function reportPurchaseBody() {
    if (filteredPurchaseReport !== undefined) {
      return (
        <div>
          <Table striped bordered hover>
            <thead>
              <tr className='text-center'>
                <th>Date</th>
                <th>Transaction Number</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody className='text-center'>
              {filteredPurchaseReport.length === 0 ?
                <tr>
                  <td colSpan={3}>
                    <Alert variant='warning'>
                      <strong>No Transaction to Report</strong>
                    </Alert>
                  </td>
                </tr>
                :
                <>{
                  filteredPurchaseReport.map((purch, index) => {
                    return (
                      <tr key={index}>
                        <td>{moment(purch.Date).format('ll')}</td>
                        <td>{purch.ID}</td>
                        <td>{purch.Quantity}</td>
                      </tr>
                    )
                  })}
                </>

              }
              <tr>
                <td colSpan={2}><strong>Total</strong></td>
                <td><strong>{reportTotalPurchase} units</strong></td>
              </tr>
            </tbody>
          </Table >
        </div>
      )
    }
  }


  //------------------------------------------------------------------

  function reportPurchaseCard() {
    return (
      <Card>
        <Card.Header className='bg-white'>
          {reportPurchaseHeader()}
        </Card.Header>
        <Card.Body className='bg-white'>
          {reportPurchaseBody()}
        </Card.Body>
      </Card>
    )
  }

  // =============================== END OF PURCHASE REPORT FUNCTIONS ===============================


  // =============================== START OF SALES REPORT FUNCTIONS ===============================


  const [salesDateRange, setSalesDateRange] = useState([null, null]);
  const [salesStartDate, salesEndDate] = salesDateRange;
  const [reportTotalSales, setReportTotalSales] = useState(0)
  const [salesReport, setSalesReport] = useState()
  const [filteredSalesReport, setFilteredSalesReport] = useState()

  const [salesStart, setSalesStart] = useState(new Date());
  const [salesEnd, setSalesEnd] = useState(new Date());

  const [salesStartDateHolder, setSalesStartDateHolder] = useState()
  const [salesEndDateHolder, setSalesEndDateHolder] = useState()



  useEffect(() => {
    setSalesStart(salesStartDate)
    setSalesEnd(salesEndDate)
  }, [salesDateRange])



  useEffect(() => {
    if (salesStartDate !== null) {
      let x = new Date(salesStartDate)
      let tempDate = new Date()

      if (x !== null) {
        tempDate = x
        setSalesStartDateHolder(tempDate)
      }
    }
  }, [salesStartDate])


  useEffect(() => {
    if (salesEndDate !== null) {
      let x = new Date(salesEndDate)
      let tempDate = new Date()

      if (x !== null) {
        tempDate = x
        setSalesEndDateHolder(tempDate)
      }
    }
  }, [salesEndDate])




  useEffect(() => {
    if (salesReport !== undefined) {
      const results = salesReport.filter(element => {
        if (Object.keys(element).length !== 0) {
          return true;
        }
        return false;
      });

      setFilteredSalesReport(results)
    }
  }, [salesReport])



  useEffect(() => {
    if (filteredSalesReport !== undefined) {
      if (filteredSalesReport.length === 0) {
        setSalesDateRange([null], [null])
      }
    }
  }, [filteredSalesReport])



  useEffect(() => {

    if (salesStart && salesEnd !== null) {


      salesStart.setDate(salesStart.getDate() + 1)
      salesEnd.setDate(salesEnd.getDate() + 2)
      let tempTotal = 0
      let tempDate
      let tempIDArr = []
      let tempQuantityArr = []
      let tempDateArr = []

      let tempArrReport = [{}]

      while (salesStart < salesEnd) {
        tempDate = salesStart.toISOString().substring(0, 10)
        salesRecordCollection.map((sales) => {
          if (sales.transaction_date === tempDate && userID === sales.user) {
            sales.product_list.map((prod) => {
              if (prod.itemId === docId) {
                tempTotal += prod.itemQuantity
                tempIDArr.push(sales.transaction_number)
                tempDateArr.push(sales.transaction_date)
                tempQuantityArr.push(prod.itemQuantity)
                tempArrReport.push({ ID: sales.transaction_number, Date: sales.transaction_date, Quantity: prod.itemQuantity })
              }
            })
          }
        })
        salesStart.setDate(salesStart.getDate() + 1)
      }
      setSalesReport(tempArrReport)
      setReportTotalSales(tempTotal)
    }

  }, [salesEnd])






  // --------------------------- START OF SALES REPORT HEADER FUNCTIONS ---------------------------

  function reportSalesHeader() {
    if (filteredSalesReport !== undefined) {
      return (
        <>
          {filteredSalesReport.length !== 0 ?
            reportSalesHeaderTrue()
            :
            reportSalesHeaderFalse()
          }
        </>
      )
    }
  }


  function reportSalesHeaderTrue() {
    return (
      <>
        <div className='row'>
          <div className='row text-center'>
            <div className='row p-3'>
              <h4 className='text-primary'>SALES TRANSACTION REPORT <br />FOR DATE(S)</h4>
            </div>
            <div className='row'>
              <span>
                <strong>{moment(salesStartDateHolder).format('ll')}</strong> to <strong>{moment(salesEndDateHolder).format('ll')}</strong>
                <Button
                  className='ml-2'
                  size='sm'
                  variant="outline-primary"
                  onClick={() => { setSalesStart(new Date()); setSalesEnd(new Date()); }}
                >
                  reset
                </Button>
              </span>

            </div>
          </div>
        </div>
      </>
    )
  }

  function reportSalesHeaderFalse() {
    return (
      <div>

        <div className="row py-1 m-0 mb-2">
          <span>
            <InformationCircle
              className="me-2 pull-down"
              color={'#0d6efd'}
              title={'Category'}
              height="40px"
              width="40px"
            />
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={salesQuantityReport}
            >
              <h4 className="data-id">SALES TRANSACTION REPORT</h4>
            </OverlayTrigger>
          </span>

        </div>
        <div className='row text-center mb-2'>
          <label>Date-Range to Report</label>
          <DatePicker
            placeholderText='Enter Date-Range'
            selectsRange={true}
            startDate={salesStartDate}
            endDate={salesEndDate}
            onChange={(update) => {
              setSalesDateRange(update);
            }}
            withPortal
          />
        </div>
      </div>

    )
  }
  // ---------------------------- END OF SALES REPORT HEADER FUNCTIONS ----------------------------

  // ---------------------------- START OF SALES REPORT BODY FUNCTIONS ----------------------------


  function reportSalesBody() {
    if (filteredSalesReport !== undefined) {
      return (
        <div>
          <Table striped bordered hover>
            <thead>
              <tr className='text-center'>
                <th>Date</th>
                <th>Transaction Number</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody className='text-center'>
              {filteredSalesReport.length === 0 ?
                <tr>
                  <td colSpan={3}>
                    <Alert variant='warning'>
                      <strong>No Transaction to Report</strong>
                    </Alert>
                  </td>
                </tr>
                :
                <>{
                  filteredSalesReport.map((sales, index) => {
                    return (
                      <tr key={index}>
                        <td>{moment(sales.Date).format('ll')}</td>
                        <td>{sales.ID}</td>
                        <td>{sales.Quantity}</td>
                      </tr>
                    )
                  })}
                </>

              }
              <tr>
                <td colSpan={2}><strong>Total</strong></td>
                <td><strong>{reportTotalSales} units</strong></td>
              </tr>
            </tbody>
          </Table >
        </div>
      )
    }
  }

  // ------------------------------ END OF SALES REPORT BODY FUNCTIONS -----------------------------

  function reportSalesCard() {
    return (
      <Card>
        <Card.Header className='bg-white'>
          {reportSalesHeader()}
        </Card.Header>
        <Card.Body className='bg-white'>
          {reportSalesBody()}
        </Card.Body>
      </Card>
    )
  }
  // ================================ END OF SALES REPORT FUNCTIONS ================================




  // ===================================== END OF REPORT GENERATION =====================================

  const [reportBooleanValue, setReportBooleanValue] = useState(true)
  const handleReportBooleanChange = (val) => setReportBooleanValue(val);















  // ===================================== START OF SEARCH FUNCTION =====================================


  const [searchValue, setSearchValue] = useState('');    // the value of the search field 
  const [searchResult, setSearchResult] = useState();    // the search result


  useEffect(() => {
    setSearchResult(stockcard)
  }, [stockcard])



  const filter = (e) => {
    const keyword = e.target.value;

    if (keyword !== '') {
      const results = stockcard.filter((stockcard) => {
        return stockcard.id.toLowerCase().startsWith(keyword.toLowerCase())
        // Use the toLowerCase() method to make it case-insensitive
      });
      setSearchResult(results);
    } else {
      setSearchResult(stockcard);
      // If the text field is empty, show all users
    }

    setSearchValue(keyword);
  };

  // ====================================== END OF SEARCH FUNCTION ======================================





  return (
    <div>
      <UserRouter
        route='/stockcard'
      />
      <Navigation
        page="/stockcard" />

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
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="basic-addon1">
                        <FontAwesomeIcon icon={faSearch} />
                      </InputGroup.Text>
                      <FormControl
                        type="search"
                        value={searchValue}
                        onChange={filter}
                        className="input"
                        placeholder="Search by Item Code/Description"
                      />
                    </InputGroup>
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
                  <div className='scrollbar' style={{ height: '400px' }}>
                    {isFetched ?
                      (
                        stockcard.length === 0 ?
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                            <h5 className="mb-3"><strong>No <span style={{ color: '#0d6efd' }}>Product</span> to show.</strong></h5>
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
                              searchResult.map((stockcard) => (
                                <ListGroup.Item
                                  action
                                  key={stockcard.id}
                                  eventKey={stockcard.id}
                                  onClick={() => { setDocId(stockcard.id) }}
                                >
                                  <div className="row gx-0 sidebar-contents">
                                    <div className="col-4">
                                      {stockcard.id}
                                    </div>
                                    <div className="col-8">
                                      {stockcard.description}
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
                          <div className="col-6 px-1">
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
                          <div className="col-6 px-1">
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

                        </div>

                        <div className="row mb-4">
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <FontAwesomeIcon icon={faInbox} />
                            </span>
                            <span className="data-label sm">
                              Stock Level
                            </span>
                          </div>
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <FontAwesomeIcon icon={faArrowRightFromBracket} />
                            </span>
                            <span className="data-label sm">
                              Total Sales
                            </span>
                          </div>
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <FontAwesomeIcon icon={faArrowRightToBracket} />
                            </span>
                            <span className="data-label sm">
                              Total Purchase
                            </span>
                          </div>
                        </div>
                      </div>
                      <hr />


                    </div>
                  </div>
                  <>

                    <Accordion defaultActiveKey="0">
                      <Accordion.Item eventKey="1">
                        <Accordion.Header>
                          <h6><FontAwesomeIcon icon={faBarcode} /> BARCODE</h6>
                        </Accordion.Header>
                        <Accordion.Body>
                          <Alert variant='primary' className='mt-2 text-center'>
                            <strong> Select a Product to display Barcode</strong>
                          </Alert>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                    <Accordion defaultActiveKey="0">
                      <Accordion.Item eventKey="1">
                        <Accordion.Header>
                          <h6><FontAwesomeIcon icon={faTruck} /> LEADTIME</h6>
                        </Accordion.Header>
                        <Accordion.Body>
                          <Alert variant='primary' className='mt-2 text-center'>
                            <strong> Select a Product to display Leadtime</strong>
                          </Alert>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>

                    <Accordion defaultActiveKey="0">
                      <Accordion.Item eventKey="1">
                        <Accordion.Header>
                          <h6><FontAwesomeIcon icon={faFileLines} /> PRODUCT REPORT</h6>
                        </Accordion.Header>
                        <Accordion.Body>
                          <Alert variant='primary' className='mt-2 text-center'>
                            <strong> Select a Product to display Report</strong>
                          </Alert>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>

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
                        <h4 className="data-id">{docId.substring(0, 9)}</h4>
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
                              {stockcardDoc !== undefined ?
                                stockcardDoc.description
                                :
                                <></>
                              }
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
                              {stockcardDoc !== undefined ?
                                stockcardDoc.category
                                :
                                <></>
                              }
                            </span>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-6 px-1">
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
                              {stockcardDoc !== undefined ?
                                stockcardDoc.s_price
                                :
                                <></>
                              }
                            </span>
                          </div>
                          <div className="col-6 px-1">
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
                              {stockcardDoc !== undefined ?
                                stockcardDoc.p_price
                                :
                                <></>
                              }
                            </span>
                          </div>

                        </div>
                        <div className="row mb-4">
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <FontAwesomeIcon icon={faInbox} />
                            </span>
                            <span className="data-label sm">
                              {stockcardDoc !== undefined ?
                                stockcardDoc.qty
                                :
                                <></>
                              }
                            </span>
                          </div>
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <FontAwesomeIcon icon={faArrowRightFromBracket} />
                            </span>
                            <span className="data-label sm">
                              {totalSales}
                            </span>
                          </div>
                          <div className="col-4 px-1">
                            <span className="data-icon sm">
                              <FontAwesomeIcon icon={faArrowRightToBracket} />
                            </span>
                            <span className="data-label sm">
                              {totalPurchase}
                            </span>
                          </div>

                        </div>
                      </div>
                      <hr />
                    </div>
                    <>
                      <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="1">
                          <Accordion.Header>
                            <h6><FontAwesomeIcon icon={faBarcode} /> BARCODE</h6>
                          </Accordion.Header>
                          <Accordion.Body>
                            {stockcardDoc !== undefined ?
                              DisplayBarcodeInfo()
                              :
                              <></>}
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                      <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="1">
                          <Accordion.Header>
                            <h6><FontAwesomeIcon icon={faTruck} /> LEADTIME</h6>
                          </Accordion.Header>
                          <Accordion.Body>
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
                                <OverlayTrigger
                                  placement="right"
                                  delay={{ show: 250, hide: 400 }}
                                  overlay={leadTimeTooltip}
                                >
                                  <h4 className="data-id">ITEM LEADTIME</h4>
                                </OverlayTrigger>
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
                            <div className='row'>
                              <div className='col-4 text-center'>
                                <small>Minimum Leadtime</small>
                              </div>
                              <div className='col-4 text-center'>
                                <small>Maximum Leadtime</small>
                              </div>
                              <div className='col-4 text-center'>
                                <small>Average Leadtime</small>
                              </div>
                            </div>
                            <div className='row text-center mt-2'>

                              <div className="col-4">
                                <span style={{ display: 'inline-block' }}>
                                  <h5><FontAwesomeIcon icon={faTruck} /></h5>
                                </span>
                                <span className="data-label sm">
                                  {leadtimeMinimum}
                                </span>
                              </div>
                              <div className="col-4">
                                <span style={{ display: 'inline-block' }}>
                                  <h5><FontAwesomeIcon icon={faTruck} /></h5>
                                </span>
                                <span className="data-label sm">
                                  {leadtimeMaximum}
                                </span>
                              </div>
                              <div className="col-4">
                                <span style={{ display: 'inline-block' }}>
                                  <h5><FontAwesomeIcon icon={faTruck} /></h5>
                                </span>
                                <span className="data-label sm">
                                  {leadtimeAverage}
                                </span>
                              </div>
                              <hr className='mt-2' />

                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                      <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="1">
                          <Accordion.Header>
                            <h6><FontAwesomeIcon icon={faFileLines} /> PRODUCT REPORT</h6>
                          </Accordion.Header>
                          <Accordion.Body>
                            <div className="row data-specs-add mt-4">
                              <div className='row'>
                                <div className='col'></div>
                                <div className='col'>
                                  <div className="float-end">
                                    <ToggleButtonGroup
                                      style={{ width: '200px' }}
                                      type="radio"
                                      name='reportBooleanButton'
                                      value={reportBooleanValue}
                                      onChange={handleReportBooleanChange}
                                    >
                                      <ToggleButton
                                        id="tbg-btn-1"
                                        variant="outline-primary"
                                        value={true}>
                                        <FontAwesomeIcon icon={faArrowRightFromBracket} />
                                        Sales
                                      </ToggleButton>
                                      <ToggleButton
                                        id="tbg-btn-2"
                                        variant="outline-primary"
                                        value={false}>
                                        <FontAwesomeIcon icon={faArrowRightToBracket} />
                                        Purchase
                                      </ToggleButton>
                                    </ToggleButtonGroup>
                                  </div>
                                </div>

                                <div className='mt-4'>
                                  {reportBooleanValue ?
                                    reportSalesCard()
                                    :
                                    reportPurchaseCard()
                                  }
                                </div>
                              </div>
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      </Accordion>
                    </>


                  </div>
                </Tab.Pane>
              </Tab.Content>
            </div>
          </div>
        </div>
      </Tab.Container >






    </div >
  );


}

export default StockcardPage;
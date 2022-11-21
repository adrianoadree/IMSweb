import React from 'react';
import { Nav, Tab, Button, Card, ListGroup, Modal, Form, Alert, Table, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db, st } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch, faTruck, faFilter, faCog, faSave } from '@fortawesome/free-solid-svg-icons'
import { Cube, Grid, Pricetag, Layers, Barcode as Barc, Cart, InformationCircle, CaretUp, Enter, Exit, CaretDown, GitBranch } from 'react-ionicons'
import NewProductModal from '../components/NewProductModal';

import RecordQuickView from "../components/RecordQuickView";
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc, where, getDocs } from 'firebase/firestore';
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import { faEye, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { UserAuth } from '../context/AuthContext'
import Barcode from 'react-jsbarcode'
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import UserRouter from '../pages/UserRouter'
import { Spinner } from 'loading-animations-react';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";


function StockcardPage({ isAuth }) {


  //---------------------VARIABLES---------------------
  const [key, setKey] = useState('main');//Tab controller
  const [editShow, setEditShow] = useState(false); //show/hide edit modal
  const [modalShow, setModalShow] = useState(false); //show/hide new product modal
  const [modalShowDL, setModalShowDL] = useState(false); //show/hide new product modal
  const [recordQuickViewModalShow, setRecordQuickViewModalShow] = useState(false);
  const [recordToView, setRecordToView] = useState()
  const [stockcard, setStockcard] = useState(); // stockcardCollection variable
  const [allPurchases, setAllPurchases] = useState([]);
  const [docId, setDocId] = useState(); //document Id
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved
  const [ledgerBaseLevel, setLedgerBaseLevel] = useState([]);
  const [filteredLedger, setFilteredLedger] = useState([]);
  const [editingBarcode, setEditingBarcode] = useState(false);
  const [showingFilterOptions, setShowingFilterOptions] = useState(false);
  const [showingLeadtimeOptions, setShowingLeadtimeOptions] = useState(false);
  const [filterTransactionType, setFilterTransactionType] = useState("all");
  const [filterTransactionStatus, setFilterTransactionStatus] = useState("all");
  const [filterClickCounter, setFilterClickCounter] = useState(0);
  const [filterDateStart, setFilterDateStart] = useState("2001-01-01");
  const [supplierCollection, setSupplierCollection] = useState(); //supplier collection  variable
  var curr = new Date();
  curr.setDate(curr.getDate());
  var today = moment(curr).format('YYYY-MM-DD')
  const [delayCount, setDelayCount]= useState(0)

  const [collectionUpdateMethod, setCollectionUpdateMethod] = useState("add")

  const [leadtimeAverage, setLeadtimeAverage] = useState()
  const [leadtimeMinimum, setLeadtimeMinimum] = useState()
  const [leadtimeMaximum, setLeadtimeMaximum] = useState()

  //----------------------------------SALES TOTAL RECORD FUNCTION----------------------------------

  useEffect(() => {
    console.log(docId)
  })

  const [salesRecordCollection, setSalesRecordCollection] = useState([]); // sales_record collection
  const [productSales, setProductSales] = useState([])
  const [totalSales, setTotalSales] = useState(0); // total sales

  //query documents from sales_record that contains docId
  useEffect(() => {
    if(stockcard === undefined || stockcard.length == 0)
    {

    }
    else {
      const collectionRef = collection(db, "sales_record")
      const q = query(collectionRef, where("product_ids", "array-contains", stockcard[docId].id));

      const unsub = onSnapshot(q, (snapshot) =>
        setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [docId])
  //query documents from sales_record that contains docId
  useEffect(() => {
    //read supplier collection
    if (userID === undefined) {
      const supplierCollectionRef = collection(db, "supplier")
      const q = query(supplierCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setSupplierCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const supplierCollectionRef = collection(db, "supplier")
      const q = query(supplierCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setSupplierCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])


  useEffect(() => {
    setProductSales(salesRecordCollection.map((element) => {
      return {
        ...element, product_list: element.product_list.filter((product_list) => product_list.itemId === stockcard[docId].id)
      }
    }))
  }, [salesRecordCollection])

  //compute for total sales
  useEffect(() => {
    var temp = 0;
    productSales.map((value) => {
      if (!value.isVoided) {
        value.product_list.map((prod) => {
          temp += prod.itemQuantity
        })
      }
    })
    setTotalSales(temp)
  }, [productSales])

  const getDelayCount = () => {
    for(var i =0; i < purchaseRecordCollection.length; i++)
    {
      if(purchaseRecordCollection[i].order_date === undefined || purchaseRecordCollection[i].order_date == 0 || purchaseRecordCollection[i].order_date == "" || purchaseRecordCollection[i].order_date == " ")
      {
        return true
      }
    }
  }

  const computeDelay = (transaction_date, order_date) => {
    if (order_date === undefined || order_date == "" || order_date == " ") {
      return "-"
    }
    else {
      var t_date = new Date(transaction_date)
      t_date.setHours(0, 0, 0, 0)
      var o_date = new Date(order_date)
      o_date.setHours(0, 0, 0, 0)
      return (moment(t_date).diff(moment(o_date), "days"))
    }
  }
  function DetermineStockLevel(curr, min, max, product_id) {
    const checkProductPurchases = () => {
      var cntr = 0
      allPurchases.map((purch) => {
        purch.product_ids.map((item) => {
          if (item == product_id) {
            cntr++
          }
        })
      })
      return cntr;
    }
    if ((min === undefined || min == 0) || (max === undefined || max == 0)) {
      if (curr == 0) {
        if (checkProductPurchases() > 0) {
          return "out-of-stock";
        }
      }
    }
    else {
      if (curr == 0) {
        if (checkProductPurchases() > 0) {
          return "out-of-stock";
        }
      }
      else if (curr <= min) {
        return "low-stock"
      }
      else if (curr >= max) {
        return "overstocked"
      }
      else {
        return ""
      }
    }
  }

  const getSupplierInfo = (supplier_id) => {
    var target_supplier
    if(supplierCollection !== undefined)
    {
    supplierCollection.map((supp) => {
      if(supp.id == supplier_id)
      {
        target_supplier = supp
      }
    })
    return target_supplier
    }
    else
    {
      return {supplier_name: "", supplier_emailaddress: "", supplier_address: "", supplier_mobileNum: "", supplier_telNum: ""}
    }
  }

  //-----------------------------------------------------------------------------------------------

  //--------------------------------PURCHASE TOTAL RECORD FUNCTION---------------------------------
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([]); // sales_record collection
  const [productPurchases, setProductPurchases] = useState([])
  const [totalPurchase, setTotalPurchase] = useState(0); // total sales

  //query documents from sales_record that contains docId
  useEffect(() => {
    if(stockcard === undefined || stockcard.length == 0)
    {

    }
    else {
      const collectionRef = collection(db, "purchase_record")
      const q = query(collectionRef, where("product_ids", "array-contains", stockcard[docId].id));

      const unsub = onSnapshot(q, (snapshot) =>
        setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [docId])

  //compute for total purchases
  useEffect(() => {
    var tempPurch = 0;
    productPurchases.map((purch) => {
      if (!purch.isVoided) {
        purch.product_list.map((purch) => {
          tempPurch += purch.itemQuantity
        })
      }
    })
    setTotalPurchase(tempPurch)
  }, [productPurchases])

  //query documents from sales_record that contains docId
  useEffect(() => {
    setProductPurchases(purchaseRecordCollection.map((element) => {
      return {
        ...element, product_list: element.product_list.filter((product_list) => product_list.itemId === stockcard[docId].id)
      }
    }))

  }, [purchaseRecordCollection])

    //--------------------------------PURCHASE TOTAL RECORD FUNCTION---------------------------------
    const [adjustmentRecordCollection, setAdjustmentRecordCollection] = useState([]); // sales_record collection
    const [productAdjustments, setProductAdjustments] = useState([])
  
    //query documents from sales_record that contains docId
    useEffect(() => {
      if(stockcard === undefined || stockcard.length == 0)
      {
  
      }
      else {
        const collectionRef = collection(db, "adjustment_record")
        const q = query(collectionRef, where("product_ids", "array-contains", stockcard[docId].id));
  
        const unsub = onSnapshot(q, (snapshot) =>
          setAdjustmentRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
      }
    }, [docId])
    //query documents from sales_record that contains docId
    useEffect(() => {
      setProductAdjustments(adjustmentRecordCollection.map((element) => {
        return {
          ...element, product_list: element.product_list.filter((product_list) => product_list.itemId === stockcard[docId].id)
        }
      }))
  
    }, [adjustmentRecordCollection])


  const [filterDateEnd, setFilterDateEnd] = useState(today);

  const handleLedgerChange = () => {
    var tempTransac = []
    var status_code = ""
    var date_start = new Date(filterDateStart)
    var date_end = new Date(filterDateEnd)
    var transac_date
    switch (filterTransactionType) {
      case "all":
        status_code = ""
        break;
      case "sales":
        status_code = "SR"
        break;
      case "purchases":
        status_code = "PR"
        break;
    }

    if (filterTransactionStatus == "all") {
      ledgerBaseLevel.map((transac) => {
        transac_date = new Date(transac.transaction_date)
        if (transac.id.startsWith(status_code) && (transac_date.getTime() >= date_start.getTime() && transac_date.getTime() <= date_end.getTime())) {
          tempTransac.push(transac)
        }
      })
    }
    else if (filterTransactionStatus == "voided") {
      ledgerBaseLevel.map((transac) => {
        if (transac.isVoided && transac.id.startsWith(status_code)) {
          tempTransac.push(transac)
        }
      })
    }
    else if (filterTransactionStatus == "unvoided") {
      ledgerBaseLevel.map((transac) => {
        if (!transac.isVoided && transac.id.startsWith(status_code)) {
          tempTransac.push(transac)
        }
      })
    }
    setFilteredLedger(tempTransac.sort((transac1, transac2) => {
      var transac1_date = new Date(transac1.transaction_date)
      var transac2_date = new Date(transac2.transaction_date)
      var difference = transac1_date.getTime() - transac2_date.getTime();
      if(difference == 0)
      {
        difference = transac1.id.localeCompare(transac2.id);
      }
      return difference
    }))
  }

  useEffect(() => {
    if (ledgerBaseLevel !== undefined) {
      handleLedgerChange()
    }
    else {

    }
  }, [filterTransactionStatus])

  useEffect(() => {
    if (ledgerBaseLevel !== undefined) {
      handleLedgerChange()
    }
    else {

    }
  }, [filterTransactionType])

  useEffect(() => {
    if (ledgerBaseLevel !== undefined) {
      handleLedgerChange()
    }
    else {

    }
  }, [filterDateStart])

  useEffect(() => {
    if (ledgerBaseLevel !== undefined) {
      handleLedgerChange()
    }
    else {

    }
  }, [filterDateEnd])


  useEffect(() => {
    if (stockcard === undefined || stockcard.length == 0) {

    }
    else {
      setLeadtimeAverage()
      setLeadtimeMinimum()
      setLeadtimeMaximum()
      if (docId !== undefined) {
        setLeadtimeAverage(stockcard[docId].analytics.leadtimeAverage)
        setLeadtimeMinimum(stockcard[docId].analytics.leadtimeMinimum)
        setLeadtimeMaximum(stockcard[docId].analytics.leadtimeMaximum)
      }
    }
  }, [docId])

  useEffect(() => {
    if (stockcard === undefined) {
      setIsFetched(false)
      setKey("main")
    }
    else {
      setIsFetched(true)
      if(stockcard.length > 0)
      {
        if(collectionUpdateMethod == "add")
        {
          setDocId(stockcard.length-1)
          setKey(stockcard[stockcard.length-1].id)
        }
        else
        {
          
          setCollectionUpdateMethod("add")
        }
      }
      else {
        setDocId()
        setKey("main")
      }
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
      const purchaseCollectionRef = collection(db, "purchase_record")
      const qq = query(purchaseCollectionRef, where("user", "==", userID));

      const unsubscribe = onSnapshot(qq, (snapshot) =>
        setAllPurchases(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );

      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])




  useEffect(() => {
    setLedgerBaseLevel(productAdjustments.concat(productSales.concat(productPurchases)))
    setFilteredLedger((productAdjustments.concat(productSales.concat(productPurchases))).sort((transac1, transac2) => {
      var transac1_date = new Date(transac1.transaction_date)
      var transac2_date = new Date(transac2.transaction_date)
      var difference = transac1_date.getTime() - transac2_date.getTime();
      if(difference == 0)
      {
        difference = transac1.id.localeCompare(transac2.id);
      }
      return difference
    }))
    setFilterTransactionType("all")
    setFilterTransactionStatus("all")
    setFilterDateStart("2001-01-01")
    setFilterDateEnd(today)
  }, [productPurchases, productSales, productAdjustments])

  function DisplayLedger(props) {
    return (
      <div id="ledger">
        <div className="row m-0 px-0 d-flex justify-content-end">
          <div className="col-3 float-end">
            <button
              className={showingFilterOptions ? "filter ative float-end" : "filter float-end"}
              data-title={showingFilterOptions ? "Hide Filter Options" : "Show Filter Options"}
              onClick={() => { if (showingFilterOptions) { setShowingFilterOptions(false) } else { setShowingFilterOptions(true) } }}
            >
              <FontAwesomeIcon icon={faFilter} />
            </button>
          </div>
        </div>
        <div className="row m-0 p-0 py-2">
          <div className="col-12 p-0">
            {showingFilterOptions ?
              <div id="ledger-filter-options" className="interrelated-options mb-3">
                <div className="row m-0 p-0 mb-4">
                  <div className="col-1 px-1 py-0 d-flex flex-row">
                    <div className="row m-0 p-0 d-flex align-items-center">
                      <div className="col-12 m-0 p-0 d-flex justify-content-center">
                        <div><span><strong>Record</strong> </span></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-5 px-1 py-0 d-flex flex-row">
                    <div className="row m-0 p-0 d-flex align-items-center">
                      <div className="col-3 m-0 p-0 d-flex">
                        <div><span> Type: </span></div>
                      </div>
                      <div className="col-9 m-0 p-0">
                        <a
                          className={filterTransactionType == "all" ? 'start-option active' : 'start-option'}
                          onClick={() => { setFilterTransactionType("all"); setFilterClickCounter(filterClickCounter + 1) }}
                        >
                          All
                        </a>
                        <a
                          className={filterTransactionType == "sales" ? 'center-option active' : 'center-option'}
                          onClick={() => { setFilterTransactionType("sales"); setFilterClickCounter(filterClickCounter + 1) }}
                        >
                          Sales
                        </a>
                        <a
                          className={filterTransactionType == "purchases" ? 'end-option active' : 'end-option'}
                          onClick={() => { setFilterTransactionType("purchases"); setFilterClickCounter(filterClickCounter + 1) }}
                        >
                          Purchases
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="col-6 px-1 py-0 d-flex flex-row">
                    <div className="row m-0 p-0 d-flex align-items-center">
                      <div className="col-3 m-0 p-0 d-flex justify-content-center">
                        <div style={{ lineHeight: '0' }}>Status: </div>
                      </div>
                      <div className="col-9 m-0 p-0">
                        <a
                          className={filterTransactionStatus == "all" ? 'start-option active' : 'start-option'}
                          onClick={() => { setFilterTransactionStatus("all"); setFilterClickCounter(filterClickCounter + 1) }}
                        >
                          All
                        </a>
                        <a
                          className={filterTransactionStatus == "voided" ? 'center-option active' : 'center-option'}
                          onClick={() => { setFilterTransactionStatus("voided"); setFilterClickCounter(filterClickCounter + 1) }}
                        >
                          Voided
                        </a>
                        <a
                          className={filterTransactionStatus == "unvoided" ? 'end-option active' : 'end-option'}
                          onClick={() => { setFilterTransactionStatus("unvoided"); setFilterClickCounter(filterClickCounter + 1) }}
                        >
                          Unvoided
                        </a>
                      </div>
                    </div>

                  </div>
                </div>
                <div className="row m-0 p-0">
                  <div className="col-1 px-1 py-0 d-flex flex-row">
                    <div className="row m-0 p-0 d-flex align-items-center">
                      <div className="col-12 m-0 p-0 d-flex justify-content-center">
                        <div style={{ lineHeight: '0' }}><strong>Date </strong></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-4 px-1 py-0 d-flex flex-row">
                    <div className="row m-0 p-0 d-flex align-items-center">
                      <div className="col-4 m-0 p-0 d-flex justify-content-center">
                        <div>From: </div>
                      </div>
                      <div className="col-8 m-0 p-0">
                        <a
                          className="solo-option active"
                        >
                          <input
                            type="date"
                            required
                            value={filterDateStart}
                            onChange={(e) => { setFilterDateStart(e.target.value) }}
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="col-4 px-1 py-0 d-flex flex-row">
                    <div className="row m-0 p-0 d-flex align-items-center">
                      <div className="col-4 m-0 p-0 d-flex justify-content-center">
                        <div>To: </div>
                      </div>
                      <div className="col-8 m-0 p-0">
                        <a
                          className="solo-option active"
                        >
                          <input
                            type="date"
                            required
                            value={filterDateEnd}
                            onChange={(e) => { setFilterDateEnd(e.target.value) }}
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="col-3 px-1 py-0 d-flex flex-row justify-content-center">
                    <div className="row m-0 p-0 d-flex align-items-center">
                      <div className="col-12 m-0 p-0">
                        <a
                          className="solo-option warning"
                          onClick={() => { setFilterTransactionType("all"); setFilterTransactionStatus("all"); setFilterDateStart("2000-01-01"); setFilterDateEnd(today) }}
                        >
                          Reset
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              :
              <div className="row m-0 mb-1 py-0 px-2 d-flex align-item-center">
                <div className="col-8 m-0 p-0 d-flex justify-content-start">
                  <strong>
                    {filterTransactionStatus.charAt(0).toUpperCase() + filterTransactionStatus.slice(1)} {filterTransactionType == "all" ? "sales & purchases" : filterTransactionType} records {filterDateStart == "2001-01-01" ? "as of " + (filterDateEnd == today ? "today" : (moment(filterDateEnd).format('dddd'), moment(filterDateEnd).format('MMMM D, YYYY'))) : "from " + (moment(filterDateStart).format('dddd'), moment(filterDateStart).format('MMMM D, YYYY')) + " to " + (filterDateEnd == today ? "this day" : (moment(filterDateEnd).format('dddd'), moment(filterDateEnd).format('MMMM D, YYYY')))}:
                  </strong>
                </div>
                <div className="col-4 m-0 p-0 d-flex justify-content-end">
                  {filteredLedger.length + " " + (filteredLedger.length == 1 ? "record" : "records")}
                </div>
              </div>
            }
          </div>
        </div>
        <div className="row m-0 px-0 p-0">
          <Table hover={filteredLedger.length > 0} id="per-product-record" className="scrollable-table">
            <thead>
              <tr>
                <th className="tno left-curve">Transaction No.</th>
                <th className="td">Date</th>
                <th className="ts">Supplier</th>
                <th className="tq">Qty</th>
                <th className="tnt right-curve">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length > 0 ?
                <>
                  {filteredLedger.map((transac)=>{
                    return(
                      <tr key={transac.id} className={'clickable' + (transac.isVoided?'voided-transaction':'')}
                      onClick={()=>{setRecordToView(transac.id); setRecordQuickViewModalShow(true)}}>
                        
                        <td className="tno">
                          {transac.id.substring(0, 7)}
                        </td>
                        <td className="td">
                          {transac.transaction_date == undefined?
                            <>{transac.date}</>
                          :
                            <>{transac.transaction_date}</>
                          }
                        </td>
                        <td className="ts">
                          {transac.transaction_supplier === undefined ? 
                            <>-</> 
                          : 
                            <>
                            {transac.transaction_supplier.startsWith("SU")?
                              <>{getSupplierInfo(transac.transaction_supplier).supplier_name}</>
                            :
                              <>{transac.transaction_supplier}</>
                            }
                            </>
                          }
                        </td>
                        <td className="tq">
                          {transac.id.startsWith("PR")?
                            <>{transac.product_list[0].itemQuantity}</>
                          :
                            <>{transac.product_list[0].itemQuantity * -1}</>
                          }
                        </td>
                        <td className="tnt">
                          {transac.transaction_note == undefined?
                            <>{transac.notes}</>
                          :
                            <>{transac.transaction_note}</>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </>
                :
                <tr>
                  <td colSpan="5" className="text-center">
                    <div className="w-100 h-100 font-italic">
                      No records.
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </Table>
        </div>
      </div>
    );
  }

  //Edit Stockcard Data Modal-----------------------------------------------------------------------------
  function EditProductModal(props) {

    const [newStockcardDescription, setNewStockcardDescription] = useState("");
    const [newStockcardCategory, setNewStockcardCategory] = useState("");
    const [newStockcardPPrice, setNewStockcardPPrice] = useState(0);
    const [newStockcardSPrice, setNewStockcardSPrice] = useState(0);
    const [newStockcardClassification, setNewStockcardClassification] = useState("");
    const [newStockcardBarcode, setNewStockcardBarcode] = useState(0);
    const [newStockcardMaxQty, setNewStockcardMaxQty] = useState(0);
    const [newStockcardMinQty, setNewStockcardMinQty] = useState(0);
    const [uploadedOneImage, setUploadedOneImage] = useState(false);

    const [categorySuggestions, setCategorySuggestions] = useState([])
    const [disallowAddition, setDisallowAddtion] = useState(true)
    const [userCollection, setUserCollection] = useState([]);// userCollection variable
    const [userProfileID, setUserProfileID] = useState(""); // user profile id
    const userCollectionRef = collection(db, "user")// user collection

    const [imageUpload, setImageUpload] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const [uploading, setUploading] = useState(false);

    //SetValues
    useEffect(() => {
      if (
        newStockcardDescription == " " ||
        newStockcardPPrice == 0 ||
        newStockcardSPrice == 0 ||
        newStockcardCategory == " " ||
        newStockcardClassification == " "
      ) {
        setDisallowAddtion(true)
      }
      else {
        setDisallowAddtion(false)
      }
      if (imageUrls.length == 0) {
        setUploadedOneImage(false)
      }
      else {
        setUploadedOneImage(true)
        setUploading(false)
      }
    })

    useEffect(() => {
      /*console.log(newStockcardDescription)
      console.log(newStockcardCategory)
      console.log(newStockcardPPrice)
      console.log(newStockcardSPrice)
      console.log(newStockcardClassification)
      console.log(newStockcardBarcode)
      console.log(newStockcardMaxQty)
      console.log(newStockcardMinQty)
      console.log(uploadedOneImage)*/
    })
    //fetch user collection from database
    useEffect(() => {
      if (userID === undefined) {
        const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));

        const unsub = onSnapshot(q, (snapshot) =>
          setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
      }
      else {
        const q = query(userCollectionRef, where("user", "==", userID));

        const unsub = onSnapshot(q, (snapshot) =>
          setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

      }
    }, [userID])

    //assign profile and purchase counter
    useEffect(() => {
      userCollection.map((metadata) => {
        setUserProfileID(metadata.id)
        setCategorySuggestions(metadata.categories)
      });
    }, [userCollection])

    useEffect(() => {
      if (stockcard === undefined || docId === undefined) {

      }
      else {
        setNewStockcardDescription(stockcard[docId].description)
        setNewStockcardCategory(stockcard[docId].category)
        setNewStockcardSPrice(stockcard[docId].s_price)
        setNewStockcardPPrice(stockcard[docId].p_price)
        setNewStockcardClassification(stockcard[docId].classification)
        setNewStockcardBarcode(stockcard[docId].barcode)
        setNewStockcardMaxQty(stockcard[docId].max_qty)
        setNewStockcardMinQty(stockcard[docId].min_qty)
        setNewStockcardMinQty(stockcard[docId].min_qty)
        setImageUrls([...imageUrls, stockcard[docId].img])
      }
    }, [docId])


    const newCatergories = () => {
      var newcategories = categorySuggestions;
      if (categorySuggestions.indexOf(newStockcardCategory) == -1) {
        newcategories.push(newStockcardCategory)
      }
      return newcategories;
    }

    const handleClickSuggestion = (suggestion) => {
      setNewStockcardCategory(suggestion.index)
    }

    const imagesListRef = ref(st, userID + "/stockcard/");
    const uploadFile = () => {
      if (imageUpload == null) return;
      const imageRef = ref(st, `${userID}/stockcard/${stockcard[docId].id.substring(0, 9)}`);
      uploadBytes(imageRef, imageUpload).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setImageUrls((prev) => [...prev, url]);
        });
      });
    };


    //update stockcard Document
    function UpdateStockcard() {
      updateDoc(doc(db, "stockcard", stockcard[docId].id), {
        description: newStockcardDescription
        , classification: newStockcardClassification
        , category: newStockcardCategory
        , barcode: Number(newStockcardBarcode)
        , s_price: Number(newStockcardSPrice)
        , p_price: Number(newStockcardPPrice)
        , min_qty: Number(newStockcardMinQty)
        , max_qty: Number(newStockcardMaxQty)
        , img: imageUrls[0]
      });
      updateDoc(doc(db, 'user', userProfileID), {
        categories: newCatergories(),
      });
      updateToast()
      props.onHide()
      setCollectionUpdateMethod("update")
    }

    //update Toast
    const updateToast = () => {
      toast.info("Updating "+ stockcard[docId].description, {
        position: "top-right",
        autoClose: 1300,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Zoom
      })
    }


    return (
      <Modal
        {...props}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal"
      >
        <Modal.Body >
          <div className="px-3 py-2">
            <div className="module-header mb-4">
              <h3 className="text-center">
                Editing
                {editingBarcode ?
                  <> barcode of </>
                  :
                  <> </>
                }
                {stockcard === undefined || docId === undefined ? <></> : <>{stockcard[docId].description}</>}
              </h3>
            </div>
            <div
              id="image-upload"
              className="row m-0 p-0"
            >
              <div className="col-4 px-3">
                <div className="row my-2 mb-3">
                  <div className='col-12 ps-4'>
                    <label className="">Product Image</label>
                    <div className="row m-0 p-0">
                      <div className="col-10 p-0 m-0">
                        <input
                          className="form-control shadow-none"
                          type="file"
                          onChange={(event) => {
                            setImageUrls([]);
                            setImageUpload(event.target.files[0]);
                          }}
                        />
                      </div>
                      <div className="col-2 p-0 m-0">
                        <Button
                          variant="btn btn-success"
                          className="shadow-none w-100"
                          disabled={uploadedOneImage}
                          onClick={() => { setUploading(true); uploadFile() }}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row my-2 mb-3 ps-4 w-100 h-75">
                  <div
                    id="image-upload-preview"
                    className='col-12 w-100 h-100 d-flex align-items-center justify-content-center'
                  >
                    {uploading ?
                      <>
                        {imageUrls.length == 0 ?
                          <Spinner
                            color1="#b0e4ff"
                            color2="#fff"
                            textColor="rgba(0,0,0, 0.5)"
                            className="w-25 h-25"
                          />
                          :
                          <></>
                        }
                      </>
                      :
                      <>
                        {imageUrls.map((url, index) => {
                          return <img src={url} style={{ height: '100%', width: '100%' }} key={index} />;
                        })}
                      </>
                    }
                  </div>
                </div>
              </div>
              <div className="col-8 px-3">
                <div className="row my-2 mb-3">
                  <div className='col-6 ps-4'>
                    <label>Item Code</label>
                    <input type="text"
                      readOnly
                      className="form-control shadow-none shadow-none no-click"
                      placeholder=""
                      defaultValue={stockcard === undefined || docId === undefined ? "" : stockcard[docId].id.substring(0, 9)}
                    />
                  </div>
                  <div className='col-6 ps-4'>
                    <label>Classification</label>
                    <select
                      type="text"
                      className="form-control shadow-none"
                      value={newStockcardClassification}
                      onChange={(event) => { setNewStockcardClassification(event.target.value) }}
                    >
                      <option value="Imported">Imported</option>
                      <option value="Manufactured">Manufactured</option>
                      <option value="Non-trading">Non-trading</option>
                    </select>
                  </div>
                </div>
                <div className="row my-2 mb-3">
                  <div className='col-12 ps-4'>
                    <label>Item Name</label>
                    <input type="text"
                      className="form-control shadow-none"
                      placeholder="LM Pancit Canton Orig (Pack-10pcs)"
                      required
                      value={newStockcardDescription}
                      onChange={(event) => { setNewStockcardDescription(event.target.value); }}
                    />
                  </div>
                </div>
                <div className="row my-2 mb-3">
                  <div id="product-category" className='col-6 ps-4 d-flex align-item-center flex-column'>
                    <label>Category</label>
                    <input type="text"
                      id="product-category-input"
                      className="form-control shadow-none"
                      placeholder="Category"
                      required
                      onChange={(event) => { setNewStockcardCategory(event.target.value); }}
                      value={newStockcardCategory}
                    />
                    <div id="product-category-suggestions">
                      <div>
                        {categorySuggestions.map((index, k) => {
                          return (
                            <button
                              key={"category-" + k}
                              onClick={() => handleClickSuggestion({ index })}
                            >
                              {index}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className='col-6 ps-4'>
                    <label>
                      Barcode
                      <a
                        className="ms-2"
                        data-title="This barcode is autogenerated"
                      >
                        <FontAwesomeIcon icon={faCircleInfo} />
                      </a>
                    </label>
                    <input
                      type="number"
                      min={0}
                      autoFocus={editingBarcode}
                      value={newStockcardBarcode}
                      className={editingBarcode ? "form-control shadow-none barcode-in-edit" : "form-control shadow-none"}
                      onChange={(event) => { setNewStockcardBarcode(event.target.value) }}
                    />
                  </div>
                </div>
                <div className="row my-2 mb-3">
                  <div className='col-3 ps-4'>
                    <label>Purchase Price</label>
                    <input
                      type="number"
                      min={1}
                      value={newStockcardPPrice}
                      className="form-control shadow-none"
                      placeholder="Purchase Price"
                      onChange={(event) => { setNewStockcardPPrice(event.target.value); }}
                    />
                  </div>
                  <div className='col-3 ps-4'>
                    <label>Selling Price</label>
                    <input
                      type="number"
                      min={1}
                      value={newStockcardSPrice}
                      className="form-control shadow-none"
                      placeholder="Selling Price"
                      onChange={(event) => { setNewStockcardSPrice(event.target.value); }}
                    />
                  </div>
                  <div className='col-3 ps-4'>
                    <label>
                      Min Quantity
                      <a
                        className="ms-2"
                        data-title="The quantity to be considered low stock level"
                      >
                        <FontAwesomeIcon icon={faCircleInfo} />
                      </a>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newStockcardMinQty}
                      className="form-control shadow-none"
                      onChange={(event) => { setNewStockcardMinQty(event.target.value); }}
                    />
                  </div>
                  <div className='col-3 ps-4'>
                    <label>
                      Max Quantity
                      <a
                        className="ms-2"
                        data-title="The quantity to be considered overstocked"
                      >
                        <FontAwesomeIcon icon={faCircleInfo} />
                      </a>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newStockcardMaxQty}
                      className="form-control shadow-none"
                      onChange={(event) => { setNewStockcardMaxQty(event.target.value); }}
                    />
                  </div>
                </div>
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
            onClick={() => props.onHide()}
          >
            Cancel
          </Button>
          <Button
            className="btn btn-light float-start"
            disabled={disallowAddition}
            style={{ width: "9rem" }}
            onClick={() => { UpdateStockcard(); }}
          >
            Update
            {editingBarcode ?
              <> Barcode</>
              :
              <> Product</>
            }
          </Button>
        </Modal.Footer>
      </Modal>


    )
  }

  //Edit Stockcard Data Modal-----------------------------------------------------------------------------
  function DeleteProductModal(props) {

    //delete row 
    const deleteStockcard = async () => {
      setDocId(0)
      setKey('main')
      setCollectionUpdateMethod("delete")
      const stockcardDoc = doc(db, "stockcard", stockcard[docId].id)
      deleteToast();
      await deleteDoc(stockcardDoc);
      props.onHide()
    }

    //delete Toast
    const deleteToast = () => {
      toast.error("Deleting " + stockcard[docId].description + " from the Database", {
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
        {(stockcard.length == 0 || stockcard === undefined) || docId === undefined ?
        <></>
        :
        <div className="px-3 py-2">
          <div className="module-header mb-4">
            <h3 className="text-center">Deleting {stockcard === undefined || docId === undefined ?<></>:<>{stockcard[docId].id.substring(0,9)}</>}</h3>
          </div>
          <div className="row m-0 p-0 mb-3">
            <div className="col-12 px-3 text-center">
              <strong>
                Are you sure you want to delete
                <br />
                <span style={{color: '#b42525'}}>{stockcard[docId].description}?</span>
              </strong>
            </div>
          </div>
          <div className="row m-0 p-0">
                <div className="col-12 px-3 d-flex justify-content-center">
                  <Table size="sm">
                    <tbody>
                      <tr>
                        <td>Description</td>
                        <td>{stockcard[docId].description}</td>
                      </tr>
                      <tr>
                        <td>Classification</td>
                        <td>{stockcard[docId].classification}</td>
                      </tr>
                      <tr>
                        <td>Category</td>
                        <td>{stockcard[docId].category}</td>
                      </tr>
                      <tr>
                        <td>Classification</td>
                        <td>{stockcard[docId].barcode}</td>
                      </tr>
                      <tr>
                        <td>Minimum Quantity</td>
                        <td>{stockcard[docId].min_qty}</td>
                      </tr>
                      <tr>
                        <td>Maximum Quantity</td>
                        <td>{stockcard[docId].max_qty}</td>
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
            onClick={() => { deleteStockcard() }}
          >
            Delete Product
          </Button>
        </Modal.Footer>
      </Modal>


    )
  }

  function DisplayPurchases(props) {
    return (
      <div id="lead-time">
        <div className="row m-0 px-0 py-2 d-flex align-items-center justify-content-between">
          <div className="col-9 p-0">
            {purchaseRecordCollection === undefined?
              <></>
            :
              <>
                {getDelayCount()?
                  <div className="yellow-strip p-2 left-full-curve right-full-curve w-100 h-80" style={{ fontSize: '0.95em' }}>
                    Some transactions have no order date. Lead time may be inaccurate.
                  </div>
                :
                  <></>
                }
              </>
            }
          </div>
          <div className="col-3 p-0 float-end">
            <button
              className={showingLeadtimeOptions ? "filter active float-end" : "filter float-end"}
              disabled={newMaxLeadtime < newMinLeadtime}
              data-title={showingLeadtimeOptions ? (newMaxLeadtime < newMinLeadtime?"Max is lower than min":"Save") : "Set your own leadtime"}
              onClick={() => {
                if (showingLeadtimeOptions) {
                  setShowingLeadtimeOptions(false)
                  updateLeadtime(stockcard[docId].id)
                }
                else {
                  setShowingLeadtimeOptions(true)
                }
              }
              }
            >
              {showingLeadtimeOptions ?
                <FontAwesomeIcon icon={faSave} />
                :
                <FontAwesomeIcon icon={faCog} />
              }
            </button>
          </div>
        </div>
        <div className="row m-0 px-0 d-flex justify-content-end">
          <div className="col-8">
            <Table className="scrollable-table records-table light">
              <thead>
                <tr>
                  <th>Purchase Number</th>
                  <th>Purchase Date</th>
                  <th>Order Date</th>
                  <th>Delay</th>
                </tr>
              </thead>
              <tbody>
                {purchaseRecordCollection === undefined ?
                  <Spinner />
                  :
                  <>
                    {purchaseRecordCollection.map((purch, index) => {
                      return (
                        <tr key={purch.transaction_number}>
                          <td>{purch.transaction_number}</td>
                          <td>{purch.transaction_date}</td>
                          <td>
                            {purch.order_date === undefined || purch.order_date == "" || purch.order_date == "" ?
                              <div style={{ fontStyle: 'italic', opacity: '0.8' }}>Not set</div>
                              :
                              <>
                                {purch.order_date}
                              </>
                            }
                          </td>
                          <td>{computeDelay(purch.transaction_date, purch.order_date)}</td>
                        </tr>
                      )
                    })}
                  </>
                }
              </tbody>
            </Table>
          </div>
          <div className="col-1">
          </div>
          {showingLeadtimeOptions ?
            <div className="col-3 py-0 px-3">
              <div id="leadtime-specs" className="row d-flex justify-content-center flex-column">
                <div className="row m-0 px-0 pb-3 d-flex justify-content-center flex-column">
                  <small>Minimum</small>
                  <h5><FontAwesomeIcon icon={faTruck} /></h5>
                  <input
                    type="number"
                    className="data-label"
                    style={{ backgroundColor: '#fff' }}
                    autoFocus
                    value={newMinLeadtime}
                    onChange={(event) => { setNewMinLeadtime(event.target.value); }}
                  />
                </div>
                <div className="row m-0 px-0 pb-3 d-flex justify-content-center flex-column">
                  <small>Maximum</small>
                  <h5><FontAwesomeIcon icon={faTruck} /></h5>
                  <input
                    type="number"
                    className="data-label"
                    style={{ backgroundColor: '#fff' }}
                    autoFocus
                    value={newMaxLeadtime}
                    onChange={(event) => { setNewMaxLeadtime(event.target.value); }}
                  />
                </div>
                <div className="row m-0 px-0 pb-3 d-flex justify-content-center flex-column">
                  <small>Average</small>
                  <h5><FontAwesomeIcon icon={faTruck} /></h5>
                  <small className="data-label">
                    {(stockcard[docId].analytics.leadtimeAverage) / 2} day(s)
                  </small>
                </div>
              </div>
            </div>
            :
            <div className="col-3 py-0 px-3">
              <div id="leadtime-specs" className="row d-flex justify-content-center flex-column">
                <div className="row m-0 px-0 pb-3 d-flex justify-content-center flex-column">
                  <small>Minimum</small>
                  <h5><FontAwesomeIcon icon={faTruck} /></h5>
                  <small className="data-label">
                    {stockcard[docId].analytics.leadtimeMinimum} day(s)
                  </small>
                </div>
                <div className="row m-0 px-0 pb-3 d-flex justify-content-center flex-column">
                  <small>Maximum</small>
                  <h5><FontAwesomeIcon icon={faTruck} /></h5>
                  <small className="data-label">
                    {stockcard[docId].analytics.leadtimeMaximum} day(s)
                  </small>
                </div>
                <div className="row m-0 px-0 pb-3 d-flex justify-content-center flex-column">
                  <small>Average</small>
                  <h5><FontAwesomeIcon icon={faTruck} /></h5>
                  <small className="data-label">
                    {stockcard[docId].analytics.leadtimeAverage} day(s)
                  </small>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    )
  }

  //--------------------------------LEAD TIME FUNCTION---------------------------------

  const [leadtimeModalShow, setLeadtimeModalShow] = useState(false);

  const [newMinLeadtime, setNewMinLeadtime] = useState(0);
  const [newMaxLeadtime, setNewMaxLeadtime] = useState(0);
  const [newAverageLeadtime, setNewAverageLeadtime] = useState(0);

  const [currStockLvl, setCurrStockLvl] = useState(0)
  const [safetyStock, setSafetyStock] = useState(0); // safetyStock
  const [reorderPoint, setReorderPoint] = useState(); // ReorderPoint
  const [highestDailySales, setHighestDailySales] = useState(0); //highest daily sales
  const [averageDailySales, setAverageDailySales] = useState(0); //average daily sales 
  const [daysROP, setDaysROP] = useState(); // days before ReorderPoint
  const [dateReorderPoint, setDateReorderPoint] = useState()



  useEffect(() => {
    if (docId !== undefined) {
      setCurrStockLvl(stockcard[docId].qty)
      setNewMaxLeadtime(stockcard[docId].analytics.leadtimeMaximum)
      setNewMinLeadtime(stockcard[docId].analytics.leadtimeMinimum)
      setAverageDailySales(stockcard[docId].analytics.averageDailySales)
      setHighestDailySales(stockcard[docId].analytics.highestDailySales)
      setSafetyStock(stockcard[docId].analytics.safetyStock)
      setReorderPoint(stockcard[docId].analytics.reorderPoint)
      setDaysROP(stockcard[docId].analytics.daysROP)
    }
  }, [docId])


  useEffect(() => {
    if (docId !== undefined) {
      console.log("stockcard[docId]: ", stockcard[docId])
    }
  }, [docId])


  useEffect(() => {
    if (docId === undefined) {

    }
    else {
      setNewMaxLeadtime(stockcard[docId].analytics.leadtimeMaximum)
      setNewMinLeadtime(stockcard[docId].analytics.leadtimeMinimum)
    }
  }, [docId])


  //conputeAverageLeadtime
  useEffect(() => {
    computeAverageLeadtime()
  }, [newMaxLeadtime, newMinLeadtime])

  function computeAverageLeadtime() {
    let x = 0
    let y = 0
    x = Number(newMaxLeadtime) + Number(newMinLeadtime)
    y = Number(x / 2)
    setNewAverageLeadtime(y)
  }


  //compute SafetyStock
  useEffect(() => {

    let x = 0
    let y = 0
    let z = 0
    x = Number(highestDailySales) * Number(newMaxLeadtime)
    y = Number(averageDailySales) * Number(newAverageLeadtime)
    z = Number(x - y)

    setSafetyStock(Math.round(z))
  }, [highestDailySales, averageDailySales, newMaxLeadtime, newAverageLeadtime, docId])


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
    let x = currStockLvl - reorderPoint
    let y = averageDailySales
    let a = (x / y)
    let z = Math.round(a)
    setDaysROP(z)
  }, [averageDailySales, reorderPoint, currStockLvl, docId])



  // Date of reorder point = date today + number of days before reorder point
  function computeDaysToReorderPoint() {

    setDateReorderPoint()
    if (daysROP !== undefined) {
      let tempDate = new Date()
      let x
      let y
      y = Math.round(daysROP)
      x = tempDate.setDate(tempDate.getDate() + y)
      let z = new Date(x)
      z = moment(z).format('YYYY-MM-DD')
      setDateReorderPoint(z)
    }
  }

  useEffect(() => {
    computeDaysToReorderPoint()
  }, [daysROP, docId])


  const updateLeadtime = () => {
    updateDoc(doc(db, "stockcard", stockcard[docId].id), {
      "analytics.leadtimeMaximum": Number(newMaxLeadtime),
      "analytics.leadtimeMinimum": Number(newMinLeadtime),
      "analytics.leadtimeAverage": Number(newAverageLeadtime),
      "analytics.safetyStock": Number(safetyStock),
      "analytics.reorderPoint": Number(reorderPoint),
      "analytics.daysROP": Number(daysROP),
      "analytics.dateReorderPoint": dateReorderPoint,
    });
    setCollectionUpdateMethod("update")
    updateLeadtimeToast()
  }
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



  //---start of editLeadtimeModal
 
  function EditLeadtimeModal(props) {
  
  
  
    const handleEditLeadtimeClose = () => setLeadtimeModalShow(false);
  
  
    useEffect(() => {
      console.log("newAverageLeadtime:", newAverageLeadtime)
    }, [newAverageLeadtime])
  
    useEffect(() => {
      console.log("newMinLeadtime:", newMinLeadtime)
    }, [newMinLeadtime])
  
    useEffect(() => {
      console.log("newMaxLeadtime:", newMaxLeadtime)
    }, [newMaxLeadtime])
  
  
  
    //update Toast
  
  
    function updateLeadtime() {
      updateDoc(doc(db, "stockcard", docId), {
        "analytics.leadtimeMaximum": Number(newMaxLeadtime),
        "analytics.leadtimeMinimum": Number(newMinLeadtime),
        "analytics.leadtimeAverage": Number(newAverageLeadtime),
        "analytics.safetyStock": Number(safetyStock),
        "analytics.reorderPoint": Number(reorderPoint),
        "analytics.daysROP": Number(daysROP)
      });
      setCollectionUpdateMethod("update")
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
            disabled={newMaxLeadtime > newMinLeadtime}
            onClick={() => { updateLeadtime(docId) }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
 
  //---end of editLeadtimeModal
  //-----------------------------------------------------------------------------------------------

  const handleDocChange = (doc) => {
    stockcard.map((product, index) => {
      if (product.id == doc) {
        setDocId(index)
      }
    })
  }

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
        return stockcard.id.toLowerCase().includes(keyword.toLowerCase()) || stockcard.description.toLowerCase().includes(keyword.toLowerCase())
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
      <RecordQuickView
        show={recordQuickViewModalShow}
        onHide={() => setRecordQuickViewModalShow(false)}
        recordid={recordToView}
      />

      <Tab.Container
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
        <div id="contents" className="row">
          <div className="row py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header>
                  <div className='row'>
                    <InputGroup id="fc-search">
                      <InputGroup.Text>
                        <FontAwesomeIcon icon={faSearch} />
                      </InputGroup.Text>
                      <FormControl
                        type="search"
                        value={searchValue}
                        onChange={filter}
                        className="input"
                        placeholder="IT000013, Rexona Pink 3mL (1pc)"
                      />
                    </InputGroup>
                  </div>
                </Card.Header>
                <Card.Body style={{ height: "500px" }}>
                  <div className="row pt-0 pb-3 px-3 d-flex align-items-center justify-content-center flex-row">
                    <div className="col-3 px-1 d-flex align-items-center justify-content-start">
                      <div className="d-inline-block me-1 circle-small" style={{ backgroundColor: '#f6f3bb', width: '1em', height: '1em' }}></div>
                      <div>Low Stock</div>
                    </div>
                    <div className="col-5 px-1 d-flex align-items-center justify-content-center">
                      <div className="d-inline-block me-1 circle-small" style={{ backgroundColor: '#e19f9f', width: '1em', height: '1em' }}></div>
                      <div>Out of Stock</div>
                    </div>
                    <div className="col-4 px-1 d-flex align-items-center justify-content-end">
                      <div className="d-inline-block me-1 circle-small" style={{ backgroundColor: '#bebbf6', width: '1em', height: '1em' }}></div>
                      <div>Overstocked</div>
                    </div>
                  </div>
                  <div className="row g-1 sidebar-header">
                    <div className="col-3 left-curve">
                      Item Code
                    </div>
                    <div className="col-7">
                      Description
                    </div>
                    <div className="col-2 right-curve">
                      Qty
                    </div>
                  </div>
                  <div className='scrollbar' style={{ height: '380px' }}>
                    {isFetched ?
                      <>
                        {stockcard.length === 0 ?
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                            <h5 className="mb-3"><strong>No <span style={{ color: '#0d6efd' }}>products</span> to show.</strong></h5>
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
                              searchResult.map((stockcard) => (
                                <ListGroup.Item
                                  action
                                  key={stockcard.id}
                                  eventKey={stockcard.id}
                                  onClick={() => { handleDocChange(stockcard.id) }}
                                  className={(DetermineStockLevel(stockcard.qty, stockcard.min_qty, stockcard.max_qty, stockcard.id))}
                                >
                                  <div className="row gx-0 sidebar-contents">
                                    <div className="col-3">
                                      {stockcard.id.substring(0, 9)}
                                    </div>
                                    <div className="col-7">
                                      {stockcard.description}
                                    </div>
                                    <div className="col-2">
                                      {stockcard.qty}
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              ))
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column" style={{ marginTop: '25%' }}>
                                <h5>
                                  <strong className="d-flex align-items-center justify-content-center flex-column">
                                    No product matched:
                                    <br />
                                    <span style={{ color: '#0d6efd' }}>{searchValue}</span>
                                  </strong>
                                </h5>
                              </div>
                            )}
                          </ListGroup>
                        }
                      </>
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
                  <div className='row py-1 m-0 placeholder-content' id="product-contents">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Inventory</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                      <div className="col d-flex align-items-center">
                        <div className="me-2">
                          <InformationCircle
                            color={'#0d6efd'}
                            height="40px"
                            width="40px"
                          />
                        </div>
                        <div>
                          <h4 className="data-id"><strong><span className="col-12">IT000000</span></strong></h4>
                        </div>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <NewProductModal
                            show={modalShow}
                            onHide={() => { setModalShow(false) }}
                          />
                          <Button
                            className="add me-1"
                            data-title="Add New Product"
                            onClick={() => setModalShow(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          <Button
                            className="edit me-1"
                            disabled
                            data-title="Edit Product"
                            >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            className="delete me-1"
                            disabled
                            data-title="Delete Product"
                          >
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="row py-1 data-specs m-0 d-flex align-items-center" id="product-info">
                      <div id="message-to-select">
                        <div className="blur-overlay">
                          <div className="d-flex align-items-center justify-content-center" style={{width: '100%', height: '100%'}}>
                            
                          </div>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="row m-0 p-0 d-flex align-items-center flex-column">
                          <div className="data-img mb-2  d-flex align-items-center justify-content-center">
                            <img src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fproduct-image-placeholder.png?alt=media&token=c29c223b-c9a1-4b47-af4f-c57a76b3e6c2" style={{ width: '80%' }} />
                          </div>
                          <a className="data-barcode">
                            <Barcode
                              className="barcode"
                              format="EAN13"
                              value="000000000000"
                              color="#c6d4ea"
                            />
                          </a>
                        </div>
                      </div>
                      <div className="col-9 py-3">
                        <div className="row mb-3">
                          <div className="col-12 px-1">
                            <div className="row m-0 p-0">
                              <a
                                className="col-1 data-icon d-flex align-items-center justify-content-center"
                                data-title="Product Description"
                              >
                                <Cube
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-11 data-label">
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-6 px-1">
                            <div className="row m-0 p-0">
                              <a
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Product Category"
                              >
                                <Grid
                                  color={'#00000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-10 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-6 px-1">
                            <div className="row m-0 p-0">
                              <a
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Classification"
                              >
                                <GitBranch
                                  color={'#00000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-10 data-label">
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-3 px-1">
                            <div className="row m-0 p-0">
                              <a
                                className="col-4 data-icon d-flex align-items-center justify-content-center"
                                data-title="Selling Price"
                              >
                                <Pricetag
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-8 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-3 px-1">
                            <div className="row m-0 p-0">
                              <a
                                className="col-4 data-icon d-flex align-items-center justify-content-center"
                                data-title="Purchase Price"
                              >
                                <Cart
                                  className="me-2"
                                  color={'#00000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-8 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-3 px-1">
                            <div className="row m-0 p-0">
                              <a
                                className="col-4 data-icon d-flex align-items-center justify-content-center"
                                data-title="Minimum Quantity"
                              >
                                <CaretDown
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-8 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-3 px-1">
                            <div className="row m-0 p-0">
                              <a
                                className="col-4 data-icon d-flex align-items-center justify-content-center"
                                data-title="Maximum Quantity"
                              >
                                <CaretUp
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-8 data-label">
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row mb-3" id="product-info-qty">
                          <div className="col-4 px-1">
                            <div className="row m-0 p-0">
                              <div className="col-3 data-icon d-flex align-items-center justify-content-center">
                                <Layers
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </div>
                              <div className="col-9 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-4 px-1">
                            <div className="row m-0 p-0">
                              <div className="col-3 data-icon d-flex align-items-center justify-content-center">
                                <Enter
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </div>
                              <div className="col-9 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-4 px-1">
                            <div className="row m-0 p-0">
                              <div className="col-3 data-icon d-flex align-items-center justify-content-center">
                                <Exit
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </div>
                              <div className="col-9 data-label">
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                {(stockcard === undefined || stockcard.length == 0) || docId === undefined?
                  <></>
                :
                <Tab.Pane eventKey={stockcard[docId].id}>
                  <div className='row py-1 m-0' id="product-contents">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Inventory</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                      <div className="col d-flex align-items-center">
                        <div className="me-2">
                          <InformationCircle
                            color={'#0d6efd'}
                            title={'Category'}
                            height="40px"
                            width="40px"
                          />
                        </div>
                        <div>
                          <h4 className="data-id"><strong>{stockcard === undefined || docId === undefined ?<></>:<>{stockcard[docId].id.substring(0,9)}</>}</strong></h4>
                        </div>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <EditProductModal
                            show={editShow}
                            onHide={() => setEditShow(false)}
                          />
                          <DeleteProductModal
                            show={modalShowDL}
                            onHide={() => setModalShowDL(false)}
                          />
                            <Button
                              className="add me-1"
                              data-title="Add New Product"
                              onClick={() => setModalShow(true)}>
                              <FontAwesomeIcon icon={faPlus} />
                            </Button>
                            <Button
                              className="edit me-1"
                              data-title="Edit Product Info"
                              onClick={() => { setEditingBarcode(false); setEditShow(true) }}
                            >
                              <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                            </Button>
                            <Button
                              className={productPurchases.length > 0 ? "delete disabled-conditionally me-1" : "delete me-1"}
                              data-title={productPurchases.length > 0 ? "Product part of transactions" : "Delete Product"}
                              disabled={productPurchases.length > 0 ? true : false}
                              onClick={() => { setModalShowDL(true) }}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </Button>

                          </div>
                        </div>
                      </div>
                      <div className="row py-1 data-specs m-0 d-flex" id="product-info">
                        <div className="col-3 py-3">
                          <div className="row m-0 p-0 d-flex justify-content-center flex-column">
                            {stockcard[docId].img == " " || stockcard[docId].img == "" || stockcard[docId].img === undefined ?
                              <div className="data-img mb-2 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f3f5f9' }}>
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                                  <img src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fproduct-image-placeholder.png?alt=media&token=c29c223b-c9a1-4b47-af4f-c57a76b3e6c2" style={{ height: '50%', width: 'auto !important' }} />
                                  <h6 className="text-center">No Image Uploaded</h6>
                                </div>
                              </div>
                              :
                              <div className="data-img mb-2 d-flex align-items-center justify-content-center">
                                <img key={stockcard[docId].img}src={stockcard[docId].img} style={{height: '100%', width: 'auto'}}/>
                              </div>
                            }
                            <a className="data-barcode" style={{height: "5em"}}>
                              <div className="data-barcode-edit-container">
                                <div className="data-barcode-edit align-items-center justify-content-center">
                                  <Button
                                    className=""
                                    data-title="Edit Barcode value"
                                    onClick={() => { setEditingBarcode(true); setEditShow(true) }}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Button>
                                </div>
                              </div>
                              <div>
                              {stockcard[docId].barcode == 0 || stockcard[docId].barcode === undefined ?
                                <Alert className="text-center" variant="warning" style={{ height: '5em', fontSize: '0.8em' }}>
                                  <FontAwesomeIcon icon={faTriangleExclamation} /><span> Barcode Not Set</span>
                                </Alert>
                                :
                                <Barcode
                                  className="barcode"
                                  format="EAN13"
                                  value={stockcard[docId].barcode}
                                />
                              }
                              </div>
                            </a>
                          </div>
                        </div>
                        <div className="col-9 py-3">
                          <div className="row mb-3">
                            <div className="col-12 px-1">
                              <div className="row m-0 p-0">
                                <a
                                  className="col-1 data-icon d-flex align-items-center justify-content-center"
                                  data-title="Product Description"
                                >
                                  <Cube
                                    color={'#000000'}
                                    height="25px"
                                    width="25px"
                                  />
                                </a>
                                <div className="col-11 data-label">
                                  {stockcard[docId].description}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-6 px-1">
                              <div className="row m-0 p-0">
                                <a
                                  className="col-2 data-icon d-flex align-items-center justify-content-center"
                                  data-title="Classification"
                                >
                                  <GitBranch
                                    color={'#00000'}
                                    height="25px"
                                    width="25px"
                                  />
                                </a>
                                <div className="col-10 data-label
                              key={productClassification}"
                                >
                                  {stockcard[docId].classification === undefined || stockcard[docId].classification == " " || stockcard[docId].classification == "" ?
                                    <div style={{ fontStyle: 'italic', opacity: '0.8' }}>Not set</div>
                                    :
                                    <>{stockcard[docId].classification}</>
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="col-6 px-1">
                              <div className="row m-0 p-0">
                                <a
                                  className="col-2 data-icon d-flex align-items-center justify-content-center"
                                  data-title="Product Category"
                                >
                                  <Grid
                                    color={'#00000'}
                                    height="25px"
                                    width="25px"
                                  />
                                </a>
                                <div className="col-10 data-label">
                                  {stockcard[docId].category}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-6 px-1">
                              <div className="row m-0 p-0">
                                <a
                                  className="col-2 data-icon d-flex align-items-center justify-content-center"
                                  data-title="Selling Price"
                                >
                                  <Pricetag
                                    color={'#000000'}
                                    height="25px"
                                    width="25px"
                                  />
                                </a>
                                <div className="col-10 data-label">
                                  &#8369; {(Math.round(stockcard[docId].p_price * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </div>
                              </div>
                            </div>
                            <div className="col-6 px-1">
                              <div className="row m-0 p-0">
                                <a
                                  className="col-2 data-icon d-flex align-items-center justify-content-center"
                                  data-title="Purchase Price"
                                >
                                  <Cart
                                    className="me-2"
                                    color={'#00000'}
                                    height="25px"
                                    width="25px"
                                  />
                                </a>
                                <div className="col-10 data-label">
                                  &#8369; {(Math.round(stockcard[docId].s_price * 100) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="row mb-3">
                            <div className="col-6 px-1">
                              <div className="row m-0 p-0">
                                <a
                                  className="col-3 data-icon d-flex align-items-center justify-content-center"
                                  data-title="Minimum Quantity"
                                >
                                  <CaretDown
                                    color={'#000000'}
                                    height="25px"
                                    width="25px"
                                  />
                                  <Layers
                                    color={'#000000'}
                                    height="25px"
                                    width="25px"
                                  />
                                </a>
                                <div className="col-9 data-label">
                                  {stockcard[docId].min_qty === undefined || stockcard[docId].min_qty == 0 ?
                                    <div style={{ fontStyle: 'italic', opacity: '0.8' }}>Not set</div>
                                    :
                                    <>{stockcard[docId].min_qty} units</>
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="col-6 px-1">
                              <div className="row m-0 p-0">
                                <a
                                  className="col-3 data-icon d-flex align-items-center justify-content-center"
                                  data-title="Maximum Quantity"
                                >
                                  <CaretUp
                                    color={'#000000'}
                                    height="25px"
                                    width="25px"
                                  />
                                  <Layers
                                    color={'#000000'}
                                    height="25px"
                                    width="25px"
                                  />
                                </a>
                                <div className="col-9 data-label">
                                  {stockcard[docId].max_qty === undefined || stockcard[docId].max_qty == 0 ?
                                    <div style={{ fontStyle: 'italic', opacity: '0.8' }}>Not set</div>
                                    :
                                    <>{stockcard[docId].max_qty} units</>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        <hr className="my-1" />
                        <div className="row mb-0" id="product-info-qty">
                          <div className="col-3 p-1 d-flex align-items-center justify-content-center">
                            <div className="row m-0 p-0">
                              <h5 style={{borderLeft: '8px solid #4973ff'}}>Stats:</h5>
                            </div>
                          </div>
                          <div className="col-3 p-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Total Quantity"
                              >
                                <Layers
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-9 data-label">
                                <strong>{stockcard[docId].qty} units</strong>
                              </div>
                            </div>
                          </div>
                          <div className="col-3 p-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Total Quantity In"
                              >
                                <Enter
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-9 data-label">
                                <strong>{totalPurchase} units</strong>
                              </div>
                            </div>
                          </div>
                          <div className="col-3 p-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Total Quantity Out"
                              >
                                <Exit
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-9 data-label">
                                <strong>{totalSales} units</strong>
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
                                Ledger
                              </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link eventKey={0}>
                                Lead Time
                                <a
                                  data-title="Lead time is the amount of days it takes for your supplier to fulfill your order"
                                  className="header-tooltip ms-1"
                                >

                                  <InformationCircle
                                    color={'#0d6efd'}
                                    height="20px"
                                    width="20px"
                                    style={{ verticalAlign: 'text-bottom' }}
                                  />
                                </a>
                              </Nav.Link>
                            </Nav.Item>
                          </Nav>
                          <Tab.Content>
                            <Tab.Pane eventKey={1}>
                              <div className="row data-specs-add m-0">
                                <div className='row m-0 p-0'>
                                  {filteredLedger === undefined ?
                                    <Spinner
                                      color1="#b0e4ff"
                                      color2="#fff"
                                      textColor="rgba(0,0,0, 0.5)"
                                      className="w-25 h-25"
                                    />
                                    :
                                    <DisplayLedger />
                                  }
                                </div>
                              </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey={0}>
                              <div className="row data-specs-add m-0">
                                <div className="row m-0 p-0">
                                  <DisplayPurchases />

                                </div>


                              </div>
                            </Tab.Pane>
                          </Tab.Content>
                        </Tab.Container>
                      </div>
                    </div>
                    </div>
                  </Tab.Pane>
                }
              </Tab.Content>
            </div>
          </div>
        </div>
      </Tab.Container >
    </div >
  );


}

export default StockcardPage;
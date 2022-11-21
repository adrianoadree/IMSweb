import RPersoneact from 'react';
import { Tab, Button, Card, ListGroup, Modal, Form, Alert, Nav, Table } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch, faPesoSign } from '@fortawesome/free-solid-svg-icons'
import { Person, Location, PhonePortrait, Layers, Mail, DocumentAttach, InformationCircle, Create, Calendar, CheckmarkDone } from 'react-ionicons'
import NewAdjustmentRecordModal from '../components/NewAdjustmentRecordModal';
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
import  ProductQuickView  from '../components/ProductQuickView';

import moment from "moment";




function InventoryAdjustment() {

  //---------------------VARIABLES---------------------
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [key, setKey] = useState('main');//Tab controller
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved
  
  const [adjustmentCollection, setAdjustmentCollection] = useState(); //purchase_record Collection

  const [stockcardCollection, setStockcardCollection] = useState([]); // stockcardCollection variable
  const [editShow, setEditShow] = useState(false); //display/ hide edit modal
  const [modalShow, setModalShow] = useState(false);//display/hide modal
  const [supplier, setSupplier] = useState(); //supplier Collection
  const [supplierDoc, setSupplierDoc] = useState([]); //supplier Doc
  const [docId, setDocId] = useState(); //document id variable
  const [collectionUpdateMethod, setCollectionUpdateMethod] = useState("add")

  const [productQuickViewModalShow, setProductQuickViewModalShow] = useState(false); //product quick view modal
  
  const [productToView, setProductToView] = useState(["IT0000001"])

  //---------------------FUNCTIONS---------------------


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  useEffect(() => {
    if (adjustmentCollection === undefined) {
      setIsFetched(false)
    }
    else {
      setIsFetched(true)
      if(adjustmentCollection.length > 0)
      {
        if(collectionUpdateMethod == "add")
        {
          setDocId(adjustmentCollection.length-1)
          setKey(adjustmentCollection[adjustmentCollection.length-1].id)
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
  }, [adjustmentCollection])

  useEffect(() => {
    //read sales_record collection
    if (userID === undefined) {

      const adjustmentCollectionRef = collection(db, "adjustment_record")
      const q = query(adjustmentCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setAdjustmentCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const adjustmentCollectionRef = collection(db, "adjustment_record")
      const q = query(adjustmentCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setAdjustmentCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
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
      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setStockcardCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])


  const handleDocChange = (doc) => {
    adjustmentCollection.map((adj, index)=>{
      if(adj.id == doc)
      {
        setDocId(index)
      }
    })
  }


  // ===================================== START OF SEARCH FUNCTION =====================================



  const [searchValue, setSearchValue] = useState('');    // the value of the search field 
  const [searchResult, setSearchResult] = useState();    // the search result


  useEffect(() => {
    setSearchResult(adjustmentCollection)
  }, [adjustmentCollection])

  const toMonth = (worded_month) => {
    if("January".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "01"
    }
    else if("February".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "02"
    }
    else if("March".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "03"
    }
    else if("April".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "04"
    }
    else if("May".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "05"
    }
    else if("June".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "06"
    }
    else if("July".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "07"
    }
    else if("August".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "08"
    }
    else if("September".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "09"
    }
    else if("October".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "10"
    }
    else if("November".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "11"
    }
    else if("December".toLowerCase().startsWith(worded_month.toLowerCase()))
    {
      return "12"
    }
    else
    {
      return worded_month
    }
  }
  
  const toDate = (keyword_in_date) => {
    var tempDate = keyword_in_date
    var tempDateAlpha = keyword_in_date.replace(/[^A-Za-z]/g, '')
    if(tempDate.includes("/"))
    {
      tempDate = tempDate.replaceAll("/", "-")
    }
    if(tempDate.includes(" "))
    {
      tempDate = tempDate.replaceAll(" ", "-")
    }
    if(tempDateAlpha.length > 0)
    {
      tempDate = tempDate.replace(tempDateAlpha, toMonth(tempDateAlpha))
      console.log("with alphabet")
      console.log(tempDateAlpha)
      console.log(tempDate)
    }
    return tempDate
  }
  
    const changeDateFormatToSearchable = (date) => {
      return date.substring(5, date.length) + "-" + date.substring(0, 4)
    }

  const filter = (e) => {
    const keyword = e.target.value;

    if (keyword !== '') {
      const results = adjustmentCollection.filter((adjustment) => {
        return adjustment.id.toLowerCase().startsWith(keyword.toLowerCase()) || changeDateFormatToSearchable(adjustment.date).toLowerCase().includes(toDate(keyword)) || adjustment.notes.toLowerCase().includes(keyword.toLowerCase())
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
        route='/inventoryadjustment'
      />
      <Navigation 
        page="/inventoryadjustment"
      />

      <NewAdjustmentRecordModal
        show={modalShow}
        onHide={() => setModalShow(false)}
      />
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
                        placeholder="AR00003, Jan-12/2020, Inventory Discrepancy"
                      />
                    </InputGroup>
                  </div>
                </Card.Header>
                <Card.Body style={{ height: "500px" }}>
                  <div className="row g-1 sidebar-header">
                    <div className="col-3 left-curve">
                      Doc ID
                    </div>
                    <div className="col-4">
                      Date
                    </div>
                    <div className="col-5 right-curve">
                      Notes
                    </div>
                  </div>
                  <div id='scrollbar' style={{ height: '400px' }}>
                    {isFetched ?
                      (
                        adjustmentCollection.length === 0 ?
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                            <h5 className="mb-3"><strong>No <span style={{ color: '#0d6efd' }}>adjustment record</span> to show.</strong></h5>
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
                              searchResult.map((adjustment_record) => (
                                <ListGroup.Item
                                  action
                                  key={adjustment_record.id}
                                  eventKey={adjustment_record.id}
                                  onClick={() => { handleDocChange(adjustment_record.id) }}
                                >
                                  <div className="row gx-0 sidebar-contents">
                                    <div className="col-3">
                                      {adjustment_record.id.substring(0, 7)}
                                    </div>
                                    <div className="col-4">
                                      {adjustment_record.date}
                                    </div>
                                    <div className="col-5">
                                      {adjustment_record.notes}
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              ))
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column"  style={{marginTop: '25%'}}>
                                <h5>
                                  <strong className="d-flex align-items-center justify-content-center flex-column">
                                    No adjustment record matched:
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
                <Tab.Pane eventKey='main'>
                  <div className="module-contents row py-1 m-0 placeholder-content">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Inventory Adjustment</h1>
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
                              <strong>AR00000</strong>
                            </h4>
                          </div>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <Button
                            className="add me-1"
                            data-title="Add New Adjustment Record"
                            onClick={() => setModalShow(true)}>
                            <FontAwesomeIcon icon={faPlus} />
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
                              <Calendar
                                color={'#00000'}
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
                              <CheckmarkDone
                                color={'#00000'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-11 data-label">
                                 
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                {(adjustmentCollection === undefined || adjustmentCollection.length == 0) || docId === undefined?
                  <></>
                :
                <Tab.Pane eventKey={adjustmentCollection[docId].id}>
                  <div className='row py-1 m-0' id="supplier-contents">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Inventory Adjustment</h1>
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
                              <strong>{adjustmentCollection[docId].id.substring(0, 7)}</strong>
                            </h4>
                          </div>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <Button
                            className="add me-1"
                            data-title="Add New Adjustment Record"
                            onClick={() => setModalShow(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="row p-1 m-0 data-specs d-flex align-items-center" id="supplier-info">
                      <div className="mb-3">
                        <div className="row m-0 mt-2">
                          <div className="col-6">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Date"
                              >
                              <Calendar
                                color={'#00000'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-10 data-label">
                                {moment(adjustmentCollection[docId].date).format("MMMM DD, YYYY")}
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Checker"
                              >
                              <CheckmarkDone
                                color={'#00000'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-10 data-label">
                                {adjustmentCollection[docId].checker}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row m-0 mt-2">
                          <div className="col-12">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-1 data-icon d-flex align-items-center justify-content-center"
                                data-title="Notes"
                              >
                              <DocumentAttach
                                color={'#00000'}
                                height="25px"
                                width="25px"
                              />
                              </a>
                              <div className="col-11 data-label">
                                    {adjustmentCollection[docId].notes == "" || adjustmentCollection[docId].notes === undefined || adjustmentCollection[docId].notes == " "?
                                      <div style={{fontStyle: 'italic', opacity: '0.8'}}>No notes recorded</div>
                                    :
                                      <>{adjustmentCollection[docId].notes}</>
                                    }
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row m-0 mt-2">
                          <div className="col-12">
                            <div className="row m-0 p-0 ps-2">
                              <div className="col-12 text-end p1">
                                <strong>Encoded by: {adjustmentCollection[docId].encoder}</strong>
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
                                Adjustment List
                              </Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                              <Nav.Link eventKey={0}>
                                Photo Proofs
                              </Nav.Link>
                            </Nav.Item>
                          </Nav>
                          <Tab.Content>
                            <Tab.Pane eventKey={0}>
                              <div className="row data-specs-add m-0">
                                <div className='row m-0 p-0'>
                                  {adjustmentCollection[docId].proofs.map((proof) => {
                                    return(
                                      <div className="col-12 w-100 h-100 m-0 pe-0">
                                        <img src={proof.url} style={{height: 'auto', width: '100%', objectFit: "contain"}}/>;
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey={1}>
                              <div className="row data-specs-add m-0">
                                <div className="row m-0 p-0">
                                  <Table striped bordered hover className="records-table scrollable-table" style={{paddingLeft: 0, paddingRight: 0}}>
                                        <thead>
                                          <tr>
                                            <th className='ic pth px-3'>Item Code</th>
                                            <th className="qc pth text-center">Quantity</th>
                                            <th className='dc pth text-center'>Description</th>
                                            <th className='pp pth text-center'>Purchase Price</th>
                                            <th className='ext pth text-center'>Extension</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          <ProductQuickView
                                            show={productQuickViewModalShow}
                                            onHide={() => setProductQuickViewModalShow(false)}
                                            productid={productToView}
                                          />
                                          {adjustmentCollection[docId].product_list.map((prod, index) => (

                                            <tr 
                                              key={index}
                                              className="clickable"
                                              onClick={()=>{setProductToView(prod.itemId); setProductQuickViewModalShow(true)}}
                                            >
                                              <td className='ic pt-entry px-3' key={prod.itemId}>
                                                {prod.itemId === undefined?
                                                  <></>
                                                :
                                                  <>
                                                      {prod.itemId.substring(0,9)}
                                                  </>
                                                }
                                              </td>
                                              <td className="qc pt-entry text-center" key={prod.itemQuantity}>
                                                {prod.itemQuantity}
                                              </td>
                                              <td className="dc pt-entry text-center" key={prod.itemName}>
                                                {prod.itemName}
                                              </td>
                                              <td className="pp pt-entry text-center" >
                                                <FontAwesomeIcon icon={faPesoSign} />
                                                {prod.itemPPrice}
                                              </td>
                                              <td className="ext pt-entry text-center" >
                                                <FontAwesomeIcon icon={faPesoSign} />
                                                {prod.itemPPrice * prod.itemQuantity}
                                              </td>
                                            </tr>
                                          ))
                                          }
                                        </tbody>
                                      </Table>
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
      </Tab.Container>
    </div>
  );
}

export default InventoryAdjustment;
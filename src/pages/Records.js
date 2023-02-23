
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';

import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, where, orderBy, updateDoc } from "firebase/firestore";

import { UserAuth } from '../context/AuthContext'
import UserRouter from '../pages/UserRouter'
import Tips from "../components/Tips";

import moment from "moment";

import { Modal, Tab, ListGroup, Card, Table, Button, Nav, FormControl, InputGroup } from "react-bootstrap";
import { faPlus, faPesoSign, faSearch, faBan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DocumentAttach, Calendar, InformationCircle, Person } from 'react-ionicons'
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from 'loading-animations-react';


import NewPurchaseModal from "../components/NewPurchaseModal";
import ProductQuickView  from '../components/ProductQuickView';



function Records() {

  //---------------------VARIABLES---------------------

  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [key, setKey] = useState("main");//Tab controller
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState(); //purchase_record Collection
  const [supplierCollection, setSupplierCollection] = useState(); //purchase_record Collection
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved
  const [docId, setDocId] = useState() // doc id variable
  const [list, setList] = useState([
    { productId: "productName1", productQuantity: 1 },
    { productId: "productName2", productQuantity: 2 },
  ]); // array of purchase_record list of prodNames
  const [productList, setProductList] = useState([]);
  const [queryList, setQueryList] = useState([]); //compound query access
  const [stockcardData, setStockcardData] = useState([{}]);

  const [showNewPurchaseModal, SetShowNewPurchaseModal] = useState(false); //add new sales record modal
  const [showProductQuickModal, setShowProductQuickViewModal] = useState(false); //product quick view modal
  const [showVoidRecordModal, setShowVoidRecordModal] = useState(false); //product quick view modal
  
  const [productToView, setProductToView] = useState(["IT0000001"])
  const [collectionUpdateMethod, setCollectionUpdateMethod] = useState("add")
  




  //---------------------FUNCTIONS---------------------

  useEffect(() => {
    console.log(key)
  })

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  //read Functions

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
    //read purchase_record collection
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

  useEffect(()=>{

  }, [collectionUpdateMethod])

  useEffect(() => {
    if (purchaseRecordCollection === undefined || supplierCollection === undefined) {
      setIsFetched(false)
    }
    else {
      setIsFetched(true)
      if(purchaseRecordCollection.length > 0)
      {
        if(collectionUpdateMethod == "add")
        {
          setDocId(0)
          setKey(purchaseRecordCollection[0].id)
        }
        else
        {
          setCollectionUpdateMethod("add")
        }
      }
    }
  }, [purchaseRecordCollection, supplierCollection])

  const handleDocChange = (doc) => {
    purchaseRecordCollection.map((purchase, index)=>{
      if(purchase.id == doc)
      {
        setDocId(index)
      }
    })
  }

  //-----------------------------------------------------------------------------

  useEffect(() => {
    //query stockcard document that contains, [queryList] datas
    async function queryStockcardData() {
      const stockcardRef = collection(db, "stockcard")
      if (queryList.length !== 0) {
        const q = await query(stockcardRef, where("__name__", "in", [...queryList]));
        const unsub = onSnapshot(q, (snapshot) =>
          setStockcardData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))),
        );
        return unsub;
      }
    }
    queryStockcardData();
  }, [queryList])  //queryList listener, rerenders when queryList changes

  //stores list.productId array to queryList
  useEffect(() => {
    const TempArr = [];
    list.map((name) => {
      TempArr.push(name.productId)
    })
    setQueryList(TempArr)
  }, [list])//list listener, rerenders when list value changes


  useEffect(() => {
    //read list of product names in product list
    if(docId === undefined || purchaseRecordCollection === undefined)
    {

    }
    else
    {
      setList(purchaseRecordCollection[docId].product_list)
    }
  }, [docId])

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
      return {supplier_name: ""}
    }
  }

  function VoidRecordModal(props) {
    const [voidNotes, setVoidNotes] = useState("");
    const [disallowVoiding, setDisallowVoiding] = useState(true);
    var curr = new Date();
    curr.setDate(curr.getDate());
    var today = moment(curr).format('YYYY-MM-DD')

    useEffect(() => {
      if(voidNotes == "" || voidNotes == " ")
      {
        setDisallowVoiding(true)
      }
      else
      {
        setDisallowVoiding(false)
      }
    })

    const voidToast = () => {
      toast.error("Voiding " + purchaseRecordCollection[docId].id.substring(0, 7), {
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

    const voidRecord = async() => {
      var productListItem = {}
      for(var i = 0; i < productList.length; i++)
      {
        var stockcardItem = {}
        productListItem = productList[i]
        await getDoc(doc(db, "stockcard", productList[i].itemId)).then(docSnap => {
          if (docSnap.exists()) {
            stockcardItem = docSnap.data()
          }
          else
          {
          
          }
        })
        updateDoc(doc(db, "stockcard", productListItem.itemId),{
          qty: Number(stockcardItem.qty - productListItem.itemQuantity) < 0?0:Number(stockcardItem.qty - productListItem.itemQuantity),
        })
      }

      updateDoc((doc(db, "purchase_record", purchaseRecordCollection[docId].id)),{
        isVoided: true,
        void_date: today,
        transaction_note: purchaseRecordCollection[docId].transaction_note + "; Voided for: " + voidNotes
      })

      voidToast()
      setVoidNotes("")
      props.onHide()
      setCollectionUpdateMethod("void")
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
                <h3 className="text-center">Voiding {purchaseRecordCollection[docId].id.substring(0,7)}</h3>
              </div>
              <div className="row m-0 p-0 mb-3">
                <div className="col-12 px-3 text-center">
                  <strong>
                    Are you sure you want to void
                    <br />
                    <span style={{color: '#b42525'}}>{purchaseRecordCollection[docId].id.substring(0,7)}?</span>
                  </strong>
                </div>
              </div>
              <div className="row m-0 p-0">
                <div className="col-12 px-3 d-flex justify-content-center">
                  <Table hover size="sm">
                    <tbody>
                      <tr>
                        <td>Date</td>
                        <td>{purchaseRecordCollection[docId].transaction_date}</td>
                      </tr>
                      <tr>
                        <td>Supplier</td>
                        <td>
                          {purchaseRecordCollection[docId].transaction_supplier.startsWith("SU")?
                            <>{getSupplierInfo(purchaseRecordCollection[docId].transaction_supplier).supplier_name}</>
                          :
                            <>{purchaseRecordCollection[docId].transaction_supplier}</>
                          }
                        </td>
                      </tr>
                      <tr>
                        <td>Notes</td>
                        <td>{purchaseRecordCollection[docId].transaction_note}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>
              <div className="row m-0 p-0">
                <div className="col-12 px-3">
                  <label>
                    Reason for voiding:
                    <span style={{color: '#b42525'}}> *</span>
                  </label>
                  <textarea
                    className="form-control shadow-none"
                    as="textarea"
                    rows={1}
                    onChange={(event) => { setVoidNotes(event.target.value); }}
                  />
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
              disabled={disallowVoiding}
              onClick={() => { voidRecord() }}
            >
              Void Product
            </Button>
          </Modal.Footer>
        </Modal>
    
    
      )
  }  
  
  // ===================================== START OF SEARCH FUNCTION =====================================


  const [searchValue, setSearchValue] = useState('');    // the value of the search field 
  const [searchResult, setSearchResult] = useState();    // the search result


  useEffect(() => {
    setSearchResult(purchaseRecordCollection)
  }, [purchaseRecordCollection])

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
      const results = purchaseRecordCollection.filter((purchaseRecordCollection) => {
        return purchaseRecordCollection.id.toLowerCase().includes(keyword.toLowerCase()) || changeDateFormatToSearchable(purchaseRecordCollection.transaction_date).toLowerCase().includes(toDate(keyword)) || purchaseRecordCollection.transaction_supplier.toLowerCase().includes(keyword.toLowerCase())
        // Use the toLowerCase() method to make it case-insensitive
      });
      setSearchResult(results);
    } else {
      setSearchResult(purchaseRecordCollection);
      // If the text field is empty, show all users
    }

    setSearchValue(keyword);
  };

  // ====================================== END OF SEARCH FUNCTION ======================================
  
  return (
    <div>
      <UserRouter
        route='/records'
      />
      <Tips
        page='/purchase'
      />
      <ProductQuickView
        show={showProductQuickModal}
        onHide={() => setShowProductQuickViewModal(false)}
        productid={productToView}
      />
      <Tab.Container
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
      <NewPurchaseModal
        show={showNewPurchaseModal}
        onHide={() => SetShowNewPurchaseModal(false)}
      />
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
                        className="shadow-none fc-search"
                        placeholder="PR00012, Cabral Merchandise, Jan-12/2020"
                        />
                    </InputGroup>
                  </div>
                </Card.Header>
                <Card.Body style={{ height: "500px" }}>
                  <div className="row g-1 sidebar-header">
                    <div className="col-3 left-curve">
                      Doc
                    </div>
                    <div className="col-5">
                      Supplier
                    </div>
                    <div className="col-4 right-curve">
                      Date
                    </div>
                  </div>
                  <div className='scrollbar' style={{ height: '400px' }}>
                  {isFetched?
                  <>
                    {purchaseRecordCollection.length === 0 ?
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                        <h5 className="mb-3"><strong>No <span style={{color: '#0d6efd'}}>purchase</span> records to show.</strong></h5>
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
                              searchResult.map((purch) => (
                                <ListGroup.Item
                                  action
                                  eventKey={purch.id}
                                  onClick={() => { handleDocChange(purch.id) }}
                                >
                                  <div className="row gx-0 sidebar-contents">
                                    <div className="col-3">
                                      <small>{purch.transaction_number}</small>
                                    </div>
                                    <div className="col-5">
                                    {purch.transaction_supplier.startsWith("SU")?
                                      <small>{getSupplierInfo(purch.transaction_supplier).supplier_name}</small>
                                    :
                                      <small>{purch.transaction_supplier}</small>
                                    }
                                    </div>
                                    <div className="col-4">
                                      <small>{moment(purch.transaction_date).format('ll')}</small>
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              ))
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column"  style={{marginTop: '25%'}}>
                                <h5>
                                  <strong className="d-flex align-items-center justify-content-center flex-column">
                                    No purchase record matched:
                                    <br />
                                    <span style={{color: '#0d6efd'}}>{searchValue}</span>
                                  </strong>
                                </h5>
                              </div>
                            )}

                          </ListGroup>
                      }
                    </>
                      :
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-5">
                        <div className="px-5 py-2 d-flex align-items-center justify-content-center flex-column">
                          <Spinner
                            color1="#b0e4ff"
                            color2="#fff"
                            textColor="rgba(0,0,0, 0.5)"
                            className="w-50 h-50"
                          />
                        </div>
                      </div>
                    }
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="divider"></div>
            <div className="data-contents">
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
                <Tab.Pane eventKey="main">
                  <div className="placeholder-content">
                    <Nav className="records-tab mb-3" fill variant="pills" defaultActiveKey="/records">
                      
                    <Nav.Item>
                        <Nav.Link as={Link} to="/salesrecord" >Sales History</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link as={Link} to="/records" active>Purchase History</Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <div className="row m-0">
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
                            <h4 className="data-id"><strong>PR00000</strong></h4>
                          </div>
                        </div>
                        <div className="col">
                          <div className="float-end">
                            <Button
                              className="add me-1"
                              data-title="Add New Purchase Record"
                              onClick={() => SetShowNewPurchaseModal(true)}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </Button>
                            <Button
                              disabled
                              className="delete me-1"
                              data-title="Void Purchase Record"
                            >
                              <FontAwesomeIcon icon={faBan} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="row p-1 data-specs m-0" id="record-info">
                        <div id="message-to-select">
                          <div className="blur-overlay">
                            <div className="d-flex align-items-center justify-content-center" style={{width: '100%', height: '100%'}}>
                              
                            </div>
                          </div>
                        </div>
                        <div className="mb-3">
                          <div className="row m-0 mt-2">
                            <div className="col-6">
                              <div className="row m-0 p-0">
                                <a 
                                  className="col-2 data-icon d-flex align-items-center justify-content-center"
                                  data-title="Transaction Date"
                                >
                                  <Calendar
                                    color={'#00000'}
                                    title={'Category'}
                                    height="25px"
                                    width="25px"
                                  />
                                </a>
                                <div className="col-10 data-label">

                                </div>
                              </div>
                            </div>
                            <div className="col-6">
                              <div className="row m-0 p-0">
                                <a 
                                  className="col-2 data-icon d-flex align-items-center justify-content-center"
                                  data-title="Transaction Date"
                                >
                                  <Person
                                    color={'#00000'}
                                    title={'Category'}
                                    height="25px"
                                    width="25px"
                                  />
                                </a>
                                <div className="col-10 data-label">

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
                        </div>
                        <table className="table-striped scrollable-table records-table "  cellSpacing={0}>
                          <thead>
                            <tr>
                              <th className='ic pth text-center'>Item Code</th>
                              <th className="qc pth text-center">Quantity</th>
                              <th className='dc pth text-center'>Description</th>
                              <th className='pp pth text-center'>Purchase Price</th>
                              <th className='ext pth text-center'>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {list.map((prod, index) => (
                              <tr key={index}>
                                <td className='ic pt-entry'>
                                </td>
                                <td className="qc pt-entry text-center">
                                </td>
                                <td className="dc pt-entry text-center">
                                </td>
                                <td className="pp pt-entry text-center">
                                </td>
                                <td className="ext pt-entry text-center" >
                                </td>
                              </tr>
                            ))
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                {purchaseRecordCollection === undefined || docId === undefined?
                  <></>
                :
                  <Tab.Pane eventKey={purchaseRecordCollection[docId].id}>
                    <div className={purchaseRecordCollection[docId].isVoided?"voided-record":""}>
                      <Nav className="records-tab mb-3" fill variant="pills" defaultActiveKey="/records">
                        <Nav.Item>
                          <Nav.Link as={Link} to="/salesrecord" >Sales History</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link as={Link} to="/records" active>Purchase History</Nav.Link>
                        </Nav.Item>
                      </Nav>
                      <div className="row m-0">
                        <div className="row py-1 m-0">
                          <div className="col-8 d-flex align-items-center">
                            <div className="me-2">
                              <InformationCircle
                                color={purchaseRecordCollection[docId].isVoided?"#aaaaaa":"#0d6efd"}
                                height="40px"
                                width="40px"
                              />
                            </div>
                            <div>
                              <h4 className="data-id">
                                <strong>{purchaseRecordCollection[docId].transaction_number}</strong>
                                {purchaseRecordCollection[docId].isVoided?
                                  <span className="ms-2 voided-text">Voided {purchaseRecordCollection[docId].void_date}</span>
                                :
                                  <></>
                                }
                              </h4>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="float-end">
                              <Button
                                className="add me-1"
                                data-title="Add New Purchase Record"
                                onClick={() => SetShowNewPurchaseModal(true)}
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </Button>
                              <VoidRecordModal
                                show={showVoidRecordModal}
                                onHide={() => setShowVoidRecordModal(false)}
                              />
                              <Button
                                className="delete me-1"
                                disabled={purchaseRecordCollection[docId].isVoided}
                                data-title="Void Purchase Record"
                                onClick={() => { setProductList(purchaseRecordCollection[docId].product_list); setShowVoidRecordModal(true) }}
                              >
                                <FontAwesomeIcon icon={faBan} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="row p-1 m-0 data-specs" id="record-info">
                          <div className="mb-3">
                            <div className="row m-0 mt-2">
                              <div className="col-6">
                                <div className="row m-0 p-0">
                                  <a 
                                    className="col-2 data-icon d-flex align-items-center justify-content-center"
                                    data-title="Transaction Date"
                                  >
                                    <Calendar
                                      color={'#00000'}
                                      title={'Category'}
                                      height="25px"
                                      width="25px"
                                    />
                                  </a>
                                  <div className="col-10 data-label">
                                    {moment(purchaseRecordCollection[docId].transaction_date).format('LL')}
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="row m-0 p-0">
                                  <a 
                                    className="col-2 data-icon d-flex align-items-center justify-content-center"
                                    data-title="Transaction Supplier"
                                  >
                                    <Person
                                      color={'#00000'}
                                      title={'Category'}
                                      height="25px"
                                      width="25px"
                                    />
                                  </a>
                                  <div className="col-10 data-label">
                                    {purchaseRecordCollection[docId].transaction_supplier.startsWith("SU")?
                                      <>{getSupplierInfo(purchaseRecordCollection[docId].transaction_supplier).supplier_name}</>
                                    :
                                      <>{purchaseRecordCollection[docId].transaction_supplier}</>
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
                                    data-title="Notes"
                                  >
                                    <DocumentAttach
                                      color={'#00000'}
                                      title={'Category'}
                                      height="25px"
                                      width="25px"
                                    />
                                  </a>
                                  <div className="col-11 data-label">
                                    {purchaseRecordCollection[docId].transaction_note == "" || purchaseRecordCollection[docId].transaction_note === undefined || purchaseRecordCollection[docId].transaction_note == " "?
                                      <div style={{fontStyle: 'italic', opacity: '0.8'}}>No notes recorded</div>
                                    :
                                      <>{purchaseRecordCollection[docId].transaction_note}</>
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="row m-0 mt-2">
                              <div className="col-12">
                                <div className="row m-0 p-0 ps-2">
                                  <div className="col-12 text-end p1">
                                    <strong>Issued by: {purchaseRecordCollection[docId].issuer}</strong>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <Table striped bordered hover className="records-table scrollable-table">
                            <thead>
                              <tr>
                                <th className='ic pth px-3'>Item Code</th>
                                <th className="qc pth text-center">Quantity</th>
                                <th className='dc pth text-center'>Description</th>
                                <th className='pp pth text-center'>Purchase Price</th>
                                <th className='ext pth text-center'>Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchaseRecordCollection[docId].product_list.map((prod, index) => (

                                <tr 
                                  key={index}
                                  className="clickable"
                                  onClick={()=>{setProductToView(prod.itemId); setShowProductQuickViewModal(true)}}
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
                    </div>
                  </Tab.Pane>
                }
              </Tab.Content>
            </div>
          </div>
        </div>
      </Tab.Container>
    </div >
  );
}
export default Records;

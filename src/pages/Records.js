import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy, updateDoc } from "firebase/firestore";
import { Modal, Tab, ListGroup, Card, Table, Button, Nav, FormControl, Alert } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan, faPesoSign, faSearch, faBan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Create, Calendar, Document, InformationCircle, Person } from 'react-ionicons'
import NewPurchaseModal from "../components/NewPurchaseModal";
import moment from "moment";
import { UserAuth } from '../context/AuthContext'
import  UserRouter  from '../pages/UserRouter'
import { Spinner } from 'loading-animations-react';
import  ProductQuickView  from '../components/ProductQuickView'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



function Records() {

  //---------------------VARIABLES---------------------

  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [key, setKey] = useState('main');//Tab controller
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved


  const [modalShow, setModalShow] = useState(false); //add new sales record modal
  const [modalShowPQV, setModalShowPQV] = useState(false); //product quick view modal
  const [modalShowVR, setModalShowVR] = useState(false); //product quick view modal
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState(); //purchase_record Collection
  const [purchaseRecord, setPurchaseRecord] = useState([]); //purchase_record spec doc
  const [docId, setDocId] = useState("PR10001") // doc id variable
  const [list, setList] = useState([
    { productId: "productName1", productQuantity: 1 },
    { productId: "productName2", productQuantity: 2 },
  ]); // array of purchase_record list of prodNames
  const [productList, setProductList] = useState([]);
  const [queryList, setQueryList] = useState([]); //compound query access
  const [stockcardData, setStockcardData] = useState([{}]);
  const [productToView, setProductToView] = useState(["IT0000001"])




  //---------------------FUNCTIONS---------------------

  useEffect(()=>{
  })

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  useEffect(()=>{
    if(purchaseRecordCollection === undefined) {
      setIsFetched(false)
    }
    else
    {
      setIsFetched(true)
    }
  }, [purchaseRecordCollection])

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
      const q = query(purchaseRecordCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;

    }


  }, [userID])


  useEffect(() => {
    //fetch purchase_record spec Document
    async function readPurchDoc() {
      const purchRecord = doc(db, "purchase_record", docId)
      const docSnap = await getDoc(purchRecord)
      if (docSnap.exists()) {
        setPurchaseRecord(docSnap.data());
      }
    }
    readPurchDoc();

  }, [docId])


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
    async function fetchPurchDoc() {
      const unsub = await onSnapshot(doc(db, "purchase_record", docId), (doc) => {
        if(doc.data() != undefined) {
          setList(doc.data().product_list);
        }
      });
      return unsub;
    }
    fetchPurchDoc()
  }, [docId])



  function VoidRecordModal(props) {
    
    const [voidNotes, setVoidNotes] = useState("");
    const [disallowVoiding, setDisallowVoiding] = useState(true);
    var today = new Date();
    var dd = today.getDate();

    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();
    if(dd<10) 
    {
        dd='0'+dd;
    } 

    if(mm<10) 
    {
        mm='0'+mm;
    }

    today = yyyy + '-' + mm + '-' + dd

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

    const checkIfOS = (cur_qty, rec_qty) => {
      if(cur_qty - rec_qty < 0)
      {
        return 0;
      }
      else
      {
        return cur_qty - rec_qty;
      }
    }

    const voidRecord = async() => {
      var productListItem
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
          qty: Number(checkIfOS(stockcardItem.qty, productListItem.itemQuantity)),
        })
      }

      updateDoc((doc(db, "purchase_record", docId)),{
        isVoided: true,
        void_date: today,
        transaction_note: purchaseRecord.transaction_note + "; Voided for: " + voidNotes
      })

      setVoidNotes("")
      props.onHide()
    }
    /*
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
    }*/
  
  
      return (
        <Modal
          {...props}
          size="md"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          className="IMS-modal warning"
        >
          <ToastContainer
            position="top-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <Modal.Body >
            <div className="px-3 py-2">
              <div className="module-header mb-4">
                <h3 className="text-center">Voiding {docId.substring(0,7)}</h3>
              </div>
              <div className="row m-0 p-0 mb-3">
                <div className="col-12 px-3 text-center">
                  <strong>
                    Are you sure you want to void
                    <br />
                    <span style={{color: '#b42525'}}>{docId.substring(0,7)}?</span>
                  </strong>
                </div>
              </div>
              <div className="row m-0 p-0">
                <div className="col-12 px-3 d-flex justify-content-center">
                  <Table size="sm">
                    <tbody>
                      <tr>
                        <td>Date</td>
                        <td>{purchaseRecord.transaction_date}</td>
                      </tr>
                      <tr>
                        <td>Supplier</td>
                        <td>{purchaseRecord.transaction_supplier}</td>
                      </tr>
                      <tr>
                        <td>Notes</td>
                        <td>{purchaseRecord.transaction_note}</td>
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
  

  return (
    <div>
      <UserRouter
      route='/records'
      />
      <Navigation 
        page='/purchase'
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
                      <ListGroup variant="flush">
                        {purchaseRecordCollection.map((purch) => {
                          return (
                            <ListGroup.Item
                              action
                              key={purch.id}
                              eventKey={purch.id}
                              onClick={() => { setDocId(purch.id) }}>
                              <div className="row gx-0 sidebar-contents">
                                <div className="col-3">
                                  <small>{purch.transaction_number}</small>
                                </div>
                                <div className="col-5">
                                  <small>{purch.transaction_supplier}</small>
                                </div>
                                <div className="col-4">
                                  <small>{moment(purch.transaction_date).format('ll')}</small>
                                </div>
                              </div>
                            </ListGroup.Item>
                          )
                        })}
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
            <div className="data-contents">
              <Tab.Content>
                <Tab.Pane eventKey="main">
                  <div className="">
                    <Nav className="records-tab mb-3" fill variant="pills" defaultActiveKey="/records">
                      <Nav.Item>
                        <Nav.Link as={Link} to="/records" active>Purchase History</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link as={Link} to="/salesrecord" >Sales History</Nav.Link>
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
                              onClick={() => setModalShow(true)}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </Button>
                            <Button
                              disabled
                              className="delete me-1"
                              data-title="Void Purchase Record"
                              onClick={() => { setModalShowVR(true) }}
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
                              <h5><strong>Select a transaction to get started</strong></h5>
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
                                  <Create
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
                        <Table striped bordered hover size="sm" className="records-table">
                          <thead>
                            <tr>
                              <th className='ic pth text-center'>Item Code</th>
                              <th className="qc pth text-center">Quantity</th>
                              <th className='dc pth text-center'>Description</th>
                              <th className='pp pth text-center'>Purchase Price</th>
                              <th className='ext pth text-center'>Extension</th>
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
                        </Table>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey={docId} id="determiner">
                  <div className={purchaseRecord.isVoided?"voided-record":""}>
                    <Nav className="records-tab mb-3" fill variant="pills" defaultActiveKey="/records">
                      <Nav.Item>
                        <Nav.Link as={Link} to="/records" active>Purchase History</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link as={Link} to="/salesrecord" >Sales History</Nav.Link>
                      </Nav.Item>
                    </Nav>
                    <div className="row m-0">
                      <div className="row py-1 m-0">
                        <div className="col-8 d-flex align-items-center">
                          <div className="me-2">
                            <InformationCircle
                              color={purchaseRecord.isVoided?"#b6291f":"#0d6efd"}
                              height="40px"
                              width="40px"
                            />
                          </div>
                          <div>
                            <h4 className="data-id">
                              <strong>{purchaseRecord.transaction_number}</strong>
                              {purchaseRecord.isVoided?
                                <span className="ms-2 voided-text">Voided {purchaseRecord.void_date}</span>
                              :
                                <></>
                              }
                            </h4>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="float-end">
                            <NewPurchaseModal
                              show={modalShow}
                              onHide={() => setModalShow(false)}
                            />
                            <Button
                              className="add me-1"
                              data-title="Add New Purchase Record"
                              onClick={() => setModalShow(true)}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </Button>
                            <VoidRecordModal
                              show={modalShowVR}
                              onHide={() => setModalShowVR(false)}
                            />
                            <Button
                              className="delete me-1"
                              disabled={purchaseRecord.isVoided}
                              data-title="Void Purchase Record"
                              onClick={() => { setProductList(purchaseRecord.product_list); setModalShowVR(true) }}
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
                                  {moment(purchaseRecord.transaction_date).format('LL')}
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
                                  {purchaseRecord.transaction_supplier}
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
                                  <Create
                                    color={'#00000'}
                                    title={'Category'}
                                    height="25px"
                                    width="25px"
                                  />
                                </a>
                                <div className="col-11 data-label">
                                  {purchaseRecord.transaction_note == "" || purchaseRecord.transaction_note === undefined || purchaseRecord.transaction_note == " "?
                                    <div style={{fontStyle: 'italic', opacity: '0.8'}}>No notes recorded</div>
                                  :
                                    <>{purchaseRecord.transaction_note}</>
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Table striped bordered hover size="sm" className={purchaseRecord.isVoided?"records-table voided-record":"records-table"}>
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
                              show={modalShowPQV}
                              onHide={() => setModalShowPQV(false)}
                              productid={productToView}
                            />
                            {list.map((prod, index) => (
                              
                              <tr key={index}>
                                <td className='ic pt-entry px-3' key={prod.itemId}>
                                {prod.itemId === undefined?
                                  <></>
                                :
                                  <>
                                    <button
                                      onClick={()=>{setProductToView(prod.itemId); setModalShowPQV(true)}}
                                    >
                                      {prod.itemId.substring(0,9)}
                                    </button>
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
              </Tab.Content>
            </div>
          </div>
        </div>
      </Tab.Container>
    </div >
  );
}

export default Records;

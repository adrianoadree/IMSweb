import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy, updateDoc } from "firebase/firestore";
import { Modal, Tab, ListGroup, Card, Table, Button, Nav, FormControl, Placeholder, InputGroup } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan, faPesoSign, faSearch, faBan} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Create, Calendar, Document, InformationCircle } from 'react-ionicons'
import moment from "moment";
import NewSalesModal from "../components/NewSalesModal";
import { UserAuth } from '../context/AuthContext'
import UserRouter from '../pages/UserRouter'
import { Spinner } from 'loading-animations-react';
import  ProductQuickView  from '../components/ProductQuickView'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";




function SalesRecords({ isAuth }) {

  //---------------------VARIABLES---------------------

  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [key, setKey] = useState('main');//Tab controller
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved

  const [modalShow, setModalShow] = useState(false); //add new sales record modal
  const [productQuickViewModalShow, setProductQuickViewModalShow] = useState(false); //product quick view modal
  const [modalShowVR, setModalShowVR] = useState(false); //product quick view modal
  const [salesRecordCollection, setSalesRecordCollection] = useState(); //sales_record Collection
  const [salesRecordDoc, setSalesRecordDoc] = useState([]); //sales_record Collection
  const [docId, setDocId] = useState() // doc id variable
  const [list, setList] = useState([
    { productId: "productName1", productQuantity: 1 },
    { productId: "productName2", productQuantity: 2 },
  ]); // array of purchase_record list of prodNames
  const [queryList, setQueryList] = useState([]); //compound query access
  const [productList, setProductList] = useState([]);
  const [stockcardData, setStockcardData] = useState([{}]);
  const [total, setTotal] = useState(0); //total amount
  const [productToView, setProductToView] = useState(["IT0000001"])
  const [collectionUpdateMethod, setCollectionUpdateMethod] = useState("add")



  //---------------------FUNCTIONS---------------------


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  useEffect(() => {
    if (salesRecordCollection === undefined) {
      setIsFetched(false)
    }
    else {
      setIsFetched(true)
      if(salesRecordCollection.length > 0)
      {
        if(collectionUpdateMethod == "add")
        {
          setDocId(0)
          setKey(salesRecordCollection[0].id)
        }
        else
        {
          setCollectionUpdateMethod("add")

      }
      }
      else
      {
        setKey("main")
      }
    }
  }, [salesRecordCollection])

  useEffect(() => {
    //read sales_record collection
    if (userID === undefined) {

      const collectionRef = collection(db, "sales_record")
      const q = query(collectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {

      const collectionRef = collection(db, "sales_record")
      const q = query(collectionRef, where("user", "==", userID), orderBy("transaction_number", "desc"));

      const unsub = onSnapshot(q, (snapshot) =>
        setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;

    }

  }, [userID])


  useEffect(() => {
    //read list of product names in product list
    async function fetchPurchDoc() {
      const unsub = await onSnapshot(doc(db, "sales_record", salesRecordCollection[docId].id), (doc) => {
        if (doc.data() != undefined) {
          setList(doc.data().product_list);
        }
      });
      return unsub;
    }
    fetchPurchDoc()
  }, [docId])

  const handleDocChange = (doc) => {
    salesRecordCollection.map((sale, index)=>{
      if(sale.id == doc)
      {
        setDocId(index)
      }
    })
  }


  //delete
  const deleteSalesRecord = async (id) => {
    const purchaseRecDoc = doc(db, "sales_record", id)
    const purchaseListRecDoc = doc(db, "sales_products", id)
    await deleteDoc(purchaseListRecDoc);
    await deleteDoc(purchaseRecDoc);
    setKey('main')
  }

  function VoidRecordModal(props) {
    
    const [voidNotes, setVoidNotes] = useState("");
    const [disallowVoiding, setDisallowVoiding] = useState(true);
    var curr = new Date();
    curr.setDate(curr.getDate());
    var today = moment(curr).format('YYYY-MM-DD')


    const voidToast = () => {
      toast.error(salesRecordCollection[docId].id.substring(0, 7) + ' voided', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

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
          qty: Number(stockcardItem.qty + productListItem.itemQuantity),
        })
      }

      updateDoc((doc(db, "sales_record", salesRecordCollection[docId].id)),{
        isVoided: true,
        void_date: today,
        transaction_note: salesRecordCollection[docId].transaction_note + "; Voided for: " + voidNotes
      })

      voidToast()
      setVoidNotes("")
      props.onHide()
      setCollectionUpdateMethod("void")
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
                <h3 className="text-center">Voiding {salesRecordCollection[docId].id.substring(0,7)}</h3>
              </div>
              <div className="row m-0 p-0 mb-3">
                <div className="col-12 px-3 text-center">
                  <strong>
                    Are you sure you want to void
                    <br />
                    <span style={{color: '#b42525'}}>{salesRecordCollection[docId].id.substring(0,7)}?</span>
                  </strong>
                </div>
              </div>
              <div className="row m-0 p-0">
                <div className="col-12 px-3 d-flex justify-content-center">
                  <Table size="sm">
                    <tbody>
                      <tr>
                        <td>Date</td>
                        <td>{salesRecordCollection[docId].transaction_date}</td>
                      </tr>
                      <tr>
                        <td>Notes</td>
                        <td>{salesRecordCollection[docId].transaction_note}</td>
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
   setSearchResult(salesRecordCollection)
 }, [salesRecordCollection])



 const filter = (e) => {
   const keyword = e.target.value;

   if (keyword !== '') {
     const results = salesRecordCollection.filter((salesRecordCollection) => {
       return salesRecordCollection.id.toLowerCase().startsWith(keyword.toLowerCase())
       // Use the toLowerCase() method to make it case-insensitive
     });
     setSearchResult(results);
   } else {
     setSearchResult(salesRecordCollection);
     // If the text field is empty, show all users
   }

   setSearchValue(keyword);
 };

 // ====================================== END OF SEARCH FUNCTION ======================================

  return (
    <div>
      <UserRouter
        route='/salesrecord'
      />
      <Navigation
        page='/sales'
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
                        placeholder="PR00012, Jan-12/2020"
                      />
                    </InputGroup>
                  </div>
                </Card.Header>
                <Card.Body style={{ height: "500px" }}>
                  <div className="row g-1 sidebar-header">
                    <div className="col-4 left-curve">
                      Doc
                    </div>
                    <div className="col-8 right-curve">
                      Date
                    </div>
                  </div>
                  <div id='scrollbar' style={{ height: '400px' }}>
                    {isFetched ?
                      (
                        salesRecordCollection.length === 0 ?
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                            <h5 className="mb-3"><strong>No <span style={{ color: '#0d6efd' }}>Record</span> to show.</strong></h5>
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
                              searchResult.map((sales) => (
                                <ListGroup.Item
                                  action
                                  key={sales.id}
                                  eventKey={sales.id}
                                  onClick={() => { handleDocChange(sales.id) }}
                                >
                                  <div className="row gx-0 sidebar-contents">
                                    <div className="col-4">
                                      <small>{sales.transaction_number}</small>
                                    </div>
                                    <div className="col-8">
                                      <small>{moment(sales.transaction_date).format('ll')}</small>
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              ))
                            ) : (
                              <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column"  style={{marginTop: '25%'}}>
                                <h5>
                                  <strong className="d-flex align-items-center justify-content-center flex-column">
                                    No sales record matched:
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
            <div className="data-contents">
              <Tab.Content>
                <Tab.Pane eventKey="main">
                  <div className="">
                    <Nav className="records-tab mb-3" fill variant="pills" defaultActiveKey="/salesrecord">
                      <Nav.Item>
                        <Nav.Link as={Link} to="/records">Purchase History</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link as={Link} to="/salesrecord" active>Sales History</Nav.Link>
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
                            <h4 className="data-id"><strong>SR00000</strong></h4>
                          </div>
                        </div>
                        <div className="col">
                          <div className="float-end">
                              <NewSalesModal
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
                            <Button
                              disabled
                              className="delete me-1"
                              data-title="Void Sales Record"
                              onClick={() => { deleteSalesRecord(docId) }}
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
                            <div className="col-12">
                              <div className="row m-0 p-0">
                                <a 
                                  className="col-1 data-icon d-flex align-items-center justify-content-center"
                                  data-title="Transaction Date"
                                >
                                  <Calendar
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
                        <Table striped className="records-table scrollable-table">
                          <thead>
                            <tr>
                              <th className='ic pth px-3'>Item Code</th>
                              <th className="qc pth text-center">Quantity</th>
                              <th className='dc pth text-center'>Description</th>
                              <th className='pp pth text-center'>Selling Price</th>
                              <th className='ext pth text-center'>Extension</th>
                            </tr>
                          </thead>
                          <tbody>

                          </tbody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                {salesRecordCollection === undefined || docId === undefined?
                  <></>
                :
                  <Tab.Pane eventKey={salesRecordCollection[docId].id}>
                    <div className={salesRecordCollection[docId].isVoided?"voided-record":""}>
                      <Nav className="records-tab mb-3" fill variant="pills" defaultActiveKey="/records">
                        <Nav.Item>
                          <Nav.Link as={Link} to="/records">Purchase History</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link as={Link} to="/salesrecord" active>Sales History</Nav.Link>
                        </Nav.Item>
                      </Nav>
                      <div className="row m-0">
                        <div className="row py-1 m-0">
                          <div className="col-8 d-flex align-items-center">
                            <div className="me-2">
                              <InformationCircle
                                color={salesRecordCollection[docId].isVoided?"#aaaaaa":"#0d6efd"}
                                height="40px"
                                width="40px"
                              />
                            </div>
                            <div>
                              <h4 className="data-id">
                                <strong>{salesRecordCollection[docId].transaction_number}</strong>
                                {salesRecordCollection[docId].isVoided?
                                  <span className="ms-2 voided-text">Voided {salesRecordCollection[docId].void_date}</span>
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
                                data-title="Add New Sales Record"
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
                                disabled={salesRecordCollection[docId].isVoided}
                                data-title="Void Sales Record"
                                onClick={() => { setProductList(salesRecordCollection[docId].product_list); setModalShowVR(true) }}
                              >
                                <FontAwesomeIcon icon={faBan} />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="row p-1 m-0 data-specs" id="record-info">
                          <div className="mb-3">
                            <div className="row m-0 mt-2">
                              <div className="col-12">
                                <div className="row m-0 p-0">
                                  <a 
                                    className="col-1 data-icon d-flex align-items-center justify-content-center"
                                    data-title="Transaction Date"
                                  >
                                    <Calendar
                                      color={'#00000'}
                                      title={'Category'}
                                      height="25px"
                                      width="25px"
                                    />
                                  </a>
                                  <div className="col-11 data-label">
                                    {moment(salesRecordCollection[docId].transaction_date).format('LL')}
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
                                    {salesRecordCollection[docId].transaction_note == "" || salesRecordCollection[docId].transaction_note === undefined || salesRecordCollection[docId].transaction_note == " "?
                                      <div style={{fontStyle: 'italic', opacity: '0.8'}}>No notes recorded</div>
                                    :
                                      <>{salesRecordCollection[docId].transaction_note}</>
                                    }
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
                                <th className='pp pth text-center'>Selling Price</th>
                                <th className='ext pth text-center'>Extension</th>
                              </tr>
                            </thead>
                            <tbody>
                              <ProductQuickView
                                show={productQuickViewModalShow}
                                onHide={() => setProductQuickViewModalShow(false)}
                                productid={productToView}
                              />
                              {list.map((sales, index) => (
                                <tr 
                                  key={index}
                                  className="clickable"
                                  onClick={()=>{setProductToView(sales.itemId); setProductQuickViewModalShow(true)}}
                                >
                                  <td className='ic pt-entry px-3' key={sales.itemId}>
                                    {sales.itemId === undefined ?
                                      <></>
                                    :
                                      <>{sales.itemId.substring(0, 9)}</>
                                    }
                                  </td>
                                  <td className="qc pt-entry text-center" key={sales.itemQuantity}>
                                    {sales.itemQuantity}
                                  </td>
                                  <td className="dc pt-entry text-center" key={sales.itemName}>
                                    {sales.itemName}
                                  </td>
                                  <td className="pp pt-entry text-center" >
                                    <FontAwesomeIcon icon={faPesoSign} />
                                    {sales.itemSPrice}
                                  </td>
                                  <td className="ext pt-entry text-center" >
                                    <FontAwesomeIcon icon={faPesoSign} />
                                    {sales.itemSPrice * sales.itemQuantity}
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

export default SalesRecords;

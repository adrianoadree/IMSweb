import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy } from "firebase/firestore";
import { Tab, ListGroup, Card, Table, Button, Nav, FormControl } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan, faPesoSign,faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Create, Calendar, Document, InformationCircle } from 'react-ionicons'
import NewPurchaseModal from "../components/NewPurchaseModal";
import moment from "moment";
import { UserAuth } from '../context/AuthContext'




function Records() {

  //---------------------VARIABLES---------------------

  const [modalShow, setModalShow] = useState(false); //add new sales record modal
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([]); //purchase_record Collection
  const [purchaseRecord, setPurchaseRecord] = useState([]); //purchase_record spec doc
  const [docId, setDocId] = useState("PR10001") // doc id variable
  const [list, setList] = useState([
    { productId: "productName1", productQuantity: 1 },
    { productId: "productName2", productQuantity: 2 },
  ]); // array of purchase_record list of prodNames
  const [queryList, setQueryList] = useState([]); //compound query access
  const [stockcardData, setStockcardData] = useState([{}]);
  const [total, setTotal] = useState(0); //total amount
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");


  //---------------------FUNCTIONS---------------------

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
    console.log("Updated query list: ", queryList)
  }, [queryList])  //queryList listener, rerenders when queryList changes


  useEffect(() => {
    console.log("stockcardData values: ", stockcardData)
  }, [stockcardData])  //queryList listener, rerenders when queryList changes

  useEffect(() => {
    console.log("list value: ", list)
  }, [list])  //queryList listener, rerenders when queryList changes

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
        setList(doc.data().productList);
      });
      return unsub;
    }
    fetchPurchDoc()
  }, [docId])


  //delete
  const deleteSalesRecord = async (id) => {
    const purchaseRecDoc = doc(db, "purchase_record", id)
    const purchaseListRecDoc = doc(db, "purchase_products", id)
    await deleteDoc(purchaseListRecDoc);
    await deleteDoc(purchaseRecDoc);
  }


  return (
    <div>
      <Navigation />
      <Tab.Container id="list-group-tabs-example" defaultActiveKey="main">
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
                  <div id='scrollbar'>
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
                                  {purch.document_number}
                                </div>
                                <div className="col-5">
                                  {purch.supplier}
                                </div>
                                <div className="col-4">
                                  {purch.document_date}
                                </div>
                              </div>
                          </ListGroup.Item>
                        )
                      })}
                    </ListGroup>
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
                  
                  
                  <div className="row py-1">
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
                      <h4 className="data-id">Document ID</h4>
                    </div>
                    <div className="col">
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
                        <Button
                          className="delete me-1"
                          data-title="Delete Purchase Record"
                          onClick={() => { deleteSalesRecord(docId) }}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="row py-1 data-specs" id="record-info">
                    <div className="mb-3">
                      <div className="row mt-2">
                        <div className="col-12">
                          <span className="data-icon lg">
                            <Calendar
                            className="me-2 pull-down"
                            color={'#00000'} 
                            title={'Category'}
                            height="25px"
                            width="25px"
                            />
                          </span>
                          <span className="data-label lg">
                            Document Date
                          </span>
                        </div>
                      </div>
                      <div className="row mt-2">
                        <div className="col-12">
                          <span className="data-icon lg">
                            <Create
                            className="me-2 pull-down"
                            color={'#00000'} 
                            title={'Category'}
                            height="25px"
                            width="25px"
                            />
                          </span>
                          <span className="data-label lg">
                            Document Note
                          </span>
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
              </Tab.Pane>
              <Tab.Pane eventKey={docId}>
                <div>
                  <Nav className="records-tab mb-3" fill variant="pills" defaultActiveKey="/records">
                    <Nav.Item>
                      <Nav.Link as={Link} to="/records" active>Purchase History</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/salesrecord" >Sales History</Nav.Link>
                    </Nav.Item>
                    
                  </Nav>
                  <div className="row py-1">
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
                      <h4 className="data-id">{purchaseRecord.document_number}</h4>
                    </div>
                    <div className="col">
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
                        <Button
                          className="delete me-1"
                          data-title="Delete Purchase Record"
                          onClick={() => { deleteSalesRecord(docId) }}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="row py-1 data-specs" id="record-info">
                    <div className="mb-3">
                    <div className="row mt-2">
                      <div className="col-12">
                        <span className="data-icon lg">
                          <Calendar
                            className="me-2 pull-down"
                            color={'#00000'} 
                            title={'Category'}
                            height="25px"
                            width="25px"
                          />
                        </span>
                        <span className="data-label lg">
                          {moment(purchaseRecord.document_date).format('LL')}
                        </span>
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-12">
                        <span className="data-icon lg">
                          <Create
                            className="me-2 pull-down"
                            color={'#00000'} 
                            title={'Category'}
                            height="25px"
                            width="25px"
                          />
                        </span>
                        <span className="data-label lg">
                            {purchaseRecord.document_note}
                        </span>
                      </div>
                    </div>
                    </div>
                    <Table striped bordered hover size="sm" className="records-table">
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
                        {list.map((prod, index) => (
                          <tr key={index}>
                            <td className='ic pt-entry px-3' key={prod.productId}>
                              {prod.productId}
                            </td>
                            <td className="qc pt-entry text-center" key={prod.productQuantity}>
                              {prod.productQuantity}
                            </td>
                            <td className="dc pt-entry text-center" key={stockcardData[prod.productId]?.description}>
                              {stockcardData[index]?.description}
                            </td>
                            <td className="pp pt-entry text-center" >
                              <FontAwesomeIcon icon={faPesoSign} />
                              {stockcardData[index]?.p_price}
                            </td>
                            <td className="ext pt-entry text-center" >
                              <FontAwesomeIcon icon={faPesoSign} />
                                {
                                  stockcardData[index]?.p_price * prod.productQuantity
                                }
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
            </div>
          </div>
        </div>
      </Tab.Container>
    </div >
  );
}

export default Records;

import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy } from "firebase/firestore";
<<<<<<< Updated upstream
import { Tab, ListGroup, Card, Table, Button, Nav } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan, faPesoSign } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NewSalesModal from "../components/NewSalesModal";
=======
import { Tab, ListGroup, Card, Table, Button, Nav, FormControl } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan, faPesoSign, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Create, Calendar, Document, InformationCircle } from 'react-ionicons'
import NewSalesModal from "../components/NewSalesModal";
import { UserAuth } from '../context/AuthContext'
>>>>>>> Stashed changes
import moment from "moment";


function SalesRecord() {

  //---------------------VARIABLES---------------------

  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [modalShow, setModalShow] = useState(false); //add new sales record modal
  const [salesRecordCollection, setSalesRecordCollection] = useState([]); //purchase_record Collection
  const [salesRecord, setSalesRecord] = useState([]); //purchase_record spec doc
  const [docId, setDocId] = useState("PR10001") // doc id variable
  const [list, setList] = useState([
    { productId: "productName1", productQuantity: 1 },
    { productId: "productName2", productQuantity: 2 },
  ]); // array of purchase_record list of prodNames
<<<<<<< Updated upstream
  const [queryList, setQueryList] = useState([]); //compound query access
  const [stockcardData, setStockcardData] = useState([{}]);
=======
>>>>>>> Stashed changes


  //---------------------FUNCTIONS---------------------

  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])




  //read sales_record collection
  useEffect(() => {

    if (userID === undefined) {

      const salesRecordCollectionRef = collection(db, "sales_record")
      const q = query(salesRecordCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const salesRecordCollectionRef = collection(db, "sales_record")
      const q = query(salesRecordCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }

  }, [userID])



  //read Functions
  useEffect(() => {

    //fetch purchase_record spec Document
    async function readPurchDoc() {
      const salesRecord = doc(db, "sales_record", docId)
      const docSnap = await getDoc(salesRecord)
      if (docSnap.exists()) {
        setSalesRecord(docSnap.data());
      }
    }
    readPurchDoc();

  }, [docId])

  //-----------------------------------------------------------------------------



  useEffect(() => {
<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
    //read list of product names in product list
    async function fetchSalesDoc() {
      const unsub = await onSnapshot(doc(db, "sales_record", docId), (doc) => {
        setList(doc.data().product_list);
      });
      return unsub;
    }
    fetchSalesDoc()
  }, [docId])




  //delete
  const deleteSalesRecord = async (id) => {
    const purchaseRecDoc = doc(db, "sales_record", id)
    await deleteDoc(purchaseRecDoc);
  }


<<<<<<< Updated upstream


=======
>>>>>>> Stashed changes
  return (
    <div>
      <Navigation />
      <Tab.Container id="list-group-tabs-example" defaultActiveKey="main">
<<<<<<< Updated upstream
        <div className="row bg-light">
          <div className="col-3 p-5">
            <Card className="shadow">
              <Card.Header
                className="bg-primary text-white"
              >
                <div className="row">
                  <div className="col-9 pt-2">
                    <h6>Transaction List</h6>
                  </div>
                  <div className="col-3">
                    <Button
                      variant="outline-light"
                      onClick={() => setModalShow(true)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                    <NewSalesModal
                      show={modalShow}
                      onHide={() => setModalShow(false)}
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Body style={{ height: "550px" }} id='scrollbar'>
                <ListGroup
                  variant="flush"
                >
                  {purchaseRecordCollection.map((purch) => {
                    return (
                      <ListGroup.Item
                        action
                        key={purch.id}
                        eventKey={purch.id}
                        onClick={() => { setDocId(purch.id) }}>
                        <div className="row">
                          <div className="col-9">
                            <small><strong>Doc No: {purch.document_number}</strong></small><br />
                            <small>Date: {purch.document_date}</small><br />
                          </div>
                          <div className="col-3">

                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>

              </Card.Body>
            </Card>

          </div>
          <div className="col-9 p-5">
            <Tab.Content>
              <Tab.Pane eventKey="main">
                <div>
                  <Nav className="shadow" fill variant="pills" defaultActiveKey="/salesrecord">
                    <   Nav.Item>
                      <Nav.Link as={Link} to="/records">Purchase History</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/salesrecord" active >Sales History</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <span><br></br></span>
                  <div className="row px-5 py-3 bg-white shadow">
                    <div className="row pt-4 px-2 bg-white">
                      <small> <FontAwesomeIcon icon={faFile} /> Document Number: </small>
                      <small> <FontAwesomeIcon icon={faCalendarDay} /> Date: </small>
                      <small> <FontAwesomeIcon icon={faNoteSticky} /> Note: </small>

                    </div>

                    <span><br /></span>
                    <Table striped bordered hover size="sm">
                      <thead className='bg-primary'>
                        <tr>
                          <th className='px-3'>Item Code</th>
                          <th className="text-center">Quantity</th>
                          <th className='text-center'>Description</th>
                          <th className='text-center'>Selling Price</th>
                          <th className='text-center'>Extension</th>
                        </tr>
                      </thead>
                      <tbody style={{ height: "300px" }}>

                      </tbody>
                    </Table>


                  </div>


                </div>
              </Tab.Pane>

              <Tab.Pane eventKey={docId}>
                <div>
                  <Nav className="shadow" fill variant="pills" defaultActiveKey="/salesrecord">
                    <   Nav.Item>
                      <Nav.Link as={Link} to="/records" >Purchase History</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/salesrecord" active>Sales History</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <span><br></br></span>

                  <div className="row px-5 py-3 bg-white shadow">
                    <div className="row pt-4 px-2 bg-white">
                      <div className="col-9">
                        <small> <FontAwesomeIcon icon={faFile} /> Document Number: <strong>{purchaseRecord.document_number}</strong></small><br />
                        <small> <FontAwesomeIcon icon={faCalendarDay} /> Date: <strong>{moment(purchaseRecord.document_date).format('LL')}</strong></small><br />
                        <small> <FontAwesomeIcon icon={faNoteSticky} /> Note: <strong>{purchaseRecord.document_note}</strong></small><br />
                      </div>
                      <div className="col-3">
                        <Button
                          size="md"
                          variant="outline-danger"
                          onClick={() => { deleteSalesRecord(docId) }}
                        >
                          Delete Record <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
=======
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
                    <div className="col-4 left-curve">
                      Doc
                    </div>
                    <div className="col-8 right-curve">
                      Date
                    </div>
                  </div>
                  <div id='scrollbar'>
                    <ListGroup variant="flush">
                      {salesRecordCollection.map((sales) => {
                        return (
                          <ListGroup.Item
                            action
                            key={sales.id}
                            eventKey={sales.id}
                            onClick={() => { setDocId(sales.id) }}>
                            <div className="row gx-0 sidebar-contents">
                              <div className="col-4">
                                <small>{sales.transaction_number}</small>
                              </div>
                              <div className="col-8">
                                <small>{moment(sales.transaction_date).format('ll')}</small>
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
                              data-title="Delete Purchase Record"
                              onClick={() => { deleteSalesRecord(docId) }}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="row p-1 data-specs m-0" id="record-info">
                        <div className="mb-3">
                          <div className="row m-0 mt-2">
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
                          <div className="row m-0 mt-2">
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
                              <th className='ic pth px-3'>Item Code</th>
                              <th className="qc pth text-center">Quantity</th>
                              <th className='dc pth text-center'>Description</th>
                              <th className='pp pth text-center'>Selling Price</th>
                              <th className='ext pth text-center'>Extension</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className='ic pt-entry px-3'>
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
                          </tbody>
                        </Table>
>>>>>>> Stashed changes
                      </div>

                    </div>
<<<<<<< Updated upstream


                    <span><br /></span>
                    <div style={{ height: "400px" }}>
                      <Table striped bordered hover size="sm">
                        <thead className='bg-primary'>
                          <tr>
                            <th className='px-3'>Item Code</th>
                            <th className="text-center">Quantity</th>
                            <th className='text-center'>Description</th>
                            <th className='text-center'>Selling Price</th>
                            <th className='text-center'>Extension</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((prod, index) => (
                            <tr key={index}>
                              <td className='px-3' key={prod.productId}>
                                {prod.productId}
                              </td>

                              <td className="text-center" key={prod.productQuantity}>
                                {prod.productQuantity}
                              </td>

                              <td className="text-center" key={stockcardData[index]?.description}>
                                {stockcardData[index]?.description}
                              </td>

                              <td className="text-center" >
                                <FontAwesomeIcon icon={faPesoSign} />
                                {stockcardData[index]?.s_price}
                              </td>
                              <td className="text-center" >
                                <FontAwesomeIcon icon={faPesoSign} />
                                {prod.productQuantity * stockcardData[index]?.s_price}
                              </td>
                            </tr>
                          ))
                          }
                        </tbody>



                      </Table>
=======
                  </div>
                </Tab.Pane>
                <Tab.Pane eventKey={docId}>
                  <div>
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
                          <h4 className="data-id">{salesRecord.document_number}</h4>
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
                              className="delete me-1"
                              data-title="Delete Purchase Record"
                              onClick={() => { deleteSalesRecord(docId) }}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="row p-1 m-0 data-specs" id="record-info">
                        <div className="mb-3">
                          <div className="row m-0 mt-2">
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
                                {moment(salesRecord.document_date).format('LL')}
                              </span>
                            </div>
                          </div>
                          <div className="row m-0 mt-2">
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
                                {salesRecord.document_note}
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
                              <th className='pp pth text-center'>Selling Price</th>
                              <th className='ext pth text-center'>Extension</th>
                            </tr>
                          </thead>
                          <tbody>
                            {list.map((sales, index) => (
                              <tr key={index}>
                                <td className='ic pt-entry px-3'>
                                  {sales.itemId}
                                </td>
                                <td className="qc pt-entry text-center">
                                  {sales.itemQuantity}

                                </td>
                                <td className="dc pt-entry text-center">
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
>>>>>>> Stashed changes
                    </div>

                  </div>
<<<<<<< Updated upstream


                </div>
              </Tab.Pane>
            </Tab.Content>
=======
                </Tab.Pane>
              </Tab.Content>
            </div>
>>>>>>> Stashed changes
          </div>




        </div>


      </Tab.Container>

    </div >

  );



}

export default SalesRecord;
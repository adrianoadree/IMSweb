import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where } from "firebase/firestore";
import { Tab, ListGroup, Card, Table, Button, Nav } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan, faTemperatureArrowDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NewPurchaseModal from "../components/NewPurchaseModal";
import moment from "moment";




function Records({ isAuth }) {

  //---------------------VARIABLES---------------------

  const [modalShow, setModalShow] = useState(false); //add new sales record modal
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([]); //purchase_record Collection
  const [purchaseRecord, setPurchaseRecord] = useState([]); //purchase_record spec doc
  const [docId, setDocId] = useState("PR10001") // doc id variable
  const [list, setList] = useState([]); // array of purchase_record list of prodNames
  const [queryList, setQueryList] = useState([]); //compound query access
  const [listner, setListner] = useState(0); 


  //---------------------FUNCTIONS---------------------

  //read Functions
  useEffect(() => {
    //read purchase_record collection
    function readPurchRecCol() {
      const purchaseRecordCollectionRef = collection(db, "purchase_record")
      const q = query(purchaseRecordCollectionRef);

      const unsub = onSnapshot(q, (snapshot) =>
        setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }

    //fetch purchase_record spec Document
    async function readPurchDoc() {

      const salesRecord = doc(db, "purchase_record", docId)
      const docSnap = await getDoc(salesRecord)
      if (docSnap.exists()) {
        setPurchaseRecord(docSnap.data());
      }
    }



    readPurchRecCol();
    readPurchDoc();

  }, [docId])


  
    useEffect(() => {
      //read list of product names in product list
      function fetchPurchDoc() {
        const unsub = onSnapshot(doc(db, "purchase_record", docId), (doc) => {
          setList(doc.data().productList);
          const TempArr = [];
          list.map((name) => {
            TempArr.push(name.productName)
          })
          setQueryList(TempArr)
          console.log(queryList)
          
        });
        return unsub;
      }
      fetchPurchDoc() 
    }, [docId])
  
  /*
  //query selected id
  useEffect(() => {

    async function xxx() {
      const stockcardRef = collection(db, "stockcard")


      if (queryList.length < 0) {
        const q = await query(stockcardRef, where("description", "in", [...queryList]));
        const unsub = onSnapshot(q, (snapshot) =>
          setStockcardData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))),
          console.log(stockcardData)
        );
        return unsub;
      }


    }
    xxx();
  }, [queryList])
*/







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
        <div className="row bg-light">
          <div className="col-3 p-5">
            <Card>
              <Card.Header
                className="bg-primary text-white"
              >
                <div className="row">
                  <div className="col-9 pt-2">
                    <h6>Transaction List</h6>
                  </div>
                  <div className="col-3">
                    <Button onClick={() => setModalShow(true)}><FontAwesomeIcon icon={faPlus} /></Button>
                    <NewPurchaseModal
                      show={modalShow}
                      onHide={() => setModalShow(false)}
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Body style={{ height: "550px" }}>
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
                  <Nav className="shadow" fill variant="pills" defaultActiveKey="/records">
                    <   Nav.Item>
                      <Nav.Link as={Link} to="/records" active>Purchase History</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/salesrecord" >Sales History</Nav.Link>
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
                          <th className='px-3'>Item Name</th>
                          <th className='px-3'>Quantity</th>
                          <th className='px-3'>Price</th>
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
                  <Nav className="shadow" fill variant="pills" defaultActiveKey="/records">
                    <   Nav.Item>
                      <Nav.Link as={Link} to="/records" active>Purchase History</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link as={Link} to="/salesrecord" >Sales History</Nav.Link>
                    </Nav.Item>
                  </Nav>
                  <span><br></br></span>

                  <div className="row px-5 py-3 bg-white shadow">
                    <div className="row pt-4 px-2 bg-white">
                      <div className="col-11">
                        <small> <FontAwesomeIcon icon={faFile} /> Document Number: <strong>{purchaseRecord.document_number}</strong></small><br />
                        <small> <FontAwesomeIcon icon={faCalendarDay} /> Date: <strong>{moment(purchaseRecord.document_date).format('LL')}</strong></small><br />
                        <small> <FontAwesomeIcon icon={faNoteSticky} /> Note: <strong>{purchaseRecord.document_note}</strong></small><br />
                      </div>
                      <div className="col-1">
                        <Button
                          size="lg"
                          variant="outline-danger"
                          onClick={() => { deleteSalesRecord(docId) }}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </Button>
                      </div>

                    </div>


                    <span><br /></span>
                    <div style={{ height: "400px" }}>
                      <Table striped bordered hover size="sm">
                        <thead className='bg-primary'>
                          <tr>
                            <th className='px-3'>Item Name</th>
                            <th className='px-3'>Quantity</th>
                            <th className='px-3'>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((product, index) => (
                            <tr key={index}>
                              <td key={product.productName}>{product.productName} </td>
                              <td key={product.productQuantity}>{product.productQuantity}</td>
                              <td></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                  </div>


                </div>
              </Tab.Pane>
            </Tab.Content>
          </div>




        </div>


      </Tab.Container>

    </div >

  );


}

export default Records;
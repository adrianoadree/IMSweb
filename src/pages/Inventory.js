import React from 'react';
import { Tab, Table, Button, Card, ListGroup, Modal } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { getDocs, collection, doc, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPenToSquare, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import NewProductModal from '../components/NewProductModal';




function Inventory({ isAuth }) {

  const [modalShow, setModalShow] = React.useState(false);
  const [stockcard, setStockcard] = useState([]);
  const stockcardCollectionRef = collection(db, "stockcard")
  const [prodId, setProdId] = useState("xx");
  const stockcardDocRef = doc(db, "stockcard", prodId)
  const [prodName, setProdName] = useState("");
  const [prodSupplier, setProdSupplier] = useState("");
  const [prodQuantity, setProdQuantity] = useState(0);
  const [prodPurchPrice, setProdPurchPrice] = useState(0);
  const [prodSalesPrice, setProdSalesPrice] = useState(0);



  //access document from a collection
  onSnapshot(stockcardDocRef, (doc) => {
    setProdSupplier(doc.data().product_supplier)
    setProdName(doc.data().product_name)
    setProdQuantity(doc.data().quantity)
    setProdPurchPrice(doc.data().selling_price)
    setProdSalesPrice(doc.data().purchase_price)


  }, [])



  //Read collection from database
  useEffect(() => {
    const getStockcard = async () => {
      const data = await getDocs(stockcardCollectionRef);
      setStockcard(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };
    getStockcard()
  }, [])


  //delete row 
  const deleteStockcard = async (id) => {
    const stockcardDoc = doc(db, "stockcard", id)
    await deleteDoc(stockcardDoc);
    alert('Item Removed from the Database')

  }



  return (
    <div className="row bg-light">
      <Navigation />

      <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
        <div className="row bg-light">

          <div className='col-3 p-5'>

            <Card className='shadow'>
              <Card.Header className='bg-primary'>
                <div className='row'>
                  <div className='col-9 pt-2 text-white'>
                    <h6>Product List</h6>
                  </div>
                  <div className='col-3'>
                    <Button variant="primary"
                      onClick={() => setModalShow(true)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                    <NewProductModal
                      show={modalShow}
                      onHide={() => setModalShow(false)}
                    />
                  </div>
                </div>
              </Card.Header>
              <Card.Body style={{ height: "500px" }}>
                <ListGroup variant="flush">
                  {stockcard.map((stockcard) => {
                    return (
                      <ListGroup.Item action eventKey={stockcard.id} onClick={() => { setProdId(stockcard.id) }}>
                        <div className='row'>
                          <div className="col-9 pt-1">
                            <small>{stockcard.product_name}</small>
                          </div>
                          <div className='col-3'>
                            <Button
                              className="text-dark"
                              variant="outline-light"
                              size="sm"

                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </Button>
                          </div>
                        </div>

                      </ListGroup.Item>
                    )
                  })}

                </ListGroup>
              </Card.Body>
            </Card>
          </div>


          <div className='col-9 p-5'>

            <Tab.Content>
              <Tab.Pane eventKey={0}>
                <div className='row px-5'>
                  <div className='row bg-white shadow'>
                    <h1 className='text-center py-3 p1'>Inventory</h1>
                  </div>

                  <div className='row'>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          Product Name:
                        </Card.Header>
                        <Card.Body>
                          <small>Supplier Name: </small><br />
                          <small>Available Stock:</small><br />
                          <small>Purchase Price:</small><br />
                          <small>Selling Price:</small><br />
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          Barcode
                        </Card.Header>
                        <Card.Body>
                          <div className='bg-secondary' style={{ height: "50px" }}></div>



                        </Card.Body>
                        <Card.Footer className='bg-white'>
                          <Button size='sm'>
                            Generate Barcode
                          </Button>
                        </Card.Footer>
                      </Card>
                    </div>
                  </div>

                </div>
              </Tab.Pane>

              <Tab.Pane eventKey={prodId}>
                <div className='row px-5'>
                  <div className='row bg-white shadow'>
                    <h1 className='text-center py-3 p1'>Inventory</h1>
                  </div>

                  <div className='row'>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          <div className='row'>
                            <div className='col-10'>
                              Product Name: <strong>{prodName}</strong>
                            </div>
                            <div className='col-2'></div>
                          </div>
                        </Card.Header>
                        <Card.Body>


                          <small><span className="text-muted">Supplier Name: </span>{prodSupplier}</small><br />
                          <small><span className="text-muted">Available Stock: </span>{prodQuantity}</small><br />
                          <small><span className="text-muted">Purchase Price: </span>{prodPurchPrice}</small><br />
                          <small><span className="text-muted">Selling Price: </span>{prodSalesPrice}</small><br />






                          <br />
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          Barcode
                        </Card.Header>
                        <Card.Body>
                          <div className='bg-secondary' style={{ height: "50px" }}></div>



                        </Card.Body>
                        <Card.Footer className='bg-white'>
                          <Button size='sm'>
                            Generate Barcode
                          </Button>
                        </Card.Footer>
                      </Card>
                    </div>
                  </div>

                </div>
              </Tab.Pane>
            </Tab.Content>
          </div>
        </div>
      </Tab.Container>






    </div>
  );

}
export default Inventory;
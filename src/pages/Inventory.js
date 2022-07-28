import React from 'react';
import { Tab, Button, Card, ListGroup } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark,faPlus } from '@fortawesome/free-solid-svg-icons'
import NewProductModal from '../components/NewProductModal';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query

} from 'firebase/firestore';
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";




function Inventory({ isAuth }) {

  const [modalShow, setModalShow] = useState(false);
  const [stockcard, setStockcard] = useState([]);
  const [prodId, setProdId] = useState("xx");
  const stockcardDocRef = doc(db, "stockcard", prodId)
  const [prodName, setProdName] = useState("");
  const [prodSupplier, setProdSupplier] = useState("");
  const [prodQuantity, setProdQuantity] = useState(0);
  const [prodPurchPrice, setProdPurchPrice] = useState(0);
  const [prodSalesPrice, setProdSalesPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState("");
  const [prodImg, setProdImg] = useState("");
  const [prodId4D, setProdId4D] = useState("");
  let navigate = useNavigate();


  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, []);

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


  //access document from a collection
  onSnapshot(stockcardDocRef, (doc) => {
    setProdId4D(doc.id)
    setProdName(doc.data().description)
    setProdQuantity(doc.data().quantity)
    setProdPurchPrice(doc.data().s_price)
    setProdSalesPrice(doc.data().p_price)
    setProdCategory(doc.data().category)
    setProfImg(doc.data().img)
  }, [])


  //Read stock card collection from database
  useEffect(() => {
    const collectionRef = collection(db, "stockcard");
    const q = query(collectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );

    return unsub;

  }, [])


  //delete row 
  const deleteStockcard = async (id) => {
    const stockcardDoc = doc(db, "stockcard", id)
    deleteToast();
    await deleteDoc(stockcardDoc);
  }

  return (
    <div className="row bg-light">
      <Navigation />


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
              <Card.Body style={{ height: "500px"}} id='scrollbar'>
                <ListGroup variant="flush">
                  {stockcard.map((stockcard) => {
                    return (
                      <ListGroup.Item
                        action
                        key={stockcard.id}
                        eventKey={stockcard.id}
                        onClick={() => { setProdId(stockcard.id) }}>
                        <div className='row'>
                          <div className="col-9 pt-1">
                            <small>{stockcard.description}</small>
                          </div>
                          <div className='col-3'>
                            <Button
                              className="text-dark"
                              variant="outline-light"
                              size="sm"
                              onClick={() => { deleteStockcard(stockcard.id) }}
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
                    <h1 className='text-center pt-4 p1'>Inventory</h1>
                    <hr />
                  </div>

                  <div className='row'>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          StockCard
                        </Card.Header>
                        <Card.Img variant="top" src="" />
                        <Card.Body>
                        <small>Product ID: </small><br />
                          <small>Product Name: </small><br />
                          <small>Category:</small><br />
                          <small>Available Stock:</small><br />
                          <small>Purchase :</small><br />
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

                  <div className='row'>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          Forecasting Data Card
                        </Card.Header>
                        <Card.Body>
                          <small>Supplier Name: </small><br />
                          <small>Supplier Lead time: </small><br />
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          Warehousing Card
                        </Card.Header>
                        <Card.Body>
                          <small>Warehouse Name: </small><br />
                          <small>Warehouse Location: </small><br />
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey={prodId}>
                <div className='row px-5'>
                  <div className='row bg-white shadow'>
                    <h1 className='text-center pt-4 p1'>Inventory</h1>
                    <hr />
                  </div>

                  <div className='row'>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          StockCard
                        </Card.Header>
                        <Card.Img variant="top" src="{prodImg}" />
                        <Card.Body>
                          <small>Product ID: <strong className='mx-2'>{prodId4D}</strong></small><br />
                          <small>Product Name: <strong className='mx-2'>{prodName}</strong></small><br />
                          <small>Category: <span className='mx-2'>{prodCategory}</span></small><br />
                          <small>Available Stock: <span className='mx-2'>{prodQuantity}</span></small><br />
                          <small>Purchase Price: <span className='mx-2'>{prodPurchPrice}</span></small><br />
                          <small>Selling Price: <span className='mx-2'>{prodSalesPrice}</span></small><br />
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

                  <div className='row'>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          Forecasting Data Card
                        </Card.Header>
                        <Card.Body>
                          <small>Supplier Name: <strong className='mx-2'>{prodSupplier}</strong></small><br />
                          <small>Supplier Lead time: </small><br />
                        </Card.Body>
                      </Card>
                    </div>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          Warehousing Card
                        </Card.Header>
                        <Card.Body>
                          <small>Warehouse Name: </small><br />
                          <small>Warehouse Location: </small><br />
                        </Card.Body>
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

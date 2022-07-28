import React from 'react';
import { Tab, Button, Card, ListGroup } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import NewProductModal from '../components/NewProductModal';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  getDoc

} from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";




function Inventory({ isAuth }) {

  //---------------------VARIABLES---------------------

  const [modalShow, setModalShow] = useState(false); //show/hide modal
  const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
  const [docId, setDocId] = useState("xx"); //document Id
  const [stockcardDoc, setStockcardDoc] = useState([]); //stockcard Document variable

  let navigate = useNavigate();

  //---------------------FUNCTIONS---------------------

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, []);


  //access stockcard document
  useEffect(() => {
    async function readSupplierDoc() {
      const stockcardRef = doc(db, "stockcard", docId)
      const docSnap = await getDoc(stockcardRef)
      if (docSnap.exists()) {
        setStockcardDoc(docSnap.data());
      }
    }
    readSupplierDoc()
  }, [docId])


  //Read stock card collection from database
  useEffect(() => {
    const collectionRef = collection(db, "stockcard");
    const q = query(collectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );

    return unsub;

  }, [])


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
  }

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
              <Card.Body style={{ height: "500px" }} id='scrollbar'>
                <ListGroup variant="flush">
                  {stockcard.map((stockcard) => {
                    return (
                      <ListGroup.Item
                        action
                        key={stockcard.id}
                        eventKey={stockcard.id}
                        onClick={() => { setDocId(stockcard.id) }}>
                        <div className='row'>
                          <small><strong>{stockcard.description}</strong></small>
                          <small>{stockcard.id}</small>

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
                        <Card.Body>
                          <small>Product ID: </small><br />
                          <small>Product Description: </small><br />
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

              <Tab.Pane eventKey={docId}>
                <div className='row px-5'>
                  <div className='row bg-white shadow'>
                    <div className="col-10">
                      <h1 className='text-center pt-4 p1'>{stockcardDoc.description}</h1>
                      <hr />
                    </div>
                    <div className="col-2 pt-4">
                      <Button
                        size="md"
                        variant="outline-danger"
                        onClick={() => { deleteStockcard(docId) }}
                      >
                        Delete<FontAwesomeIcon icon={faTrashCan} />
                      </Button>
                    </div>

                  </div>

                  <div className='row'>
                    <div className='col-6 mt-4'>
                      <Card className='shadow'>
                        <Card.Header className='bg-primary text-white'>
                          StockCard
                        </Card.Header>
                        <Card.Body>
                          <small>Product ID: <strong className='mx-2'>{docId}</strong></small><br />
                          <small>Product Description: <strong className='mx-2'>{stockcardDoc.description}</strong></small><br />
                          <small>Category: <span className='mx-2'>{stockcardDoc.category}</span></small><br />
                          <small>Available Stock: <span className='mx-2'>{stockcardDoc.qty}</span></small><br />
                          <small>Purchase Price: <span className='mx-2'>{stockcardDoc.p_price}</span></small><br />
                          <small>Selling Price: <span className='mx-2'>{stockcardDoc.s_price}</span></small><br />

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

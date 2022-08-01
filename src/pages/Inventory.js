import React from 'react';
import { Tab, Button, Card, ListGroup } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark,faPlus,faPen,faTrashCan } from '@fortawesome/free-solid-svg-icons'
import NewProductModal from '../components/NewProductModal';
import EditProductModal from '../components/EditProductModal';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  updateDoc

} from 'firebase/firestore';
import { ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Inventory({ isAuth }) {


  const [modalShowAP, setModalShowAP] = useState(false);
  const [modalShowUP, setModalShowUP] = useState(false);
  const [toggled, setToggled] = useState(false);
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

  const [newProductName, setNewProductName] = useState("");  
  const [newPriceP, setNewPriceP] = useState(0);
  const [newPriceS, setNewPriceS] = useState(0);
  const [newProdImg, setNewProdImg] = useState(0);
  const [newProdCategory, setNewProdCategory] = useState("");
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
    setProdQuantity(doc.data().qty)
    setProdPurchPrice(doc.data().s_price)
    setProdSalesPrice(doc.data().p_price)
    setProdCategory(doc.data().category)
    setProdImg(doc.data().img)
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
  
   const updateProduct = async (productId) => {
   const getProduct = doc(db, 'stockcard', productId);
    await updateDoc(getProduct, {
    description: newProductName,
    p_price: Number(newPriceP),
    s_price: Number(newPriceS),
    category: newProdCategory
      });
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
                      onClick={() => setModalShowAP(true)}>
                      <FontAwesomeIcon icon={faPlus} />
                    </Button>
                    <NewProductModal
                      show={modalShowAP}
                      onHide={() => setModalShowAP(false)}
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
                                                <EditProductModal
                      show={modalShowUP}
                      onHide={() => setModalShowUP(false)}
                      productid = {prodId}
                    />
                                                <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => { deleteStockcard(stockcard.id) }}
                            >
                              <FontAwesomeIcon icon={faTrashCan} />
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
                          <small>Purchase :</small><br />
                          <small>
              <label>Selling Price</label>

                          </small><br />
                          <small>Available Stock:</small><br />
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
                        <Card.Header className='bg-primary text-white align-card'>
                          StockCard
                        </Card.Header>

                        <Card.Body>
                        <Button
                              className="btn btn-success float-end"
                              size="sm"
                              onClick={() => { toggled?
                              setToggled(false)
                              :
                              setToggled(true)}}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </Button>
                        <div className="row">
                        <div className="col-6">
                                                <Card.Img variant="top" src={{prodImg}} />
                        </div>
                        {toggled?
                        <div className="col-6">
                          <small>Product ID: <strong className='mx-2'>{prodId4D}</strong></small><br />
                          <small>Product Name:
				<input type="text"
				className="form-control"
				defaultValue={prodName}
				value={prodName}
				required
				onChange={(event) => { setNewProductName(event.target.value); }}
			      /> 
                          </small>
                          <small>Category:
				<input type="text"
				className="form-control"
				defaultValue={prodCategory}
				value={prodCategory}
				required
				onChange={(event) => { setNewProdCategory(event.target.value); }}
			      		/>
                          
                          </small>
                          <small>Purchase Price: 
                          	<input
				type="number"
				min={0}
				className="form-control"
				defaultValue={prodPurchPrice}
				value={prodPurchPrice}
				onChange={(event) => { setNewPriceP(event.target.value); }}
				 />
                          </small>
                          <small>Selling Price:
				<input
				type="number"
				min={0}
				className="form-control"
				defaultValue={prodSalesPrice}
				value={prodSalesPrice}
				onChange={(event) => { setNewPriceS(event.target.value); }}
				 />
			</small>
			<small>Available Stock: <span className='mx-2'>{prodQuantity}</span></small><br /><br/>
			          			          <Button
            className="btn btn-success"
            style={{ width: "150px" }}
            onClick={updateProduct(prodId)} >
            Update
          </Button>
                        </div>
                        :
                        <div className="col-6">
                          <small>Product ID: <strong className='mx-2'>{prodId4D}</strong></small><br />
                          <small>Product Name:
				<input type="text"
				className="form-control"
				value={prodName}
				required
				readonly="readonly"
			      /> 
                          </small>
                          <small>Category:
				<input type="text"
				className="form-control"
				value={prodCategory}
				required
				readonly="readonly"
			      		/>
                          
                          </small>
                          <small>Purchase Price: 
                          	<input
				type="number"
				min={0}
				className="form-control"
				value={prodPurchPrice}
				readonly="readonly"
				 />
                          </small>
                          <small>Selling Price:
				<input
				type="number"
				min={0}
				className="form-control"
				value={prodSalesPrice}
				readonly="readonly"
				 />
			</small>
			<small>Available Stock: <span className='mx-2'>{prodQuantity}</span></small><br /><br/>
                        </div>
                        
			}
                     </div>
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

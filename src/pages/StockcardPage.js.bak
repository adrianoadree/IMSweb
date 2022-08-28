import React from 'react';
import { Tab, Button, Card, ListGroup, Modal, Form, Alert } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import NewProductModal from '../components/NewProductModal';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, updateDoc, where } from 'firebase/firestore';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import Barcode from 'react-barcode';
import JsBarcode from "jsbarcode";
import { UserAuth } from '../context/AuthContext'




function StockcardPage() {


  //---------------------VARIABLES---------------------
  const [barcodeModalShow, setBarcodeModalShow] = useState(false); //show/hide edit barcode modal
  const [editShow, setEditShow] = useState(false); //show/hide edit modal
  const [modalShow, setModalShow] = useState(false); //show/hide new product modal
  const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
  const [docId, setDocId] = useState("xx"); //document Id
  const [stockcardDoc, setStockcardDoc] = useState([]); //stockcard Document variable
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");

  //---------------------FUNCTIONS---------------------

  JsBarcode(".barcode").init();//initialize barcode


  //access stockcard document
  useEffect(() => {
    async function readStockcardDoc() {
      const stockcardRef = doc(db, "stockcard", docId)
      const docSnap = await getDoc(stockcardRef)
      if (docSnap.exists()) {
        setStockcardDoc(docSnap.data());
      }
    }
    readStockcardDoc()
  }, [docId])


  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  //Read stock card collection from database
  useEffect(() => {
    if (userID === undefined) {

      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const stockcardCollectionRef = collection(db, "stockcard")
      const q = query(stockcardCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [userID])


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

  const handleClose = () => setEditShow(false);

  //Edit Stockcard Data Modal-----------------------------------------------------------------------------
  function MyVerticallyCenteredModal(props) {

    const [newStockcardDescription, setNewStockcardDescription] = useState("");
    const [newStockcardCategory, setNewStockcardCategory] = useState("");
    const [newStockcardPPrice, setNewStockcardPPrice] = useState(0);
    const [newStockcardSPrice, setNewStockcardSPrice] = useState(0);

    //SetValues
    useEffect(() => {
      setNewStockcardDescription(stockcardDoc.description)
      setNewStockcardCategory(stockcardDoc.category)
      setNewStockcardSPrice(stockcardDoc.s_price)
      setNewStockcardPPrice(stockcardDoc.p_price)
    }, [docId])


    //update stockcard Document
    function updateStockcard() {
      updateDoc(doc(db, "stockcard", docId), {
        description: newStockcardDescription
        , category: newStockcardCategory
        , s_price: Number(newStockcardSPrice)
        , p_price: Number(newStockcardPPrice)
      });
      updateToast()
      handleClose();
    }

    //delete Toast
    const updateToast = () => {
      toast.info(' Stockcard Information Successfully Updated', {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }

    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Edit {docId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="p-3">
            <div className="row">
              <div className="col-6">
                <label>Item Name</label>
                <input type="text"
                  className="form-control"
                  placeholder="Item name"
                  value={newStockcardDescription}
                  required
                  onChange={(event) => { setNewStockcardDescription(event.target.value); }}
                />
              </div>
              <div className="col-6">
                <label>Category</label>
                <input type="text"
                  className="form-control"
                  placeholder="Category"
                  value={newStockcardCategory}
                  required
                  onChange={(event) => { setNewStockcardCategory(event.target.value); }}

                />
              </div>
            </div>
            <div className="row mt-2">
              <div className='col-4'>
                <label>Purchase Price</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  placeholder="Purchase Price"
                  value={newStockcardPPrice}
                  onChange={(event) => { setNewStockcardPPrice(event.target.value); }}
                />
              </div>
              <div className="col-4">
                <label>Selling Price</label>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  placeholder="Selling Price"
                  value={newStockcardSPrice}
                  onChange={(event) => { setNewStockcardSPrice(event.target.value); }}
                />
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => { updateStockcard(docId) }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  //Edit Barcode Modal-----------------------------------------------------------------------------
  function EditBarcodeModal(props) {

    const [newBarcodeValue, setNewBarcodeValue] = useState(100000000000);
    const handleEditBarcodeClose = () => setBarcodeModalShow(false);

    //SetValues
    useEffect(() => {
      setNewBarcodeValue(stockcardDoc.barcode)
    }, [docId])

    function updateBarcode() {
      updateDoc(doc(db, "stockcard", docId), {
        barcode: newBarcodeValue
      });
      setupBarcodeValue()
      handleEditBarcodeClose()
    }

    //delete Toast
    const setupBarcodeValue = () => {
      toast.info('Barcode Value Updated from the Database', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }


    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Set Barcode value
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='row p-3'>

            <div className='row'>
              <label>Enter 12-digit Barcode Value</label>

              <Form.Control
                type="number"
                placeholder="EAN-13 Barcode Value"
                min={100000000000}
                value={newBarcodeValue}
                required
                onChange={(event) => { setNewBarcodeValue(event.target.value); }}
              />

            </div>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => { updateBarcode(docId) }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  //display barcode function
  function DisplayBarcodeInfo() {

    if (stockcardDoc.barcode !== 0)
      return (
        <Card className='shadow'>
          <Card.Header className='bg-primary text-white'>
            Barcode
          </Card.Header>
          <Card.Body>


            <Barcode
              format="EAN13"
              value={stockcardDoc.barcode}
              height="50"
              width="3"
            />
          </Card.Body>
          <Card.Footer className='bg-white'>
            <Button
              size='sm'
              variant="outline-dark"
              onClick={() => setBarcodeModalShow(true)}
            >
              Edit Barcode Value
            </Button>
            <EditBarcodeModal
              show={barcodeModalShow}
              onHide={() => setBarcodeModalShow(false)}
            />

          </Card.Footer>
        </Card>
      )

    else {
      return (
        <Card className='shadow'>
          <Card.Header className='bg-primary text-white'>
            Barcode
          </Card.Header>
          <Card.Body className="pt-4" style={{ height: "125px" }}>

            <Alert className="text-center" variant="warning">
              <FontAwesomeIcon icon={faTriangleExclamation} /> Empty Barcode value
            </Alert>

          </Card.Body>
          <Card.Footer className='bg-white'>
            <Button
              size='sm'
              variant="outline-dark"
              onClick={() => setBarcodeModalShow(true)}
            >
              Setup Barcode
            </Button>
            <EditBarcodeModal
              show={barcodeModalShow}
              onHide={() => setBarcodeModalShow(false)}
            />

          </Card.Footer>
        </Card>
      )
    }


  }


  //-----------------------Main Return Value-------------------------------
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
                    <Button variant="outline-light"
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
                    <h1 className='text-center pt-4 p1'>Stockcard</h1>
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
                        size="sm"
                        variant="outline-dark"
                        style={{ width: "100px" }}
                        onClick={() => setEditShow(true)}
                      >
                        Edit <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <MyVerticallyCenteredModal
                        show={editShow}
                        onHide={() => setEditShow(false)}
                      />


                      <Button
                        className="mt-2"
                        size="sm"
                        variant="outline-danger"
                        style={{ width: "100px" }}
                        onClick={() => { deleteStockcard(docId) }}
                      >
                        Delete <FontAwesomeIcon icon={faTrashCan} />
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
                      <DisplayBarcodeInfo />
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

export default StockcardPage;
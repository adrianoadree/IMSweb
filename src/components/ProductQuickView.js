import React from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { addDoc, collection, query, onSnapshot, doc, useNavigate } from 'firebase/firestore';
import { db } from "../firebase-config";
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function ProductQuickView(props) {

  const [modalShow, setModalShow] = useState(false);

  const [stockcard, setStockcard] = useState([]);
  const stockcardCollectionRef = collection(db, "stockcard")
  const [prodId, setProdId] = useState("xx");
  const stockcardDocRef = doc(db, "stockcard", props.productId)
  const [prodName, setProdName] = useState("");
  const [prodSupplier, setProdSupplier] = useState("");
  const [prodQuantity, setProdQuantity] = useState(0);
  const [prodPurchPrice, setProdPurchPrice] = useState(0);
  const [prodSalesPrice, setProdSalesPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState("");
  const [prodId4D, setProdId4D] = useState("");
  
   //access document from a collection
  onSnapshot(stockcardDocRef, (doc) => {
    setProdId4D(doc.id)
    setProdName(doc.data().description)
    setProdQuantity(doc.data().quantity)
    setProdPurchPrice(doc.data().s_price)
    setProdSalesPrice(doc.data().p_price)
    setProdCategory(doc.data().category)
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


  return (


    <Modal
      {...props}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className="px-3">
          {prodName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
 <small>Product ID: <strong className='mx-2'>{prodId4D}</strong></small><br />
                          <small>Product Name: <strong className='mx-2'>{prodName}</strong></small><br />
                          <small>Category: <span className='mx-2'>{prodCategory}</span></small><br />
                          <small>Available Stock: <span className='mx-2'>{prodQuantity}</span></small><br />
                          <small>Purchase Price: <span className='mx-2'>{prodPurchPrice}</span></small><br />
                          <small>Selling Price: <span className='mx-2'>{prodSalesPrice}</span></small><br />
      </Modal.Body>
      <Modal.Footer>

      </Modal.Footer>
    </Modal>


  )
}
export default ProductQuickView;

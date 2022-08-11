import React from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { addDoc, collection, query, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db } from "../firebase-config";
import NewSupplierModal from "./NewSupplierModal";
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";




function NewProductModal(props) {

  const stockcardCollectionRef = collection(db, "stockcard")

  //data variable declaration
  const [newProductName, setNewProductName] = useState("");
  const [newPriceP, setNewPriceP] = useState(0);
  const [newPriceS, setNewPriceS] = useState(0);
  const [newQuanity, setNewQuantity] = useState(0);
  const [newProdSupplier, setNewProdSupplier] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("");

  const [supplierModalShow, setSupplierModalShow] = useState(false);
  const [supplier, setSupplier] = useState([]);
  const [varRef, setVarRef] = useState([]); // variable collection


  useEffect(() => {
    const unsub = onSnapshot(doc(db, "variables", "var"), (doc) => {
      setVarRef(doc.data());
    });
    return unsub;
  }, [])


  const successToast = () => {
    toast.success(' New Product Successfully Registered to the Database ', {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }



  //Create product to database
  const addProduct = async () => {
  
    setDoc(doc(db, "stockcard", "IT" + Number(varRef.purchDocNum)), {
      description: newProductName,
      p_price: Number(newPriceP),
      s_price: Number(newPriceS),
      qty: 0,
      category: newProdCategory
  });




    successToast();
  }


  //Read supplier collection from database
  useEffect(() => {
    const supplierCollectionRef = collection(db, "supplier")
    const q = query(supplierCollectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setSupplier(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return unsub;
  }, [])


  return (


    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
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



      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className="px-3">
          Register New Product
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
                required
                autoFocus
                onChange={(event) => { setNewProductName(event.target.value); }}
              />
            </div>
            <div className="col-6">
              <label>Category</label>
              <input type="text"
                className="form-control"
                placeholder="Category"
                required
                onChange={(event) => { setNewProdCategory(event.target.value); }}
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
                onChange={(event) => { setNewPriceP(event.target.value); }} />
            </div>
            <div className="col-4">
              <label>Selling Price</label>
              <input
                type="number"
                min={0}
                className="form-control"
                placeholder="Selling Price"
                onChange={(event) => { setNewPriceS(event.target.value); }} />
            </div>

          </div>




        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="row px-3">
          <Button
            className="btn btn-success"
            style={{ width: "150px" }}
            onClick={addProduct} >
            Save
          </Button>
        </div>
      </Modal.Footer>
    </Modal>


  )
}
export default NewProductModal;

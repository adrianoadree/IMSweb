import React from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { addDoc, collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from "../firebase-config";
import { ToastContainer, toast, Zoom, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditProductModal(props) {

  const stockcardDocRef = doc(db, "stockcard", props.productid)

  //data variable declaration
  const [newProductName, setNewProductName] = useState("");
  const [newPriceP, setNewPriceP] = useState(0);
  const [newPriceS, setNewPriceS] = useState(0);
  const [newProdImg, setNewProdImg] = useState(0);
  const [newProdCategory, setNewProdCategory] = useState("");
        const masterdataDocRef = doc(db, "masterdata", "stockcard")




        
      const [cntr, setCntr] = useState(0);

var format = "";

  onSnapshot(masterdataDocRef, (doc) => {
setCntr(doc.data().idCntr)
  }, [])
 
   onSnapshot(stockcardDocRef, (doc) => {
    setNewProductName(doc.data().description)
    setNewPriceP(doc.data().s_price)
    setNewPriceS(doc.data().p_price)
    setNewProdCategory(doc.data().category)
    setNewProdImg(doc.data().img)
  }, [])
 
const createFormat = () => {
  format = cntr + "";
  while(format.length < 5) {format = "0" + format};
  format = "IT" + format;
 }

  const successToast = () => {
    toast.success(' Product Successfully Updated ', {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
  
    const closeModal=()=>{
      document.querySelector("#updateProdModal").style.display = 'none';
      document.querySelector(".modal-backdrop").style.display = 'none';
  } 
  
    const updateProduct = async () => {
   const getProduct = doc(db, 'stockcard', props.productid);
    await updateDoc(getProduct, {
    description: newProductName,
    p_price: Number(newPriceP),
    s_price: Number(newPriceS),
    category: newProdCategory
      });

   closeModal();
   successToast();

  }



  return (


    <Modal id = "updateProdModal"
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
                value={newProductName}
                required
                onChange={(event) => { setNewProductName(event.target.value); }}
              />
            </div>
            <div className="col-6">
              <label>Category</label>
              <input type="text"
                className="form-control"
                value={newProdCategory}
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
                value={newPriceP}
                onChange={(event) => { setNewPriceP(event.target.value); }} />
            </div>
            <div className="col-4">
              <label>Selling Price</label>
              <input
                type="number"
                min={0}
                className="form-control"
                value={newPriceS}
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
            onClick={updateProduct} >
            Update
          </Button>
        </div>
      </Modal.Footer>
    </Modal>


  )
}
export default EditProductModal;

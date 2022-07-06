import React from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { addDoc, collection, query, onSnapshot } from 'firebase/firestore';
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

  const [supplierModalShow, setSupplierModalShow] = React.useState(false);
  const [supplier, setSupplier] = useState([]);


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
    await addDoc(stockcardCollectionRef, { product_name: newProductName, purchase_price: Number(newPriceP), product_supplier: newProdSupplier, selling_price: Number(newPriceS), quantity: Number(newQuanity) });
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
                onChange={(event) => { setNewProductName(event.target.value); }}
              />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-6">
              <label>Supplier Name</label>
              <Form.Select
                defaultValue="0"
                aria-label="Default select example"
                required
                onChange={(event) => { setNewProdSupplier(event.target.value); }}>
                <option
                  disabled
                  value="0">
                  Select Supplier
                </option>
                {supplier.map((supplier) => {
                  return (
                    <option
                      key={supplier.supplier_name}
                      value={supplier.supplier_name}>
                      {supplier.supplier_name}
                    </option>
                  )
                })}
              </Form.Select>
            </div>
            <div className="col-6">
              <label className="text-muted">Not on the List?</label><br></br>
              <Button variant="outline-primary"
                onClick={() => setSupplierModalShow(true)}
              >
                New Supplier
              </Button>
              <NewSupplierModal
                show={supplierModalShow}
                onHide={() => setSupplierModalShow(false)} />
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
          <div className="row mt-2">
            <div className="col-3">
              <label>Quantity</label>
              <input
                type="number"
                min={0}
                className="form-control"
                placeholder="Quantity"
                onChange={(event) => { setNewQuantity(event.target.value); }} />
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
import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { collection, updateDoc, onSnapshot, query, doc, setDoc, where } from "firebase/firestore";
import { db } from "../firebase-config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'

function NewProductModal(props) {


  //---------------------VARIABLES---------------------
  const {user} = UserAuth();
  const [userID, setUserID] = useState("");
  
  const [userCollection, setUserCollection] = useState([]);// userCollection variable
  const [userProfileID, setUserProfileID] = useState(""); // user profile id
  const userCollectionRef = collection(db, "user")// user collection
  const [productCounter, setProductCounter] = useState(0); // product counter
  const [categorySuggestions, setCategorySuggestions] = useState([])

  const [newProductName, setNewProductName] = useState("");
  const [newPriceP, setNewPriceP] = useState(0);
  const [newPriceS, setNewPriceS] = useState(0);
  const [newProdCategory, setNewProdCategory] = useState("");

  
  //---------------------FUNCTIONS---------------------
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  useEffect(() => {
    console.log(productCounter)
    console.log(userCollection)
    console.log(categorySuggestions)
}, )


  //Toastify
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

  //fetch user collection from database
  useEffect(() => {
    if (userID === undefined) {
          const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));
    
          const unsub = onSnapshot(q, (snapshot) =>
            setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
          );
          return unsub;
        }
        else {
          const q = query(userCollectionRef, where("user", "==", userID));
    
          const unsub = onSnapshot(q, (snapshot) =>
            setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
          );
          return unsub;
          
        }
  }, [userID])

  //assign profile and purchase counter
  useEffect(() => {
    userCollection.map((metadata) => {
        setProductCounter(metadata.stockcardId)
        setUserProfileID(metadata.id)
        setCategorySuggestions(metadata.categories)
    });
  }, [userCollection])


  const createFormat = () => {
    var format = productCounter + "";
    while(format.length < 7) {format = "0" + format};
    format = "IT" + format + '@' + userID;
    return format;
  }

  const newCatergories = () => {
    var newcategories = categorySuggestions;
    if(categorySuggestions.indexOf(newProdCategory) == -1)
    {
      newcategories.push(newProdCategory)
    }
    return newcategories;
  }

  //Create product to database
  const addProduct = async () => {
    setDoc(doc(db, "stockcard", createFormat()), {
      user: user.uid,
      description: newProductName,
      p_price: Number(newPriceP),
      s_price: Number(newPriceS),
      qty: 0,
      category: newProdCategory,
      barcode: 0,
      img: "",
      analytics_boolean: false,
      analytics_minLeadtime: 0,
      analytics_maxLeadtime: 0
    });
    await updateDoc(doc(db, 'user', userProfileID), {
      categories: newCatergories(),
    });
    updateProductDocNum()
    successToast();

    props.onHide();
  }

  //update variables.purchDocNum function
  function updateProductDocNum() {
    const userDocRef = doc(db, "user", userProfileID)
    const newData = { stockcardId: Number(productCounter) + 1 }

    updateDoc(userDocRef, newData)
}

  const handleClickSuggestion = (suggestion) => {
    console.log(suggestion.index)
    setNewProdCategory(suggestion.index)
  }


  return (
    <Modal
      {...props}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="IMS-modal"
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
      <Modal.Body >
        <div className="px-3 py-2">
          <div className="module-header mb-4">
            <h3 className="text-center">Register a New Product</h3>
          </div>
          <div className="row my-2 mb-3">
            <div className='col-6 ps-4'>
              <label>Item Code</label>
              <input type="text"
                readOnly
                className="form-control shadow-none shadow-none no-click"
                placeholder=""
                defaultValue={createFormat().substring(0, 9)}
                />
            </div>
            <div id="product-category" className='col-6 ps-4 d-flex align-item-center flex-column'>
              <label>Category</label>
              <input type="text"
                id="product-category-input"
                className="form-control shadow-none"
                placeholder="Category"
                defaultValue=""
                required
                onChange={(event) => { setNewProdCategory(event.target.value); }}
                value={newProdCategory}
              />
              <div id="product-category-suggestions">
                <div>
                  {categorySuggestions.map((index, k)=>{
                    return(
                      <button
                        onClick={()=>handleClickSuggestion({index})}
                      >
                        {index}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="row my-2 mb-3">
            <div className='col-12 ps-4'>
              <label>Item Name</label>
              <input type="text"
                className="form-control shadow-none"
                placeholder="Item name"
                required
                autoFocus
                onChange={(event) => { setNewProductName(event.target.value); }}
              />
            </div>
          </div>
          <div className="row my-2 mb-3">
            <div className='col-6 ps-4'>
              <label>Purchase Price</label>
              <input
                type="number"
                min={0}
                className="form-control shadow-none"
                placeholder="Purchase Price"
                onChange={(event) => { setNewPriceP(event.target.value); }} 
              />
            </div>
            <div className='col-6 ps-4'>
              <label>Selling Price</label>
              <input
                type="number"
                min={0}
                className="form-control shadow-none"
                placeholder="Selling Price"
                onChange={(event) => { setNewPriceS(event.target.value); }}
              />
            </div>
          </div>
        </div>
      </Modal.Body> 
      <Modal.Footer
        className="d-flex justify-content-center"
      >
        <Button
          className="btn btn-danger"
          style={{ width: "6rem" }}
          onClick={() => props.onHide()}
        >
          Cancel
        </Button>
        <Button
          className="btn btn-light float-start"
          style={{ width: "6rem" }}
          onClick={() => { addProduct() }}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>


  )
}
export default NewProductModal;

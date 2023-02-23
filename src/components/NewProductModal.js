import React from "react";
import { useState, useEffect } from "react";
import { db, st } from "../firebase-config";
import { collection, updateDoc, onSnapshot, query, doc, setDoc, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { UserAuth } from '../context/AuthContext'

import { Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faCircleInfo, faFile, faClose } from '@fortawesome/free-solid-svg-icons'

import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from 'loading-animations-react';


function NewProductModal(props) {
  const { user } = UserAuth(); // user credentials
  const [userID, setUserID] = useState(""); // user id
  const userCollectionRef = collection(db, "user")// user collection reference
  const [userCollection, setUserCollection] = useState([]);// user collection
  const [userProfileID, setUserProfileID] = useState(""); // user profile id
  const [productCounter, setProductCounter] = useState(0); // product counter
  const [categorySuggestions, setCategorySuggestions] = useState([]) // user-made categories

  const [newProductName, setNewProductName] = useState(""); // product name
  const [newPriceP, setNewPriceP] = useState(0); // product purchase price
  const [newPriceS, setNewPriceS] = useState(0); // product selling price
  const [newProdClassification, setNewProdClassification] = useState("Imported"); // product classification
  const [newProdCategory, setNewProdCategory] = useState(""); // product category
  const [newBarcode, setNewBarcode] = useState(0); // product category
  const [newMaxQty, setNewMaxQty] = useState(0); // product maximum quantity
  const [newMinQty, setNewMinQty] = useState(0); // product minimum quantity

  const [pasted, setPasted] = useState(false) // check if image is already pasted
  const [imageUpload, setImageUpload] = useState(null); // uploaded images
  const [imageUrls, setImageUrls] = useState([]); // urls of uploaded imags
  const [uploading, setUploading] = useState(false); // uploaded completion status
  const [uploadedOneImage, setUploadedOneImage] = useState(false); // checker if user has uploaded an image

  const [disallowAddition, setDisallowAddtion] = useState(true) // disabler of product creation

  //=============================== START OF STATE LISTENERS ===============================
  // set user id
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  // fetch user collection from database
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

  // assign profile and purchase counter
  useEffect(() => {
    userCollection.map((metadata) => {
      setProductCounter(metadata.stockcardId)
      setUserProfileID(metadata.id)
      setCategorySuggestions(metadata.categories)

    });
    setNewBarcode(createBarcode())
  }, [userCollection])

  // set product barcode on product counter fetch
  useEffect(() => {
    if (productCounter === undefined) {

    }
    else {
      setNewBarcode(createBarcode())
    }
  }, [productCounter])

  // disable button if form is incomplete
  useEffect(() => {
    // for text fields
    if (
      newProductName === undefined || newProductName == " " || newProductName == "" ||
      newPriceP < 0 ||
      newPriceS < 0 ||
      newProdCategory == " " || newProdCategory == "" ||
      newProdClassification == " " || newProdClassification == ""
    ) {
      setDisallowAddtion(true)
    }
    else {
      setDisallowAddtion(false)
    }
    // for images
    if (imageUrls.length > 0) {
      setUploading(false)
      setUploadedOneImage(true)
    }
    else {
      setUploadedOneImage(false)
    }
  })

  // clear fields on modal close
  useEffect(() => {
    if (props.onHide) {
      clearFields()
    }
  }, [props.onHide])
  //================================ END OF STATE LISTENERS ================================

  //=================================== START OF HANDLERS ==================================
  // add product category to user categories
  const newCategories = () => {
    var newcategories = categorySuggestions;
    if (categorySuggestions.indexOf(newProdCategory) == -1) {
      newcategories.push(newProdCategory)
    }
    return newcategories;
  }

  // generate product barcode
  const createBarcode = () => {
    var prefix = userProfileID.substring(1, 4)
    prefix = parseInt(prefix)
    if (prefix < 10) {
      prefix = prefix * 10
    }
    var suffix = productCounter + "";
    while (suffix.length < 11) { suffix = "0" + suffix };
    var barcode = prefix.toString() + suffix;
    return parseInt(barcode);
  }

  // set product category if selected from suggetions dropdown
  const handleClickSuggestion = (suggestion) => {
    setNewProdCategory(suggestion.index)
  }

  // filter uploaded files to images
  const filterFileUpload = (file) => {
    var valid_types = ['image/gif', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/bmp'];
    if (valid_types.includes(file['type'])) {
      setImageUpload(file)
    }
    else {
      alert("Not an image file")
    }
  }

  // upload images to database and get urls
  const uploadFile = () => {
    if (imageUpload == null) return;
    const imageRef = ref(st, `${userID}/stockcard/${createFormat().substring(0, 9)}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageUrls((prev) => [...prev, url]);
      });
    });
  };

  // product addition prompt
  const successToast = () => {
    toast.success('Adding ' + newProductName, {
      position: "top-right",
      autoClose: 1500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      transition: Zoom
    });
  }

  // reset field values
  const clearFields = () => {
    setNewProductName("")
    setNewProdClassification("Imported")
    setNewProdCategory("")
    setNewBarcode(createBarcode())
    setNewPriceP(0)
    setNewPriceS(0)
    setNewMinQty(0)
    setNewMaxQty(0)
    setUploading(false)
    setUploadedOneImage(false)
    setImageUrls([])
  }

  // create item code
  const createFormat = () => {
    var format = productCounter + "";
    while (format.length < 7) { format = "0" + format };
    format = "IT" + format + '@' + userID;
    return format;
  }

  // check if fields are empty to prevent null values
  const checkIfEmpty = (value, number) => {
    if (value === undefined) {
      if (number) {
        return 0;
      }
      else {
        return "";
      }
    }
    else {
      return value
    }
  }

  //=================================== END OF HANDLERS  ===================================

  //============================== START OF DATABASE WRITERS ===============================

  // add product
  const addProduct = async () => {
    setDoc(doc(db, "stockcard", createFormat()), {
      user: user.uid,
      description: newProductName,
      classification: newProdClassification,
      category: newProdCategory,
      barcode: Number(newBarcode),
      qty: 0,
      p_price: checkIfEmpty(Number(newPriceP), true),
      s_price: checkIfEmpty(Number(newPriceS), true),
      min_qty: checkIfEmpty(Number(newMinQty), true),
      max_qty: checkIfEmpty(Number(newMaxQty), true),
      img: imageUrls.length == 0 ? "" : imageUrls[0],
      analytics:
      {
        averageDailySales: 0,
        highestDailySales: 0,
        safetyStock: 0,
        reorderPoint: 0,
        daysROP: Infinity,
        leadtimeMinimum: 0,
        leadtimeMaximum: 0,
        leadtimeAverage: 0
      }

    });
    await updateDoc(doc(db, 'user', userProfileID), {
      categories: newCategories(),
    });
    updateProductDocNum()
    successToast();
    props.onHide();
  }

  // update product id counter from database
  function updateProductDocNum() {
    const userDocRef = doc(db, "user", userProfileID)
    const newData = { stockcardId: Number(productCounter) + 1 }
    updateDoc(userDocRef, newData)
  }
  //=============================== END OF DATABASE WRITERS ================================

  return (
    <Modal
      {...props}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="IMS-modal"
      id="add-product-modal"
    >
      <Modal.Body >
        <div className="px-3 py-2">
          <div className="module-header mb-4">
            <h3 className="text-center">Register a New Product</h3>
          </div>
          <div
            id="image-upload"
            className="row m-0 p-0"
          >
            <div className="col-4 px-3">
              <div className="row my-2 mb-3">
                <div className='col-12 ps-4'>
                  <label className="">Product Image</label>
                  <div className="row m-0 p-0">
                    <div className="col-10 p-0 m-0">
                      <input
                        id="image-upload-selector"
                        className="form-control shadow-none"
                        style={{ borderTopRightRadius: "0", borderBottomRightRadius: "0" }}
                        type="file"
                        onChange={(event) => {
                          setImageUrls([]);
                          setPasted(false)
                          filterFileUpload(event.target.files[0]);
                        }}
                      />
                    </div>
                    <div className="col-2 p-0 m-0">
                      <Button
                        variant="btn btn-primary"
                        className="form-control shadow-none w-100"
                        style={{ borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }}
                        disabled={uploadedOneImage}
                        onClick={() => {
                          setUploading(true)
                          uploadFile()
                        }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row my-2 mb-3 ps-4 w-100 h-75">
                <div
                  id="image-upload-preview"
                  className='w-100 h-100'
                  onPaste={(event) => {
                    setImageUrls([]);
                    setUploading(false)
                    setUploadedOneImage(false)
                    setPasted(true)
                    filterFileUpload(event.clipboardData.files[0])
                  }}
                >
                  <div id="image-upload-resetter-container">
                    <div id="image-upload-resetter">
                      {uploadedOneImage ?
                        <button className="me-2"
                          onClick={() => {
                            setImageUpload([])
                            setImageUrls([])
                            setUploading(false)
                            setPasted(false)
                            setUploadedOneImage(false)
                          }}>
                          <FontAwesomeIcon icon={faClose} className="m-1" />
                        </button>
                      :
                        <></>
                      }
                    </div>
                  </div>
                  {uploading ?
                    <>
                      {imageUrls.length == 0 ?
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                          <Spinner
                            color1="#b0e4ff"
                            color2="#fff"
                            textColor="rgba(0,0,0, 0.5)"
                            className="w-25 h-25"
                          />
                        </div>
                      :
                        <></>
                      }
                    </>
                  :
                    <>
                      {imageUrls.length == 0 ?
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center p-4">
                          <div className="text-center" style={{ lineHeight: "150%", fontWeight: "600", color: "#8193a1", fontSize: "1.1em", }}>
                            {pasted ?
                              <>
                                <h1><FontAwesomeIcon icon={faFile} /></h1>
                                <div className="pt-3" style={{ fontSize: "0.75em", opacity: "0.7" }}>image.jpg</div>
                                <div className="pt-3" style={{ fontSize: "0.9em" }}>Press the eye button to preview</div>
                              </>
                            :
                              <>
                                <div>Select an image to upload or paste here from clipboard by pressing Ctrl + V</div>
                                <div className="pt-3" style={{ fontSize: "0.75em", opacity: "0.7" }}>Non-image files won't be uploaded</div>
                              </>
                            }
                          </div>
                        </div>
                      :
                        <div className="w-100 d-flex align-items-center justify-content-center p-2" style={{ height: "95%" }}>
                          {imageUrls.map((url) => {
                            return <img key={url} src={url} style={{ height: '100%', width: '100%', objectFit: "contain" }} />;
                          })}
                        </div>
                      }
                    </>
                  }
                </div>
              </div>
            </div>
            <div className="col-8 px-3">
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
                <div className='col-6 ps-4'>
                  <label>
                    Classification
                    <span style={{ color: '#b42525' }}> *</span>
                  </label>
                  <select
                    type="text"
                    className="form-control shadow-none"
                    value={newProdClassification}
                    onChange={(event) => { setNewProdClassification(event.target.value) }}
                  >
                    <option value="Imported">Imported</option>
                    <option value="Manufactured">Manufactured</option>
                    <option value="Non-trading">Non-trading</option>
                  </select>
                </div>
              </div>
              <div className="row my-2 mb-3">
                <div className='col-12 ps-4'>
                  <label>
                    Item Name
                    <span style={{ color: '#b42525' }}> *</span>
                  </label>
                  <input type="text"
                    className="form-control shadow-none"
                    placeholder="LM Pancit Canton Orig (Pack-10pcs)"
                    required
                    autoFocus
                    onChange={(event) => { setNewProductName(event.target.value); }}
                  />
                </div>
              </div>
              <div className="row my-2 mb-3">
                <div id="product-category" className='col-6 ps-4 d-flex align-item-center flex-column'>
                  <label>
                    Category
                    <span style={{ color: '#b42525' }}> *</span>
                  </label>
                  <input type="text"
                    id="product-category-input"
                    className="form-control shadow-none"
                    placeholder="Category"
                    required
                    onChange={(event) => { setNewProdCategory(event.target.value); }}
                    value={newProdCategory}
                  />
                  <div id="product-category-suggestions">
                    <div>
                      {categorySuggestions.map((index, k) => {
                        return (
                          <button
                            key={index}
                            onClick={() => handleClickSuggestion({ index })}
                          >
                            {index}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className='col-6 ps-4'>
                  <label>
                    Barcode
                    <a
                      className="ms-2"
                      data-title="This barcode is autogenerated"
                    >
                      <FontAwesomeIcon icon={faCircleInfo} />
                    </a>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newBarcode}
                    className="form-control shadow-none"
                    onChange={(event) => { setNewBarcode(event.target.value) }}
                  />
                </div>
              </div>
              <div className="row my-2 mb-3">
                <div className='col-3 ps-4'>
                  <label>Purchase Price</label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={0}
                    className="form-control shadow-none"
                    placeholder="Purchase Price"
                    onChange={(event) => { setNewPriceP(event.target.value); }}
                  />
                </div>
                <div className='col-3 ps-4'>
                  <label>Selling Price</label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={0}
                    className="form-control shadow-none"
                    placeholder="Selling Price"
                    onChange={(event) => { setNewPriceS(event.target.value); }}
                  />
                </div>
                <div className='col-3 ps-4'>
                  <label>
                    Min Quantity
                    <a
                      className="ms-2"
                      data-title="The quantity to be considered low stock level"
                    >
                      <FontAwesomeIcon icon={faCircleInfo} />
                    </a>
                  </label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={0}
                    className="form-control shadow-none"
                    onChange={(event) => { setNewMinQty(event.target.value); }}
                  />
                </div>
                <div className='col-3 ps-4'>
                  <label>
                    Max Quantity
                    <a
                      className="ms-2"
                      data-title="The quantity to be considered overstocked"
                    >
                      <FontAwesomeIcon icon={faCircleInfo} />
                    </a>
                  </label>
                  <input
                    type="number"
                    min={0}
                    defaultValue={0}
                    className="form-control shadow-none"
                    onChange={(event) => { setNewMaxQty(event.target.value); }}
                  />
                </div>
              </div>
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
          disabled={disallowAddition}
          style={{ width: "8rem" }}
          onClick={() => { addProduct() }}
        >
          Add Product
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
export default NewProductModal;

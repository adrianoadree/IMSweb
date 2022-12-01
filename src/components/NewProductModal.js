import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { collection, updateDoc, onSnapshot, query, doc, setDoc, where } from "firebase/firestore";
import { db, st } from "../firebase-config";
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Spinner } from 'loading-animations-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faCircleInfo, faFile, faClose } from '@fortawesome/free-solid-svg-icons'


function NewProductModal(props) {


  //---------------------VARIABLES---------------------
  const { user } = UserAuth();
  const [userID, setUserID] = useState("");

  const [userCollection, setUserCollection] = useState([]);// userCollection variable
  const [userProfileID, setUserProfileID] = useState(""); // user profile id
  const userCollectionRef = collection(db, "user")// user collection
  const [productCounter, setProductCounter] = useState(0); // product 
  const [categorySuggestions, setCategorySuggestions] = useState([])
  const [disallowAddition, setDisallowAddtion] = useState(true)

  const [newProductName, setNewProductName] = useState("");
  const [newPriceP, setNewPriceP] = useState(0);
  const [newPriceS, setNewPriceS] = useState(0);
  const [newProdClassification, setNewProdClassification] = useState("Imported");
  const [newProdCategory, setNewProdCategory] = useState("");
  const [newBarcode, setNewBarcode] = useState(0);
  const [newMaxQty, setNewMaxQty] = useState(0);
  const [newMinQty, setNewMinQty] = useState(0);
  const [uploadedOneImage, setUploadedOneImage] = useState(false);

  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [pasted, setPasted] = useState(false)
  const [uploadMethod, setUploadMethod] = useState("")
  
  //---------------------FUNCTIONS---------------------
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  useEffect(() => {
    if(
      newProductName === undefined || newProductName == " " || newProductName == "" ||
      newPriceP < 0 ||
      newPriceS < 0 ||
      newProdCategory == " " || newProdCategory == "" ||
      newProdClassification == " " || newProdClassification == ""
    ){
      setDisallowAddtion(true)
    }
    else
    {
      setDisallowAddtion(false)
    }
    if(imageUrls.length > 0) {
      setUploading(false)
      setUploadedOneImage(true)
    }
    else
    {
      setUploadedOneImage(false)
    }
  })
  
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

  const checkIfEmpty = (value, number) => {
    if (value === undefined)
    {
      if(number)
      {
        return 0;
      }
      else
      {
        return "";
      }
    }
    else
    {
      return value
    }
  }

  useEffect(()=>{
    if(props.onHide)
    {
      clearFields()
    }
  }, [props.onHide])

  const imagesListRef = ref(st, userID + "/stockcard/");
  const uploadFile = () => {
    if (imageUpload == null) return;
    const imageRef = ref(st, `${userID}/stockcard/${createFormat().substring(0,9)}`);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageUrls((prev) => [...prev, url]);
      });
    });
  };

  //Toastify
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

  const filterFileUpload = (file) => {
    var valid_types= ['image/gif', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/bmp'];
    if(valid_types.includes(file['type']))
        {
          setImageUpload(file)
        }
        else{
          alert("Not an image file")
        }
}

  const createBarcode = () => {
    var prefix = userProfileID.substring(1,4)
    prefix = parseInt(prefix)
    if(prefix < 10)
    {
      prefix = prefix * 10
    }
    var suffix = productCounter + "";
    while(suffix.length < 11) {suffix = "0" + suffix};
    var barcode = prefix.toString() + suffix;
    return parseInt(barcode);
  }

  //assign profile and purchase counter
  useEffect(() => {
    userCollection.map((metadata) => {
        setProductCounter(metadata.stockcardId)
        setUserProfileID(metadata.id)
        setCategorySuggestions(metadata.categories)
        
    });
    setNewBarcode(createBarcode())
  }, [userCollection])

  useEffect(() => {
    if(productCounter === undefined)
    {

    }
    else
    {
      setNewBarcode(createBarcode())
    }
  }, [productCounter])


  const createFormat = () => {
    var format = productCounter + "";
    while (format.length < 7) { format = "0" + format };
    format = "IT" + format + '@' + userID;
    return format;
  }

  const newCatergories = () => {
    var newcategories = categorySuggestions;
    if (categorySuggestions.indexOf(newProdCategory) == -1) {
      newcategories.push(newProdCategory)
    }
    return newcategories;
  }

  //Create product to database
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
      img: imageUrls.length == 0?"":imageUrls[0],
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
      categories: newCatergories(),
    });
    updateProductDocNum()
    successToast();
    setImageUrls([])
    setNewProductName(" ")
    setNewProdCategory(" ")
    setNewProdClassification(" ")
    setNewPriceP(0)
    setNewPriceP(0)

    props.onHide();
  }

  //update variables.purchDocNum function
  function updateProductDocNum() {
    const userDocRef = doc(db, "user", userProfileID)
    const newData = { stockcardId: Number(productCounter) + 1 }

    updateDoc(userDocRef, newData)
  }

  const handleClickSuggestion = (suggestion) => {
    setNewProdCategory(suggestion.index)
  }

  useEffect(()=>{
    console.log(imageUpload)
    console.log(uploading)
    console.log(uploadedOneImage)
    console.log(pasted)
    console.log(uploadMethod)
  })
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
                        style={{borderTopRightRadius: "0", borderBottomRightRadius: "0"}}
                        type="file"
                        onChange={(event) => {
                          setImageUrls([]);
                          setUploadMethod("select")
                          setPasted(false)
                          filterFileUpload(event.target.files[0]);
                        }}
                      />
                    </div>
                    <div className="col-2 p-0 m-0">
                      <Button
                        variant="btn btn-primary"
                        className="form-control shadow-none w-100"
                        style={{borderTopLeftRadius: "0", borderBottomLeftRadius: "0"}}
                        disabled={uploadedOneImage}
                        onClick={() => {
                          setUploading(true)
                          uploadFile()
                        }}
                      >
                        <FontAwesomeIcon icon={faEye}/>
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
                    setUploadMethod("paste")
                    filterFileUpload(event.clipboardData.files[0])
                  }}
                >
                  <div id="image-upload-resetter-container">
                    <div id="image-upload-resetter">
                        {uploadedOneImage?
                      <button className="me-2"
                      onClick={()=>{
                        setImageUpload([])
                        setImageUrls([])
                        setUploading(false)
                        setPasted(false)
                        setUploadedOneImage(false)
                      }}>
                        <FontAwesomeIcon icon={faClose} className="m-1"/>
                      </button>
                        :
                        <></>
                        }
                    </div>
                  </div>
                  {uploading?
                    <>
                      {imageUrls.length == 0?
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
                    {imageUrls.length == 0?
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center p-4">
                        <div className="text-center" style={{lineHeight: "150%", fontWeight: "600", color: "#8193a1", fontSize: "1.1em", }}>
                          {pasted?
                            <>
                              <h1><FontAwesomeIcon icon={faFile} /></h1>
                              <div className="pt-3" style={{fontSize: "0.75em", opacity: "0.7"}}>image.jpg</div>
                            </>
                            :
                            <>
                              <div>Select an image to upload or paste here from clipboard by pressing Ctrl + V</div>
                              <div className="pt-3" style={{fontSize: "0.75em", opacity: "0.7"}}>Non-image files won't be uploaded</div>
                            </>
                          }
                        </div>
                      </div>
                    :
                    <div className="w-100 d-flex align-items-center justify-content-center p-2" style={{height: "95%"}}>
                      {imageUrls.map((url) => {
                        return <img key={url} src={url} style={{height: '100%', width: '100%', objectFit: "contain"}}/>;
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
                    <span style={{color: '#b42525'}}> *</span>
                  </label>
                  <select
                    type="text"
                    className="form-control shadow-none"
                    value={newProdClassification}
                    onChange={(event)=>{setNewProdClassification(event.target.value)}}
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
                  <span style={{color: '#b42525'}}> *</span>
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
                    <span style={{color: '#b42525'}}> *</span>
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
                      {categorySuggestions.map((index, k)=>{
                        return(
                          <button
                            key={index}
                            onClick={()=>handleClickSuggestion({index})}
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
                      <FontAwesomeIcon icon={faCircleInfo}/>
                    </a>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newBarcode}
                    className="form-control shadow-none"
                    onChange={(event)=>{setNewBarcode(event.target.value)}}
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
                      <FontAwesomeIcon icon={faCircleInfo}/>
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
                      <FontAwesomeIcon icon={faCircleInfo}/>
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

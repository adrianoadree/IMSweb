import React from 'react';
import { Nav, Tab, Button, Card, ListGroup, Modal, Form, Alert, Table, Tooltip, OverlayTrigger, Accordion, Placeholder } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect, useCallback } from 'react';
import { db, st } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation, faSearch, faTruck, faBarcode, faFileLines, faInbox, faArrowRightFromBracket, faArrowRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { Cube, Grid, Pricetag, Layers, Barcode as Barc, Cart, InformationCircle, CaretUp, Enter, Exit, CaretDown, GitBranch } from 'react-ionicons'
import NewProductModal from '../components/NewProductModal';
import { useNavigate } from 'react-router-dom';
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc, where } from 'firebase/firestore';
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEdit, faCircle } from '@fortawesome/free-regular-svg-icons';
import { faEye, faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import { UserAuth } from '../context/AuthContext'
import Barcode from 'react-jsbarcode'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import moment from 'moment';
import  UserRouter  from '../pages/UserRouter'
import { Spinner } from 'loading-animations-react';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  list,
} from "firebase/storage";
import { property } from 'lodash';


function StockcardPage({ isAuth }) {


  //---------------------VARIABLES---------------------
  const [key, setKey] = useState('main');//Tab controller
  const [barcodeModalShow, setBarcodeModalShow] = useState(false); //show/hide edit barcode modal
  const [editShow, setEditShow] = useState(false); //show/hide edit modal
  const [modalShow, setModalShow] = useState(false); //show/hide new product modal
  const [modalShowDL, setModalShowDL] = useState(false); //show/hide new product modal
  const [stockcard, setStockcard] = useState(); // stockcardCollection variable
  const [docId, setDocId] = useState(0); //document Id
  const [stockcardDoc, setStockcardDoc] = useState([]); //stockcard Document variable
  const { user } = UserAuth();//user credentials
  const [userID, setUserID] = useState("");
  const [isFetched, setIsFetched] = useState(false);//listener for when collection is retrieved
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isEditing, setEditing] = useState(false);

  const reload=()=>window.location.reload();

  //---------------------FUNCTIONS---------------------

  useEffect(()=>{
    console.log(filteredResults)
  })
  const handleProductSelect = (product) => {
      let productIndex = selectedProducts.indexOf(product)
      var currentSelectedProduct = document.getElementById(product);
      
      if(currentSelectedProduct.classList.contains("product-selected")) 
      {
        currentSelectedProduct.classList.remove("product-selected")
      }
      else
      {
        currentSelectedProduct.classList.add("product-selected")
      }
      console.log(currentSelectedProduct)
      if(productIndex >= 0) {
        setSelectedProducts([
          ...selectedProducts.slice(0, productIndex),
          ...selectedProducts.slice(productIndex + 1, selectedProducts.length)
        ]);
      }
      else
      {
        setSelectedProducts([... selectedProducts, product])
    }
  }

  /*//access stockcard document
  useEffect(() => {
    async function readStockcardDoc() {
      const stockcardRef = doc(db, "stockcard", docId)
      const docSnap = await getDoc(stockcardRef)
      if (docSnap.exists()) {
        setStockcardDoc(docSnap.data());
      }
    }
    readStockcardDoc()
  }, [docId])*/


  useEffect(()=>{
    if(stockcard === undefined) {
      setIsFetched(false)
    }
    else
    {
      setIsFetched(true)
    }
  }, [stockcard])

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

  //Edit Stockcard Data Modal-----------------------------------------------------------------------------
  function EditProductModal(props) {

    const [newStockcardDescription, setNewStockcardDescription] = useState("");
    const [newStockcardCategory, setNewStockcardCategory] = useState("");
    const [newStockcardPPrice, setNewStockcardPPrice] = useState(0);
    const [newStockcardSPrice, setNewStockcardSPrice] = useState(0);
    const [newStockcardClassification, setNewStockcardClassification] = useState("");
    const [newStockcardBarcode, setNewStockcardBarcode] = useState(0);
    const [newStockcardMaxQty, setNewStockcardMaxQty] = useState(0);
    const [newStockcardMinQty, setNewStockcardMinQty] = useState(0);
    const [uploadedOneImage, setUploadedOneImage] = useState(false);

    const [categorySuggestions, setCategorySuggestions] = useState([])
    const [disallowAddition, setDisallowAddtion] = useState(true)
    const [userCollection, setUserCollection] = useState([]);// userCollection variable
    const [userProfileID, setUserProfileID] = useState(""); // user profile id
    const userCollectionRef = collection(db, "user")// user collection
  
    const [imageUpload, setImageUpload] = useState(null);
    const [imageUrls, setImageUrls] = useState([]);
    const [uploading, setUploading] = useState(false);

    //SetValues
    useEffect(() => {
      if(
        newStockcardDescription == " " ||
        newStockcardPPrice == 0 ||
        newStockcardSPrice == 0 ||
        newStockcardCategory == " " ||
        newStockcardClassification == " " ||
        imageUrls.length == 0
      ){
        setDisallowAddtion(true)
      }
      else
      {
        setDisallowAddtion(false)
      }
      if(imageUrls.length == 0) {
        setUploadedOneImage(false)
      }
      else
      {
        setUploadedOneImage(true)
        setUploading(false)
      }
    })

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
          setUserProfileID(metadata.id)
          setCategorySuggestions(metadata.categories)
      });
    }, [userCollection])

    useEffect(() => {
      if(stockcard === undefined)
      {

      }
      else
      {
        setNewStockcardDescription(stockcard[docId].description)
        setNewStockcardCategory(stockcard[docId].category)
        setNewStockcardSPrice(stockcard[docId].s_price)
        setNewStockcardPPrice(stockcard[docId].p_price)
        setNewStockcardClassification(stockcard[docId].classification)
        setNewStockcardBarcode(stockcard[docId].barcode)
        setNewStockcardMaxQty(stockcard[docId].max_qty)
        setNewStockcardMinQty(stockcard[docId].min_qty)
        setNewStockcardMinQty(stockcard[docId].min_qty)
        setImageUrls([... imageUrls, stockcard[docId].img])
      }
    }, [docId])


    const newCatergories = () => {
      var newcategories = categorySuggestions;
      if(categorySuggestions.indexOf(newStockcardCategory) == -1)
      {
        newcategories.push(newStockcardCategory)
      }
      return newcategories;
    }

    const handleClickSuggestion = (suggestion) => {
      console.log(suggestion.index)
      setNewStockcardCategory(suggestion.index)
    }
  
    const imagesListRef = ref(st, userID + "/stockcard/");
    const uploadFile = () => {
      if (imageUpload == null) return;
      const imageRef = ref(st, `${userID}/stockcard/${docId.substring(0,9)}`);
      uploadBytes(imageRef, imageUpload).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setImageUrls((prev) => [...prev, url]);
        });
      });
    };

    //update stockcard Document
    function UpdateStockcard() {
      updateDoc(doc(db, "stockcard", stockcard[docId].id), {
        description: newStockcardDescription
        , classification: newStockcardClassification
        , category: newStockcardCategory
        , barcode: newStockcardBarcode
        , s_price: Number(newStockcardSPrice)
        , p_price: Number(newStockcardPPrice)
        , min_qty: newStockcardMinQty
        , max_qty: newStockcardMaxQty
        , img: imageUrls[0]
      });
      updateDoc(doc(db, 'user', userProfileID), {
        categories: newCatergories(),
      });

      updateToast()
      props.onHide()
    }

    //update Toast
    const updateToast = () => {
      toast.info(stockcard[docId].description + ' successfully updated', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        transition: Zoom
      })
    }

    return (
      <Modal
        {...props}
        size="xl"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal"
      >
        <ToastContainer
          newestOnTop={false}
          pauseOnFocusLoss
        />
        <Modal.Body >
          <div className="px-3 py-2">
            <div className="module-header mb-4">
              <h3 className="text-center">Editing{stockcard === undefined?<></>:<>{stockcard[docId].description}</>}</h3>
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
                          className="form-control shadow-none"
                          type="file"
                          onChange={(event) => {
                            setImageUrls([]);
                            setImageUpload(event.target.files[0]);
                          }}
                        />
                      </div>
                      <div className="col-2 p-0 m-0">
                        <Button
                          variant="btn btn-success"
                          className="shadow-none w-100"
                          disabled={uploadedOneImage}
                          onClick={()=>{setUploading(true);uploadFile()}}
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
                    className='col-12 w-100 h-100 d-flex align-items-center justify-content-center'
                  >
                    {uploading?
                      <>
                        {imageUrls.length == 0?
                          <Spinner 
                            color1="#b0e4ff"
                            color2="#fff"
                            textColor="rgba(0,0,0, 0.5)"
                            className="w-25 h-25"
                          />
                        :
                          <></>
                        }
                      </>
                    :
                    <>
                      {imageUrls.map((url, index) => {
                        return <img src={url} style={{height: '100%', width: '100%'}} key={index}/>;
                      })}
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
                      defaultValue={stockcard === undefined?<></>:<>{stockcard[docId].id.substring(0,9)}</>}
                      />
                  </div>
                  <div className='col-6 ps-4'>
                    <label>Classification</label>
                    <select
                      type="text"
                      className="form-control shadow-none"
                      value={newStockcardClassification}
                      onChange={(event)=>{setNewStockcardClassification(event.target.value)}}
                    >
                      <option value="Imported">Imported</option>
                      <option value="Manufactured">Manufactured</option>
                      <option value="Non-trading">Non-trading</option>
                    </select>
                  </div>
                </div>
                <div className="row my-2 mb-3">
                  <div className='col-12 ps-4'>
                    <label>Item Name</label>
                    <input type="text"
                      className="form-control shadow-none"
                      placeholder="LM Pancit Canton Orig (Pack-10pcs)"
                      required
                      autoFocus
                      value={newStockcardDescription}
                      onChange={(event) => {setNewStockcardDescription(event.target.value); }}
                    />
                  </div>
                </div>
                <div className="row my-2 mb-3">
                  <div id="product-category" className='col-6 ps-4 d-flex align-item-center flex-column'>
                    <label>Category</label>
                    <input type="text"
                      id="product-category-input"
                      className="form-control shadow-none"
                      placeholder="Category"
                      required
                      onChange={(event) => { setNewStockcardCategory(event.target.value); }}
                      value={newStockcardCategory}
                    />
                    <div id="product-category-suggestions">
                      <div>
                        {categorySuggestions.map((index, k)=>{
                          return(
                            <button
                              key={"category-"+k}
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
                      value={newStockcardBarcode}
                      className="form-control shadow-none"
                      onChange={(event)=>{setNewStockcardBarcode(event.target.value)}}
                      />
                  </div>
                </div>
                <div className="row my-2 mb-3">
                  <div className='col-3 ps-4'>
                    <label>Purchase Price</label>
                    <input
                      type="number"
                      min={1}
                      value={newStockcardPPrice}
                      className="form-control shadow-none"
                      placeholder="Purchase Price"
                      onChange={(event) => { setNewStockcardPPrice(event.target.value); }} 
                    />
                  </div>
                  <div className='col-3 ps-4'>
                    <label>Selling Price</label>
                    <input
                      type="number"
                      min={1}
                      value={newStockcardSPrice}
                      className="form-control shadow-none"
                      placeholder="Selling Price"
                      onChange={(event) => { setNewStockcardSPrice(event.target.value); }}
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
                      value={newStockcardMinQty}
                      className="form-control shadow-none"
                      onChange={(event) => { setNewStockcardMinQty(event.target.value); }} 
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
                      value={newStockcardMaxQty}
                      className="form-control shadow-none"
                      onChange={(event) => { setNewStockcardMaxQty(event.target.value); }}
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
            style={{ width: "9rem" }}
            onClick={() => { UpdateStockcard(); }}
          >
            Update Product
          </Button>
        </Modal.Footer>
      </Modal>
  
  
    )
  }

  //Edit Stockcard Data Modal-----------------------------------------------------------------------------
  function DeleteProductModal(props) {

  //delete row 
  const deleteStockcard = async () => {
    const stockcardDoc = doc(db, "stockcard", stockcard[docId].id)
    deleteToast();
    await deleteDoc(stockcardDoc);
    setKey('main')
    props.onHide()
  }
  
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


    return (
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="IMS-modal warning"
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
        {stockcard === undefined?
        <></>
        :
        <div className="px-3 py-2">
          <div className="module-header mb-4">
            <h3 className="text-center">Deleting {stockcard === undefined?<></>:<>{stockcard[docId].id.substring(0,9)}</>}</h3>
          </div>
          <div className="row m-0 p-0 mb-3">
            <div className="col-12 px-3 text-center">
              <strong>
                Are you sure you want to delete
                <br />
                <span style={{color: '#b42525'}}>{stockcard[docId].description}?</span>
              </strong>
            </div>
          </div>
          <div className="row m-0 p-0">
            <div className="col-12 px-3 d-flex justify-content-center">
              <Table size="sm">
                <tbody>
                  <tr>
                    <td>Description</td>
                    <td>{stockcard[docId].description}</td>
                  </tr>
                  <tr>
                    <td>Classification</td>
                    <td>{stockcard[docId].classification}</td>
                  </tr>
                  <tr>
                    <td>Category</td>
                    <td>{stockcard[docId].category}</td>
                  </tr>
                  <tr>
                    <td>Purchase Price</td>
                    <td>{stockcard[docId].p_price}</td>
                  </tr>
                  <tr>
                    <td>Selling Price</td>
                    <td>{stockcard[docId].s_price}</td>
                  </tr>
                  <tr>
                    <td>Minimum Quantity</td>
                    <td>{stockcard[docId].min_qty}</td>
                  </tr>
                  <tr>
                    <td>Maximum Quantity</td>
                    <td>{stockcard[docId].max_qty}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </div>
        }
        </Modal.Body> 
        <Modal.Footer
          className="d-flex justify-content-center"
        >
          <Button
            className="btn btn-light"
            style={{ width: "6rem" }}
            onClick={() => props.onHide()}
          >
            Cancel
          </Button>
          <Button
            className="btn btn-danger float-start"
            style={{ width: "9rem" }}
            onClick={() => { deleteStockcard() }}
          >
            Delete Product
          </Button>
        </Modal.Footer>
      </Modal>
  
  
    )
  }  

  //Edit Barcode Modal-----------------------------------------------------------------------------
  function EditBarcodeModal(props) {

    const [newBarcodeValue, setNewBarcodeValue] = useState(100000000000);
    const handleEditBarcodeClose = () => setBarcodeModalShow(false);

    //SetValues
    useEffect(() => {
      setNewBarcodeValue(stockcard[docId].barcode)
    }, [docId])

    function updateBarcode() {
      updateDoc(doc(db, "stockcard", docId), {
        barcode: Number(newBarcodeValue)
      });
      setupBarcodeValue()
      handleEditBarcodeClose()
    }

    //update Toast
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
              <label>Enter 13-digit Barcode Value</label>

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


  //----------------------------------SALES TOTAL RECORD FUNCTION----------------------------------

  const [salesRecordCollection, setSalesRecordCollection] = useState([]); // sales_record collection
  const [filteredResults, setFilteredResults] = useState([])
  const [totalSalesInclVoided, setTotalSalesInclVoided] = useState(0); // total sales
  const [totalSales, setTotalSales] = useState(0); // total sales

  //query documents from sales_record that contains docId
  useEffect(() => {
    if(stockcard === undefined)
    {

    }
    else
    {
      const collectionRef = collection(db, "sales_record")
      const q = query(collectionRef, where("product_ids", "array-contains", stockcard[docId].id));
  
      const unsub = onSnapshot(q, (snapshot) =>
        setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [docId])
  //query documents from sales_record that contains docId

  useEffect(() => {
    setFilteredResults(salesRecordCollection.map((element) => {
      return {
        ...element, product_list: element.product_list.filter((product_list) => product_list.itemId === stockcard[docId].id)
      }
    }))
  }, [salesRecordCollection])

  //compute for total sales
  useEffect(() => {
    var temp = 0;
    filteredResults.map((value) => {
      if(!value.isVoided)
      {
        value.product_list.map((prod) => {
          temp += prod.itemQuantity
        })
      }
    })
    setTotalSales(temp)
  }, [filteredResults])
  //-----------------------------------------------------------------------------------------------

  //--------------------------------PURCHASE TOTAL RECORD FUNCTION---------------------------------
  const [purchaseRecordCollection, setPurchaseRecordCollection] = useState([]); // sales_record collection
  const [purchaseFilteredResults, setPurchaseFilteredResults] = useState([])
  const [totalPurchase, setTotalPurchase] = useState(0); // total sales

  //query documents from sales_record that contains docId
  useEffect(() => {
    if(stockcard === undefined)
    {

    }
    else
    {
      const collectionRef = collection(db, "purchase_record")
      const q = query(collectionRef, where("product_ids", "array-contains", stockcard[docId].id));

      const unsub = onSnapshot(q, (snapshot) =>
        setPurchaseRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
  }, [docId])
  //query documents from sales_record that contains docId
  useEffect(() => {

    setPurchaseFilteredResults(purchaseRecordCollection.map((element) => {
      return {
        ...element, product_list: element.product_list.filter((product_list) => product_list.itemId === stockcard[docId].id)
      }
    }))

  }, [purchaseRecordCollection])

  //compute for total sales
  useEffect(() => {
    var tempPurch = 0;
    purchaseFilteredResults.map((purch) => {
      if(!purch.isVoided)
      {
      purch.product_list.map((purch) => {
        tempPurch += purch.itemQuantity
      })
      }
    })
    setTotalPurchase(tempPurch)
  }, [purchaseFilteredResults])


  const [leadtimeModalShow, setLeadtimeModalShow] = useState(false);

  function EditLeadtimeModal(props) {
    const [newMinLeadtime, setNewMinLeadtime] = useState(0);
    const [newMaxLeadtime, setNewMaxLeadtime] = useState(0);

    const handleEditLeadtimeClose = () => setLeadtimeModalShow(false);

    //SetValues
    useEffect(() => {
      setNewMaxLeadtime(stockcard[docId].analytics_maxLeadtime)
      setNewMinLeadtime(stockcard[docId].analytics_minLeadtime)
    }, [docId])

    //update Toast
    const updateLeadtimeToast = () => {
      toast.info('Leadtime Value Updated from the Database', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }


    function updateLeadtime() {
      updateDoc(doc(db, "stockcard", docId), {
        analytics_maxLeadtime: Number(newMaxLeadtime),
        analytics_minLeadtime: Number(newMinLeadtime)
      });
      updateLeadtimeToast()
      handleEditLeadtimeClose()
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
            Set Product Leadtime
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='row p-3'>

            <div className='row text-center'>
              <h6><label>Enter Minimum and Maximum days of Product Leadtime</label></h6>
              <br />
              <hr />
              <br />

              <div className='col-6'>
                <label>Minimum Leadtime</label>
                <Form.Control
                  type="number"
                  placeholder="Minumum Leadtime"
                  min={0}
                  value={newMinLeadtime}
                  onChange={(event) => { setNewMinLeadtime(event.target.value); }}
                  required
                />
              </div>
              <div className='col-6'>
                <label>Maximum Leadtime</label>
                <Form.Control
                  type="number"
                  placeholder="Maximum Leadtime"
                  value={newMaxLeadtime}
                  onChange={(event) => { setNewMaxLeadtime(event.target.value); }}
                  min={0}
                  required
                />
              </div>


            </div>
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button
            disabled={newMaxLeadtime === 0 ? true : false}
            onClick={() => { updateLeadtime(docId) }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }


  const leadTimeTooltip = (props) => (
    <Tooltip id="LeadTime" className="tooltipBG" {...props}>
      Lead time is the amount of days it takes for your supplier to fulfill
      your order
    </Tooltip>
  );

  const salesQuantityReport = (props) => (
    <Tooltip id="salesQuantityReport" className="tooltipBG" {...props}>
      Displays a Report containing: Transaction Number, Date of Transaction, Quantity of a certain transaction
    </Tooltip>
  );

  //-----------------------------------------------------------------------------------------------

  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());





    const [salesLedger, setSalesLedger] = useState([])
  const [salesReport, setSalesReport] = useState()
  const [reportSalesQuantity, setReportSalesQuantity] = useState([])
  const [reportSalesDate, setReportSalesDate] = useState([])
  const [reportSalesId, setReportSalesId] = useState([])
  const [reportTotalSales, setReportTotalSales] = useState(0)


  useEffect(() => {

    if (start && end !== null) {


      start.setDate(start.getDate() + 1)
      end.setDate(end.getDate() + 2)
      let tempTotal = 0
      let tempDate
      let tempIDArr = []
      let tempQuantityArr = []
      let tempDateArr = []

      let tempArrReport = [{}]

      while (start < end) {
        tempDate = start.toISOString().substring(0, 10)
        salesRecordCollection.map((sale) => {
          if (sale.transaction_date === tempDate && userID === sale.user) {
            sale.product_list.map((prod) => {
              if (prod.itemId === docId) {
                tempTotal += prod.itemQuantity
                tempIDArr.push(sale.transaction_number)
                tempDateArr.push(sale.transaction_date)
                tempQuantityArr.push(prod.itemQuantity)
                tempArrReport.push({ ID: sale.transaction_number, Date: sale.transaction_date, Quantity: prod.itemQuantity })
              }
            })
          }
        })
        start.setDate(start.getDate() + 1)
      }
      setSalesReport(tempArrReport)
      setReportSalesQuantity(tempQuantityArr)
      setReportSalesId(tempIDArr)
      setReportSalesDate(tempDateArr)
      setReportTotalSales(tempTotal)
    }

  }, [end])

  useEffect(() => {
    setSalesReport()
    setReportSalesQuantity([])
    setReportSalesId([])
    setReportSalesDate([])
    setReportTotalSales(0)
    setDateRange(([null, null]))
  }, [docId])


  const [filteredReport, setFilteredReport] = useState()

  useEffect(() => {
    if (salesReport !== undefined) {
      const results = salesReport.filter(element => {
        if (Object.keys(element).length !== 0) {
          return true;
        }
        return false;
      });

      setFilteredReport(results)
    }
  }, [salesReport])


  const [strStartDate, setStrStartDate] = useState("")
  const [startDateHolder, setStartDateHolder] = useState()
  const [endDateHolder, setEndDateHolder] = useState()


  useEffect(() => {
    console.log(startDate)
  }, [startDate])

  useEffect(() => {
    if (startDate !== null) {
      let x = new Date(startDate)
      let tempDate = new Date()

      if (x !== null) {
        tempDate = x
        setStartDateHolder(tempDate)
      }
    }
  }, [startDate])


  useEffect(() => {
    if (endDate !== null) {
      let x = new Date(endDate)
      let tempDate = new Date()

      if (x !== null) {
        tempDate = x
        setEndDateHolder(tempDate)
      }
    }
  }, [endDate])

  useEffect(() => {
    console.log(filteredReport)
  }, [filteredReport])


  const [tableHeaderBoolean, setTableHeaderBoolean] = useState(true)

  useEffect(() => {
    if (filteredReport !== undefined) {
      if (filteredReport.length === 0) {
        setTableHeaderBoolean(true)
      }
      else {
        setTableHeaderBoolean(false)
      }
    }
  }, [filteredReport])

  useEffect(() => {
    if (filteredReport !== undefined) {
      if (filteredReport.length === 0) {
        setDateRange([null], [null])
      }
    }
  }, [filteredReport])


  useEffect(() => {
    reportTableHeader()
    reportTable()
  }, [filteredReport])

  function reportTableHeader() {
    if (filteredReport !== undefined) {
      return (
        <>
          {filteredReport.length !== 0 ?
            reportTableHeaderTrue()
            :
            reportTableHeaderFalse()
          }
        </>
      )
    }
  }


  function reportTableHeaderTrue() {
    return (
      <>
        <div className='row'>
          <div className='row text-center'>
            <div className='row p-3'>
              <h4 className='text-primary'>Sold Quantity Report for date(s)</h4>
            </div>
            <div className='row'>
              <span>
                <strong>{moment(startDateHolder).format('ll')}</strong> to <strong>{moment(endDateHolder).format('ll')}</strong>
                <Button
                  className='ml-2'
                  size='sm'
                  variant="outline-primary"
                  onClick={() => { setStart(new Date()); setEnd(new Date()); }}
                >
                  reset
                </Button>
              </span>

            </div>
          </div>
        </div>
      </>
    )
  }

  function reportTableHeaderFalse() {
    return (
      <div>

        <div className="row py-1 m-0 mb-2">
          <span>
            <InformationCircle
              className="me-2 pull-down"
              color={'#0d6efd'}
              title={'Category'}
              height="40px"
              width="40px"
            />
            <OverlayTrigger
              placement="right"
              delay={{ show: 250, hide: 400 }}
              overlay={salesQuantityReport}
            >
              <h4 className="data-id">SALES QUANTITY REPORT</h4>
            </OverlayTrigger>
          </span>

        </div>
        <div className='row text-center mb-2'>
          <label>Date-Range to Report</label>
          <DatePicker
            placeholderText='Enter Date-Range'
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => {
              setDateRange(update);
            }}
            withPortal
          />
        </div>
      </div>

    )
  }

  useEffect(() => {
    setStart(startDate)
    setEnd(endDate)
  }, [dateRange])

  function reportTable() {
    if (filteredReport !== undefined) {
      return (
        <>
          {filteredReport.length !== 0 ?
            reportTableTrue()
            :
            reportTableFalse()
          }
        </>
      )
    }
  }

  function reportTableFalse() {
    return (
      <>
        <Alert variant='warning' className='text-center'>
          <strong>No Transaction to Report</strong><br />
          <span>Enter different Date-Range</span>
        </Alert>
      </>
    )
  }

  function reportTableTrue() {
    if (filteredReport !== undefined) {
      return (
        <div>
          <Table striped bordered hover>
            <thead>
              <tr className='text-center'>
                <th>Date</th>
                <th>Transaction Number</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody className='text-center'>
              {filteredReport.length === 0 ?
                <tr>
                  <td colSpan={3}>
                    <Alert variant='warning'>
                      <strong>No Transaction to Report</strong>
                    </Alert>
                  </td>
                </tr>
                :
                <>{
                  filteredReport.map((sale, index) => {
                    return (
                      <tr key={index}>
                        <td>{moment(sale.Date).format('ll')}</td>
                        <td>{sale.ID}</td>
                        <td>{sale.Quantity}</td>
                      </tr>
                    )
                  })}
                </>

              }
              <tr>
                <td colSpan={2}><strong>Total</strong></td>
                <td><strong>{reportTotalSales} units</strong></td>
              </tr>
            </tbody>
          </Table >
        </div>
      )
    }
  }

  const handleDocChange = (doc) => {
    var tempStockcard = stockcard;
    stockcard.map((product, index)=>{
      if(product.id == doc)
      {
        setDocId(index)
      }
    })
  }



  return (
    <div>
      <UserRouter
      route='/stockcard'
      />
      <Navigation 
        page="/stockcard"/>

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

      <Tab.Container
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
        <div className="row contents">
          <div className="row py-4 px-5">
            <div className='sidebar'>
              <Card className='sidebar-card'>
                <Card.Header>
                  <div className='row'>
                    <div className="col-1 left-full-curve">
                      <Button className="fc-search no-click me-0">
                        <FontAwesomeIcon icon={faSearch} />
                      </Button>
                    </div>
                    <div className="col-11">
                      <FormControl
                        placeholder="Search"
                        aria-label="Search"
                        aria-describedby="basic-addon2"
                        className="fc-search right-full-curve mw-0"
                      />
                    </div>
                  </div>
                </Card.Header>
                <Card.Body style={{ height: "500px" }}>
                  <div className="row g-1 sidebar-header">
                    <div className="col-3 left-curve">
                      Item Code
                    </div>
                    <div className="col-7">
                      Description
                    </div>
                    <div className="col-2 right-curve">
                      Qty
                    </div>
                  </div>
                  <div className='scrollbar' style={{ height: '415px' }}>
                    {isFetched?
                      <>
                        {stockcard.length === 0 ?
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                            <h5 className="mb-3"><strong>No <span style={{color: '#0d6efd'}}>products</span> to show.</strong></h5>
                            <p className="d-flex align-items-center justify-content-center">
                              <span>Click the</span>
                              <Button
                                className="add ms-1 me-1 static-button no-click"
                              >
                                <FontAwesomeIcon icon={faPlus} />
                              </Button>
                              <span>
                                button to add one.
                              </span>
                            </p>
                          </div>
                          :
                          <ListGroup variant="flush">
                            {stockcard.map((stockcard) => {
                              return (
                                <ListGroup.Item
                                  action
                                  key={stockcard.id}
                                  eventKey={stockcard.id}
                                  onClick={() => { handleDocChange(stockcard.id) }}>
                                  <div className="row gx-0 sidebar-contents">
                                    <div className="col-3">
                                      {stockcard.id.substring(0, 9)}
                                    </div>
                                    <div className="col-7">
                                      {stockcard.description}
                                    </div>
                                    <div className="col-2">
                                      {stockcard.qty}
                                    </div>
                                  </div>
                                </ListGroup.Item>
                              )
                            })}
                          </ListGroup>
                        }
                      </>
                    :
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column p-5">
                        <Spinner 
                          color1="#b0e4ff"
                          color2="#fff"
                          textColor="rgba(0,0,0, 0.5)"
                          className="w-50 h-50"
                          />
                      </div>
                    }
                  </div>
                </Card.Body>
              </Card>
            </div>
            <div className="divider"></div>
            <div className='data-contents'>
              <Tab.Content>
                <Tab.Pane eventKey='main'>
                  <div className='row py-1 m-0 placeholder-content' id="product-contents">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Inventory</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                      <div className="col d-flex align-items-center">
                        <div className="me-2">
                          <InformationCircle
                            color={'#0d6efd'}
                            title={'Category'}
                            height="40px"
                            width="40px"
                          />
                        </div>
                        <div>
                          <h4 className="data-id"><strong><span className="col-12">IT000000</span></strong></h4>
                        </div>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <NewProductModal
                            show={modalShow}
                            onHide={() => setModalShow(false)}
                          />
                          <Button
                            className="add me-1"
                            data-title="Add New Product"
                            onClick={() => setModalShow(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          <EditProductModal
                            show={editShow}
                            onHide={() => setEditShow(false)}
                          />
                          <Button
                            className="edit me-1"
                            disabled
                            data-title="Edit Product"
                            onClick={() => setEditShow(true)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <DeleteProductModal
                            show={modalShowDL}
                            onHide={() => setModalShowDL(false)}
                          />
                          <Button
                            className="delete me-1"
                            disabled
                            data-title="Delete Product"
                            onClick={() => { setModalShowDL(true) }}>
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="row py-1 data-specs m-0 d-flex align-items-center" id="product-info">
                      <div id="message-to-select">
                        <div className="blur-overlay">
                          <div className="d-flex align-items-center justify-content-center" style={{width: '100%', height: '100%'}}>
                            <h5><strong>Select a product to get started</strong></h5>
                          </div>
                        </div>
                      </div>
                      <div className="col-3">
                        <div className="row m-0 p-0 d-flex align-items-center flex-column">
                          <div className="data-img mb-2  d-flex align-items-center justify-content-center">
                            <img src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fproduct-image-placeholder.png?alt=media&token=c29c223b-c9a1-4b47-af4f-c57a76b3e6c2" style={{width: '80%'}}/>
                          </div>
                          <a className="data-barcode">
                            <Barcode
                              className="barcode"
                              format="EAN13"
                              value="000000000000"
                              color="#c6d4ea"
                            />
                          </a>
                        </div>
                      </div>
                      <div className="col-9 py-3">
                        <div className="row mb-4">
                          <div className="col-12 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-1 data-icon d-flex align-items-center justify-content-center"
                                data-title="Product Description"
                              >
                                <Cube
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-11 data-label">
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-6 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Product Category"
                              >
                                <Grid
                                  color={'#00000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-10 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-6 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Classification"
                              >
                                <GitBranch
                                  color={'#00000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-10 data-label">
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-3 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-4 data-icon d-flex align-items-center justify-content-center"
                                data-title="Selling Price"
                              >
                                <Pricetag
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-8 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-3 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-4 data-icon d-flex align-items-center justify-content-center"
                                data-title="Purchase Price"
                              >
                                <Cart
                                  className="me-2"
                                  color={'#00000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-8 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-3 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-4 data-icon d-flex align-items-center justify-content-center"
                                data-title="Maximum Quantity"
                              >
                                <CaretUp
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-8 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-3 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-4 data-icon d-flex align-items-center justify-content-center"
                                data-title="Minimum Quantity"
                              >
                                <CaretDown
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-8 data-label">
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row mb-4"  id="product-info-qty">
                          <div className="col-4 px-1">
                            <div className="row m-0 p-0">
                              <div className="col-3 data-icon d-flex align-items-center justify-content-center">
                                <Layers
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </div>
                              <div className="col-9 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-4 px-1">
                            <div className="row m-0 p-0">
                              <div className="col-3 data-icon d-flex align-items-center justify-content-center">
                                <Enter
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </div>
                              <div className="col-9 data-label">
                              </div>
                            </div>
                          </div>
                          <div className="col-4 px-1">
                            <div className="row m-0 p-0">
                              <div className="col-3 data-icon d-flex align-items-center justify-content-center">
                              <Exit
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </div>
                              <div className="col-9 data-label">
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </Tab.Pane>
                {stockcard === undefined?
                  <></>
                :
                
                <Tab.Pane eventKey={stockcard[docId].id}>
                  <div className='row py-1 m-0' id="product-contents">
                    <div className='row m-0 p-0'>
                      <h1 className='text-center pb-2 module-title'>Inventory</h1>
                      <hr></hr>
                    </div>
                    <div className="row py-1 m-0">
                      <div className="col d-flex align-items-center">
                        <div className="me-2">
                          <InformationCircle
                            color={'#0d6efd'}
                            title={'Category'}
                            height="40px"
                            width="40px"
                          />
                        </div>
                        <div>
                          <h4 className="data-id"><strong>{stockcard === undefined?<></>:<>{stockcard[docId].id.substring(0,9)}</>}</strong></h4>
                        </div>
                      </div>
                      <div className="col">
                        <div className="float-end">
                          <Button
                            className="add me-1"
                            data-title="Add New Product"
                            onClick={() => setModalShow(true)}>
                            <FontAwesomeIcon icon={faPlus} />
                          </Button>
                          <Button
                            className="edit me-1"
                            data-title="Edit Product"
                            onClick={() => setEditShow(true)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            className="delete me-1"
                            disabled={purchaseFilteredResults.length>0?true:false}
                            data-title={totalPurchase>0?"Product Involved in Transactions":"Delete Product"}
                            onClick={() => { setModalShowDL(true) }}>
                            <FontAwesomeIcon icon={faTrashCan} />
                          </Button>
                          {purchaseFilteredResults.length>0?
                            <a
                            className="ms-2"
                            data-title="Product involved in transactions"
                            >
                            <FontAwesomeIcon icon={faCircleInfo}/>
                            </a>
                          :
                            <></>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="row py-1 data-specs m-0 d-flex" id="product-info">
                      <div className="col-3 py-3">
                        <div className="row m-0 p-0 d-flex justify-content-center flex-column">
                            {stockcard[docId].img == " " || stockcard[docId].img == "" || stockcard[docId].img === undefined?
                              <div className="data-img mb-2 d-flex align-items-center justify-content-center" style={{backgroundColor: '#f3f5f9'}}>
                                <div className="w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                                  <img src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Fproduct-image-placeholder.png?alt=media&token=c29c223b-c9a1-4b47-af4f-c57a76b3e6c2" style={{height: '50%', width: 'auto !important'}}/>
                                  <h6 className="text-center">No Image Uploaded</h6>
                                </div>
                              </div>
                            :
                              <div className="data-img mb-2 d-flex align-items-center justify-content-center">
                                <img key={stockcard[docId].img}src={stockcard[docId].img} style={{width: '100%'}}/>
                              </div>
                            }
                          <a className="data-barcode">
                            <div className="data-barcode-edit-container">
                              <div className="data-barcode-edit align-items-center justify-content-center">
                                
                                  <EditBarcodeModal
                                    show={barcodeModalShow}
                                    onHide={() => setBarcodeModalShow(false)}
                                  />
                                  <Button
                                    className=""
                                    data-title="Edit Barcode value"
                                    onClick={() => setBarcodeModalShow(true)}>
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Button>
                              </div>
                            </div>
                            {stockcard[docId].barcode == 0 || stockcard[docId].barcode === undefined?
                              <Alert className="text-center" variant="warning" style={{height: '5em', fontSize: '0.8em'}}>
                                <FontAwesomeIcon icon={faTriangleExclamation}/><span> Barcode Not Set</span>
                              </Alert>
                            :
                              <Barcode
                                className="barcode"
                                format="EAN13"
                                value={stockcard[docId].barcode}
                              />
                            }
                          </a>
                        </div>
                      </div>
                      <div className="col-9 py-3">
                        <div className="row mb-4">
                          <div className="col-12 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-1 data-icon d-flex align-items-center justify-content-center"
                                data-title="Product Description"
                              >
                                <Cube
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-11 data-label">
                                {stockcard[docId].description}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-6 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Classification"
                              >
                                <GitBranch
                                  color={'#00000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-10 data-label
                              key={productClassification}"
                              >
                              {stockcard[docId].classification === undefined || stockcard[docId].classification   == " " || stockcard[docId].classification  == ""?
                                  <div style={{fontStyle: 'italic', opacity: '0.8'}}>Not set</div>
                                :
                                  <>{stockcard[docId].classification }</>
                                }
                              </div>
                            </div>
                          </div>
                          <div className="col-6 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Product Category"
                              >
                                <Grid
                                  color={'#00000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-10 data-label">
                                {stockcard[docId].category }
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-6 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Selling Price"
                              >
                                <Pricetag
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-10 data-label">
                                &#8369; {(Math.round(stockcard[docId].p_price * 100) / 100).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div className="col-6 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-2 data-icon d-flex align-items-center justify-content-center"
                                data-title="Purchase Price"
                              >
                                <Cart
                                  className="me-2"
                                  color={'#00000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-10 data-label">
                                &#8369; {(Math.round(stockcard[docId].s_price * 100) / 100).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-6 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Maximum Quantity"
                              >
                                <CaretUp
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                                <Layers
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-9 data-label">
                                {stockcard[docId].max_qty  === undefined || stockcard[docId].max_qty == 0?
                                  <div style={{fontStyle: 'italic', opacity: '0.8'}}>Not set</div>
                                :
                                  <>{stockcard[docId].max_qty} units</>
                                }
                              </div>
                            </div>
                          </div>
                          <div className="col-6 px-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Minimum Quantity"
                              >
                                <CaretDown
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                                <Layers
                                  color={'#000000'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-9 data-label">
                                {stockcard[docId].min_qty === undefined || stockcard[docId].min_qty == 0?
                                  <div style={{fontStyle: 'italic', opacity: '0.8'}}>Not set</div>
                                :
                                  <>{stockcard[docId].min_qty} units</>
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr className="my-1" />
                        <div className="row mb-0" id="product-info-qty">
                          <div className="col-3 p-1 d-flex align-items-center justify-content-center">
                            <div className="row m-0 p-0">
                              <h5 style={{borderLeft: '8px solid #4973ff'}}>Stats:</h5>
                            </div>
                          </div>
                          <div className="col-3 p-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Total Quantity"
                              >
                                <Layers
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-9 data-label">
                                {stockcard[docId].qty}
                              </div>
                            </div>
                          </div>
                          <div className="col-3 p-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Total Quantity In"  
                              >
                                <Enter
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-9 data-label">
                                {totalPurchase}
                              </div>
                            </div>
                          </div>
                          <div className="col-3 p-1">
                            <div className="row m-0 p-0">
                              <a 
                                className="col-3 data-icon d-flex align-items-center justify-content-center"
                                data-title="Total Quantity Out"
                              >
                              <Exit
                                  color={'#0d6efd'}
                                  height="25px"
                                  width="25px"
                                />
                              </a>
                              <div className="col-9 data-label">
                                {totalSales}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                    <div className="folder-style">
                      <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
                        <Nav variant="pills" defaultActiveKey={1}>
                          <Nav.Item>
                            <Nav.Link eventKey={0}>
                                Lead Time
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link eventKey={1}>
                                Ledger
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                        <Tab.Content>
                          <Tab.Pane eventKey={1}>
                            <div className="row data-specs-add m-0">
                              <div className='row'>
                                <Card>
                                  <Card.Header className="bg-white">
                                    {tableHeaderBoolean === true ?
                                      reportTableHeaderFalse()
                                    :
                                      reportTableHeaderTrue()
                                    }
                                  </Card.Header>
                                  <Card.Body>
                                    {reportTable()}
                                  </Card.Body>
                                </Card>
                              </div>
                            </div>
                          </Tab.Pane>
                          <Tab.Pane eventKey={0}>
                            <div className="row py-1 m-0">
                              <div className="col">
                                <div>
                                  <InformationCircle
                                    color={'#0d6efd'}
                                    title={'Category'}
                                    height="40px"
                                    width="40px"
                                  />
                                </div>
                                <OverlayTrigger
                                  placement="right"
                                  delay={{ show: 250, hide: 400 }}
                                  overlay={leadTimeTooltip}
                                >
                                  <h4 className="data-id">ITEM LEADTIME</h4>
                                </OverlayTrigger>
                              </div>
                              <div className="col">
                                <div className="float-end">
                                  <EditLeadtimeModal
                                    show={leadtimeModalShow}
                                    onHide={() => setLeadtimeModalShow(false)}
                                  />
                                  <Button
                                    className="edit me-1"
                                    data-title="Edit Leadtime"
                                    onClick={() => setLeadtimeModalShow(true)}
                                  >
                                    <FontAwesomeIcon icon={faEdit} />
                                  </Button>
                                </div>
                              </div>
                            </div>
                              <div className='row'>
                                <div className='col-4 text-center'>
                                  <small>Minimum Leadtime</small>
                                </div>
                                <div className='col-4 text-center'>
                                  <small>Maximum Leadtime</small>
                                </div>
                                <div className='col-4 text-center'>
                                  <small>Average Leadtime</small>
                                </div>
                              </div>
                              <div className='row text-center mt-2'>
                                <div className="col-4">
                                  <div style={{ display: 'inline-block' }}>
                                    <h5><FontAwesomeIcon icon={faTruck} /></h5>
                                  </div>
                                  <div className="data-label sm">
                                    <small>{stockcard[docId].analytics_minLeadtime} day(s)</small>
                                  </div>
                                </div>
                                    <div className="col-4">
                                      <div style={{ display: 'inline-block' }}>
                                        <h5><FontAwesomeIcon icon={faTruck} /></h5>
                                      </div>
                                      <div className="data-label sm">
                                        <small>{stockcard[docId].analytics_maxLeadtime} day(s)</small>
                                      </div>
                                    </div>
                                    <div className="col-4">
                                      <div style={{ display: 'inline-block' }}>
                                        <h5><FontAwesomeIcon icon={faTruck} /></h5>
                                      </div>
                                      <div className="data-label sm">
                                        <small>{(stockcard[docId].analytics_maxLeadtime + stockcard[docId].analytics_minLeadtime) / 2} day(s)</small>
                                      </div>
                                    </div>
                                    <hr className='mt-2' />

                                  </div>
                          </Tab.Pane>
                        </Tab.Content>
                      </Tab.Container>
                    </div>
                  </div>
                </Tab.Pane>
                }
              </Tab.Content>
            </div>
          </div>
        </div>
      </Tab.Container >






    </div >
  );


}

export default StockcardPage;
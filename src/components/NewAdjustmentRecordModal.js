import React from "react";
import { Button, Form, Modal, Tab, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db, st } from "../firebase-config";
import { collection, updateDoc, onSnapshot, query, doc, setDoc, getDoc, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'

import { faPlus, faMinus, faUpload, faCheck, faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Spinner } from 'loading-animations-react';


function NewAdjustmentRecordModal(props) {





    //---------------------VARIABLES---------------------


    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [productIds, setProductIds] = useState([]); // array of prod id
    const [prodList, setProdList] = useState([])

    const [key, setKey] = useState('main');//Tab controller
    const [userCollection, setUserCollection] = useState([]);// userCollection variable
    const [userProfileID, setUserProfileID] = useState(""); // user profile id
    const userCollectionRef = collection(db, "user")// user collection
    const [adjustmentCounter, setAdjustmentCounter] = useState(0); // sales counter
    const [transactionIssuer, setTransactionIssuer] = useState("") // default purchaser in web

    const [newNote, setNewNote] = useState(""); // note form input
    const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
    const [items, setItems] = useState([]); // array of objects containing product information
    const [itemId, setItemId] = useState("IT999999"); //product id
    const [itemName, setItemName] = useState(""); //product description
    const [itemSPrice, setItemSPrice] = useState(0); //product Selling Price
    const [itemPPrice, setItemPPrice] = useState(0); //product Purchase Price
    const [itemQuantity, setItemQuantity] = useState(1); //product quantity
    const [itemCurrentQuantity, setItemCurrentQuantity] = useState(1); //product available stock
    const [newChecker, setNewChecker] = useState(""); // stockcardCollection variable
    const [stockcardDoc, setStockcardDoc] = useState({}); // stockcardCollection variable
    var curr = new Date()
    curr.setDate(curr.getDate());
    var today = moment(curr).format('YYYY-MM-DD')
    const [newDate, setNewDate] = useState(today); // stockcardCollection variable
    const [buttonBool, setButtonBool] = useState(true); //button disabler
    const [fileUpload, setFileUpload] = useState([]);
    const [fileUrls, setFileUrls] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadFinished, setUploadFinished] = useState(false);
    const [imageIndex, setImageIndex] = useState()
    const [reachedEnd, setReachedEnd] = useState(false)
    const [reachedStart, setReachedStart] = useState(false)

    //---------------------FUNCTIONS---------------------





    //set Product ids
    useEffect(() => {
        items.map((item) => {
            setProductIds([...productIds, item.itemId])
        })
    }, [items])


    //set Product ids
    useEffect(() => {
        setProdList()
        let arrObj = []
        if (items !== undefined) {
            items.map((prod) => {
                let person = {
                    itemId: prod.itemId,
                    itemName: prod.itemName,
                    itemPPrice: Number(prod.itemPPrice),
                    itemSPrice: Number(prod.itemSPrice),
                    itemQuantity: Number(prod.itemQuantity),
                    itemCurrentQuantity: Number(prod.itemCurrentQuantity),
                    itemNewQuantity: Number(prod.itemCurrentQuantity) + Number(prod.itemQuantity)
                }
                arrObj.push(person)
            })
        }
        setProdList(arrObj)
    }, [items])


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
            setAdjustmentCounter(metadata.adjustmentId)
            setUserProfileID(metadata.id)
            metadata.accounts.map((account)=>{
                if(account.isAdmin)
                {
                    setTransactionIssuer(account)
                }
            })
        });
    }, [userCollection])

    useEffect(() => {
        if(fileUrls.length > 0)
        {
          if(fileUrls.length != fileUpload.length) {
          }
          else
          {
            if(fileUrls.length == fileUpload.length)
            {
              setUploadFinished(true)
            }
            setUploading(false)
          }
        }
      })

    const filterFileUpload = (files) => {
        var valid_types= ['image/gif', 'image/jpeg', 'image/png', 'image/jpg'];
        var temp_file_list = []
        Array.from(files).map((file, index) => {
            if(valid_types.includes(file['type']))
            {
                temp_file_list.push(file)
            }
        })
        setFileUpload(temp_file_list)
    }

    useEffect(() => {
        console.log(fileUpload)
    })

    //Read stock card collection from database
    useEffect(() => {
        if (userID === undefined) {

            const collectionRef = collection(db, "stockcard")
            const q = query(collectionRef, where("user", "==", "DONOTDELETE"));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
        else {

            const collectionRef = collection(db, "stockcard")
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
    }, [userID])


    //Read and set data from stockcard document
    useEffect(() => {
        if (itemName != undefined) {

            const unsub = onSnapshot(doc(db, "stockcard", itemId), (doc) => {
                if (doc.data() != undefined) {
                    setItemName(doc.data().description)
                    setItemCurrentQuantity(doc.data().qty)
                    setItemSPrice(doc.data().s_price)
                    setItemPPrice(doc.data().p_price)
                }
            }, (error) => {
            });
        }
    }, [itemId])

    useEffect(() => {
        if (props.onHide) {
            clearFields()
        }
    }, [props.onHide])

    const clearFields = () => {
        setNewDate(today)
        setProductIds([])
        setItems([]);
        setNewNote("");
        setFileUpload([])
        setFileUrls([])
        setNewChecker([])
    }

    //----------------------Start of Dynamic form functions----------------------
    const addItem = event => {
        event.preventDefault();
        setItems([
            ...items,
            {
                itemId: itemId,
                itemName: itemName,
                itemPPrice: Number(itemPPrice),
                itemSPrice: Number(itemSPrice),
                itemQuantity: Number(itemQuantity),
                itemCurrentQuantity: Number(itemCurrentQuantity),
                itemNewQuantity: Number(itemCurrentQuantity) + Number(itemQuantity),
            }
        ]);
        setItemId("IT999999");
        setItemQuantity(1);
    };

    const handleItemRemove = (index) => {
        const list = [...items]
        list.splice(index, 1)
        setItems(list)
        const ids = [...productIds]
        ids.splice(index, 1)
        setProductIds(ids)
    }

    //ButtonDisabler
    useEffect(() => {
        if(
            itemId != "IT999999" && itemQuantity >= (itemCurrentQuantity * -1)
        ) {
            setButtonBool(false)
        }
        else {
            setButtonBool(true)
        }
    }, [itemQuantity, itemId])

    //----------------------End of Dynamic form functions----------------------


    //----------------------Start of addRecord functions----------------------

    const createFormat = () => {
        var format = adjustmentCounter + "";
        while (format.length < 5) { format = "0" + format };
        format = "AR" + format + '@' + userID;
        return format;
    }

    //add document to database
    const addRecord = async () => {
        setDoc(doc(db, "adjustment_record", createFormat()), {
            user: userID,
            notes: newNote + "",
            date: newDate,
            checker: newChecker,
            product_list: prodList,
            product_ids: productIds,
            encoder: transactionIssuer.name,
            proofs: fileUrls
        });
        //update stockcard.qty function
        updateQuantity()
        updateSalesDocNum() //update variables.salesDocNum function
        props.onHide()
    }

    //update stockcard.qty function
    function updateQuantity() {
        items.map((items) => {
            const stockcardRef = doc(db, "stockcard", items.itemId);
            updateDoc(stockcardRef, {
                qty: items.itemNewQuantity,
            });

        })
    }


    //update variables.salesDocNum function
    function updateSalesDocNum() {
        const userDocRef = doc(db, "user", userProfileID)
        const newData = { adjustmentId: Number(adjustmentCounter) + 1 }

        updateDoc(userDocRef, newData)
    }

    const uploadFile = () => {
        if (fileUpload == null) return;
        Array.from(fileUpload).map((file, index)=>{
          uploadBytes(ref(st, `${userID}/adjustment_record/${createFormat().substring(0,7)}-${index}`), file).then((snapshot) => {
            getDownloadURL(snapshot.ref).then((url) => {
              setFileUrls((prev) => [...prev, {name: file["name"], url: url}]);
            });
          });
        })

        setImageIndex(0)
        setReachedStart(true)
        if(fileUrls.length == 1)
        {
            setReachedEnd(true)
        }
        else
        {
            setReachedEnd(false)
        }

    };

    const changeImage = (action) => {
        var temp_image_index = imageIndex

        if(action == "next")
        {
            temp_image_index = temp_image_index + 1
        }
        else
        {
            temp_image_index = temp_image_index - 1
        }
        if(temp_image_index <= 0)
        {
            setImageIndex(0)
            setReachedStart(true)
        }
        else if(temp_image_index >= fileUrls.length - 1)
        {
            setImageIndex(fileUrls.length - 1)
            setReachedEnd(true)
        }
        else
        {
            setImageIndex(temp_image_index)
            setReachedStart(false)
            setReachedEnd(false)
        }
    }

    useEffect(() => {
        if(fileUrls === undefined || fileUrls.length == 0)
        {

        }
        else
        {
            setKey(fileUrls[0])
        }
    }, [fileUrls])
    //----------------------End of addRecord functions----------------------


    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])



    //access stockcard document
    useEffect(() => {
        async function readStockcardDoc() {
            const stockcardRef = doc(db, "stockcard", itemId)
            const docSnap = await getDoc(stockcardRef)
            if (docSnap.exists()) {
                setStockcardDoc(docSnap.data());
            }
        }
        readStockcardDoc()
    }, [itemId])


    return (
        <Modal
            {...props}
            size="xl"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="IMS-modal modal-xxl"
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

            <Modal.Body >
                <div className="px-3 py-2">
                    <div className="module-header mb-4">
                        <h3 className="text-center">Perform Inventory Adjustment</h3>
                    </div>
                    <div className="row">
                        <div className="col-3 px-3">
                            <div className="row my-2 mb-3">
                                <div className='col-12 ps-4'>
                                    <label>Transaction Number</label>
                                    <input 
                                        type="text"
                                        readOnly
                                        className="form-control shadow-none no-click"
                                        placeholder=""
                                        defaultValue={createFormat().substring(0, 7)}
                                    />
                                </div>
                            </div>
                            <div className="row my-2 mb-3">
                                <div className='col-12 ps-4'>
                                    <label>
                                        Date
                                        <span style={{color: '#b42525'}}> *</span>
                                    </label>
                                    <input
                                        type='date'
                                        required
                                        className="form-control shadow-none"
                                        max={today}
                                        value={newDate}
                                        onChange={e => setNewDate(e.target.value)}
                                    />
                                </div>
                            </div><div className="row my-2 mb-3">
                                <div className='col-12 ps-4'>
                                    <label>
                                        Checker
                                        <span style={{color: '#b42525'}}> *</span>
                                    </label>
                                    <input 
                                        type="text"
                                        required
                                        className="form-control shadow-none"
                                        placeholder=""
                                        value={newChecker}
                                        onChange={e => setNewChecker(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="row my-2 mb-3">
                                <div className='col-12 ps-4'>
                                    <label>Notes: (Optional)</label>
                                    <textarea
                                        className="form-control shadow-none"
                                        as="textarea"
                                        rows={4}
                                        onChange={(event) => { setNewNote(event.target.value); }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-6">

                        <div className="row h-100 mx-0 my-2 mb-3 p-3 item-adding-container align-items-start">
                                <div className="row m-0 p-0">
                                    <div className='col-12 text-center mb-2'>
                                        <h5><strong>Adjustment List</strong></h5>
                                        <div className="row p-0 m-0 py-1">
                                            <div className='col-9 p-1'>
                                                <select
                                                    className="form-select shadow-none"
                                                    value={itemId}
                                                    onChange={e => setItemId(e.target.value)}
                                                >
                                                    <option
                                                        value="IT999999">
                                                        Select Item
                                                    </option>
                                                    {stockcard.map((stockcard) => {
                                                        return (
                                                            <option
                                                                key={stockcard.id}
                                                                value={stockcard.id}
                                                            >{stockcard.description}</option>
                                                        )
                                                    })}
                                                </select>
                                            </div>
                                            <div className='col-2 p-1'>
                                                <input
                                                    className="form-control shadow-none"
                                                    placeholder='Quantity'
                                                    type='number'
                                                    value={itemQuantity}
                                                    min={itemCurrentQuantity*-1}
                                                    onChange={e => setItemQuantity(e.target.value)}
                                                />
                                            </div>
                                            <div className='col-1 p-1'>
                                                <Button
                                                    onClick={addItem}
                                                    disabled={buttonBool ? true : false}
                                                >
                                                    <FontAwesomeIcon icon={faPlus} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row p-0 m-0 py-1">
                                        <div className="col-12">
                                            <Table striped bordered hover size="sm">
                                                <thead>
                                                    <tr className='text-center bg-white'>
                                                        <th>Item ID</th>
                                                        <th>Item Description</th>
                                                        <th>Quantity</th>
                                                        <th>Remove</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map((item, index) => (
                                                        <tr
                                                            className='text-center'
                                                            key={index}>
                                                            <td>
                                                                {item.itemId === undefined ?
                                                                    <></>
                                                                    :
                                                                    <>
                                                                        {item.itemId.substring(0, 9)}
                                                                    </>
                                                                }
                                                            </td>
                                                            <td>{item.itemName}</td>
                                                            <td>{item.itemQuantity}</td>
                                                            <td>
                                                                <Button
                                                                    size='sm'
                                                                    variant="outline-danger"
                                                                    onClick={() => handleItemRemove(index)}>
                                                                    <FontAwesomeIcon icon={faMinus} />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-3 px-3">
                            <div className="row m-0 px-3 py-1">
                                <div className="col-12 px-0 my-2 text-center">
                                    Image Proof of Adjustment
                                </div>
                            </div>
                            <div className="row px-3 py-1">
                                <div className="col-10 m-0 p-1">
                                    <input type="file"
                                        id="requirement"
                                        className="form-control"
                                        multiple
                                        onChange={(event) => {
                                          filterFileUpload(event.target.files);
                                          setFileUrls([])
                                          setUploading(false);
                                          setUploadFinished(false);
                                        }}
                                      />
                                </div>
                                <div className="col-2 m-0 p-1">
                                      <Button
                                        type="button"
                                        className="form-control"
                                        data-title="Upload"
                                        disabled={fileUpload.length == 0 || uploading || uploadFinished}
                                        onClick={()=>{setUploadFinished(false);setUploading(true);uploadFile()}}
                                      >
                                        {uploading?
                                          <Spinner 
                                            color1="#fff"
                                            color2="#fff"
                                            textColor="rgba(0,0,0,0)"
                                            className="w-100 h-100 my-1"
                                          />
                                        :
                                        <>
                                          {uploadFinished?
                                              <FontAwesomeIcon icon={faCheck}/>
                                          :
                                            <FontAwesomeIcon icon={faUpload}/>
                                          }
                                        </>
                                        }
                                        </Button>
                                </div>
                            </div>
                            <div className="row h-75 px-3 py-1">
                                <div className="col-12 w-100 h-100 m-0 pe-0">
                                    <Tab.Container
                                        activeKey={key}
                                        onSelect={(k) => setKey(k)}
                                    >
                                        <div className="image-pagination">
                                            <Tab.Content>
                                                <Tab.Pane eventKey='main'>
                                                    <div className="row h-100 align-items-center justify-content-center flex-row">
                                                        <div className="col-1">
                                                            <FontAwesomeIcon icon={faCaretLeft}/>
                                                        </div>
                                                        <div className="col-10 h-100 ">
                                                            
                                                        </div>
                                                        <div className="col-1">
                                                            <FontAwesomeIcon icon={faCaretRight}/>
                                                        </div>
                                                    </div>
                                                    <div className="row h-100 align-items-center justify-content-center flex-row">
                                                        <div className="col-12 h-100 d-flex align-items-center justify-content-center">
                                                            No images uploaded yet
                                                        </div>
                                                    </div>
                                                </Tab.Pane>
                                                {fileUrls === undefined || fileUrls.length == 0 || imageIndex === undefined?
                                                    <></>
                                                :
                                                <Tab.Pane 
                                                    eventKey={fileUrls[imageIndex]}
                                                    style={{display: "inline-block", height: "100%"}}
                                                >
                                                    <div className="row py-3 h-100 align-items-center justify-content-center flex-row">
                                                        <div className="col-1">
                                                            <button
                                                                className={"plain-button " + (reachedStart?"no-click disabled":"")}
                                                                onClick={()=>{changeImage("prev")}}
                                                                style={reachedStart?{color: "#808080"}:{}}
                                                            >
                                                                <FontAwesomeIcon icon={faCaretLeft}/>
                                                            </button>
                                                        </div>
                                                        <div className="col-10 h-100 ">
                                                            <h6 className="text-center">{fileUrls[imageIndex].name}</h6>
                                                        </div>
                                                        <div className="col-1">
                                                            <button
                                                                className={"plain-button " + (reachedEnd?"no-click disabled":"")}
                                                                onClick={()=>{changeImage("next")}}
                                                            >
                                                                <FontAwesomeIcon icon={faCaretRight}/>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="row py-3 h-100 align-items-center justify-content-center flex-row">
                                                        <div className="col-12 h-100 d-flex align-items-center justify-content-center">
                                                            <img src={fileUrls[imageIndex].url} style={{height: 'auto', width: '100%', objectFit: "contain"}}/>;
                                                        </div>
                                                    </div>
                                                </Tab.Pane>

                                                }
                                            </Tab.Content>
                                        </div>
                                    </Tab.Container>
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
                    style={{ width: "6rem" }}
                    disabled={items.length === 0 || uploading || (newChecker === undefined || newChecker == "" || newChecker == " ")}
                    onClick={() => { addRecord() }}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );




}
export default NewAdjustmentRecordModal;
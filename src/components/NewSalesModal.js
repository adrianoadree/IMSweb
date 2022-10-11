import React from "react";
import { Button, Form, Modal, Table } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, updateDoc, onSnapshot, query, doc, setDoc, where } from "firebase/firestore";
import moment from "moment";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'

import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function NewSalesModal(props) {

    //---------------------VARIABLES---------------------


    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [productIds, setProductIds] = useState([]); // array of prod id
    
    const [userCollection, setUserCollection] = useState([]);// userCollection variable
    const [userProfileID, setUserProfileID] = useState(""); // user profile id
    const userCollectionRef = collection(db, "user")// user collection
    const [salesCounter, setSalesCounter] = useState(0); // purchase counter

    const [newNote, setNewNote] = useState(""); // note form input
    const [varRef, setVarRef] = useState([]); // variable collection
    const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
    const [items, setItems] = useState([]); // array of objects containing product information
    const [itemId, setItemId] = useState("IT999999"); //product id
    const [itemName, setItemName] = useState(""); //product description
    const [itemSPrice, setItemSPrice] = useState(0); //product Selling Price
    const [itemPPrice, setItemPPrice] = useState(0); //product Purchase Price
    const [itemQuantity, setItemQuantity] = useState(1); //product quantity
    const [itemCurrentQuantity, setItemCurrentQuantity] = useState(1); //product available stock
    const [newDate, setNewDate] = useState(new Date()); // stockcardCollection variable
    const [buttonBool, setButtonBool] = useState(true); //button disabler




    //---------------------FUNCTIONS---------------------

    //set Product ids
    useEffect(() => {
        items.map((item) => {
            setProductIds([...productIds, item.itemId])
        })
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
            setSalesCounter(metadata.salesId)
            setUserProfileID(metadata.id)
        });
      }, [userCollection])

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
            const q = query(collectionRef, where("user", "==", userID), where("qty", ">=", 1));

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
                if(doc.data() != undefined) {
                    setItemName(doc.data().description)
                    setItemCurrentQuantity(doc.data().qty)
                    setItemSPrice(doc.data().s_price)
                    setItemPPrice(doc.data().p_price)
                }
            }, (error) => {
            });
        }
    }, [itemId])

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
                itemNewQuantity: Number(itemCurrentQuantity) - Number(itemQuantity)
            }
        ]);
        setItemId("IT999999");
        setItemQuantity(1);
    };

    const handleItemRemove = (index) => {
        const list = [...items]
        list.splice(index, 1)
        setItems(list)
    }

    //ButtonDisabler
    useEffect(() => {
        if (itemId != "IT999999" && itemQuantity <= itemCurrentQuantity && itemQuantity > 0) {
            setButtonBool(false)
        }
        else {
            setButtonBool(true)
        }
    }, [itemQuantity])
    //ButtonDisabler
    useEffect(() => {
        if (itemId != "IT999999" && itemQuantity <= itemCurrentQuantity && itemQuantity > 0) {
            setButtonBool(false)
        }
        else {
            setButtonBool(true)
        }
    }, [itemId])

    //----------------------End of Dynamic form functions----------------------


    //----------------------Start of addRecord functions----------------------

    const createFormat = () => {
        var format = salesCounter + "";
        while(format.length < 5) {format = "0" + format};
        format = "SR" + format + '@' + userID;
        return format;
     }

    //add document to database
    const addRecord = async () => {
        setDoc(doc(db, "sales_record", createFormat()), {
            user: userID,
            transaction_number: createFormat().substring(0,7),
            transaction_note: newNote,
            transaction_date: newDate,
            product_list: items,
            product_ids: productIds
            
        });

        setProductIds([])
        setItems([]);
        setNewNote("");
        updateQuantity()  //update stockcard.qty function
        updatePurchDocNum() //update variables.salesDocNum function
        successToast() //display success toast
        props.onHide()
    }

    //update stockcard.qty function
    function updateQuantity() {
        items.map((items) => {

            const stockcardRef = doc(db, "stockcard", items.itemId);

            // Set the "capital" field of the city 'DC'
            updateDoc(stockcardRef, {
                qty: items.itemNewQuantity
            });

        })
    }

    //update variables.salesDocNum function
    function updatePurchDocNum(salesDocNum) {
        const userDocRef = doc(db, "user", userProfileID)
        const newData = { purchaseId: Number(salesCounter) + 1 }

        updateDoc(userDocRef, newData)
    }

    //success toastify
    const successToast = () => {
        toast.success('Sales Transaction Successfully Recorded!', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }

    //----------------------End of addRecord functions----------------------


    useEffect(() => {
        if (user) {
            setUserID(user.uid)
        }
    }, [{ user }])


    //current date
    useEffect(() => {
        newDate.setDate(newDate.getDate());
        setNewDate(newDate.toISOString().substring(0, 10))

    }, [])



    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="IMS-modal"
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
                        <h3 className="text-center">Generate a Purchase Record</h3>
                    </div>
                    <div className="row my-2 mb-3">
                        <div className='col-3 ps-4'>
                            <label>Transaction Number</label>
                            <input type="text"
                                readOnly
                                className="form-control shadow-none no-click"
                                placeholder=""
                                defaultValue={createFormat().substring(0,7)}
                            />
                        </div>
                        <div className='col-4 ps-4'>
                            <label>Transaction Date</label>
                            <input
                                type='date'
                                className="form-control shadow-none"
                                value={newDate}
                                onChange={e => setNewDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="row my-2 mb-3">
                        <div className='col-12 ps-4'>
                            <label>Notes: (Optional)</label>
                            <textarea
                                className="form-control shadow-none"
                                as="textarea"
                                rows={1}
                                onChange={(event) => { setNewNote(event.target.value); }}
                            />
                        </div>
                    </div>
                    <div className="row my-2 mb-3 p-3 item-adding-container">
                        <div className="row m-0 p-0">
                            <div className='col-12 text-center mb-2'>
                                <h5><strong>Sales List</strong></h5>
                                    <div className="row p-0 m-0 py-1">
                                        <div className='col-6 p-1'>
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
                                        <div className='col-4 p-1'>
                                            <input
                                                className="form-control shadow-none"
                                                placeholder='Quantity'
                                                type='number'
                                                value={itemQuantity}
                                                min={1}
                                                max={itemCurrentQuantity}
                                                onChange={e => setItemQuantity(e.target.value)}
                                            />
                                        </div>
                                        <div className='col-2 p-1'>
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
                                                    <td>{item.itemId}</td>
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
                    disabled={items.length === 0 ? true : false}
                    onClick={() => { addRecord() }}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );




}
export default NewSalesModal;
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { setDoc, collection, onSnapshot, query, doc, updateDoc, where } from "firebase/firestore";
import { Modal, Button, Form, Table } from "react-bootstrap";
import moment from "moment";
import { Warning } from 'react-ionicons'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { UserAuth } from '../context/AuthContext'

import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NewSupplierModal from '../components/NewSupplierModal'


function NewPurchaseModal2(props) {


    //---------------------VARIABLES---------------------


    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [newNote, setNewNote] = useState(""); // note form input
    const [productIds, setProductIds] = useState([]); // array of prod id

    const [userCollection, setUserCollection] = useState([]);// userCollection variable
    const [userProfileID, setUserProfileID] = useState(""); // user profile id
    const userCollectionRef = collection(db, "user")// user collection
    const [purchaseCounter, setPurchaseCounter] = useState(0); // purchase counter

    const [varRef, setVarRef] = useState([]); // variable collection
    const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
    const [supplierCol, setSupplierCol] = useState([]); // stockcardCollection variable
    const [supplierModalShow, setSupplierModalShow] = useState(false); //add new sales record modal

    const [items, setItems] = useState([]); // array of objects containing product information
    const [itemId, setItemId] = useState("IT999999"); //product id
    const [itemName, setItemName] = useState(""); //product description
    const [itemSupplier, setItemSupplier] = useState(""); //product description
    const [itemSPrice, setItemSPrice] = useState(0); //product Selling Price
    const [itemPPrice, setItemPPrice] = useState(0); //product Purchase Price
    const [itemQuantity, setItemQuantity] = useState(1); //product quantity
    const [itemCurrentQuantity, setItemCurrentQuantity] = useState(1); //product available stock
    const [newDate, setNewDate] = useState(new Date()); // stockcardCollection variable


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
            setPurchaseCounter(metadata.purchaseId)
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
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [userID])


    //Read supplier collection from database
    useEffect(() => {
        if (userID === undefined) {

            const collectionRef = collection(db, "supplier")
            const q = query(collectionRef, where("user", "==", "DONOTDELETE"));

            const unsub = onSnapshot(q, (snapshot) =>
                setSupplierCol(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }
        else {

            const collectionRef = collection(db, "supplier")
            const q = query(collectionRef, where("user", "==", userID));

            const unsub = onSnapshot(q, (snapshot) =>
                setSupplierCol(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            );
            return unsub;
        }

    }, [userID])



    //Read and set data from stockcard document
    useEffect(() => {
        if (itemName != undefined) {
            const unsub = onSnapshot(doc(db, "stockcard", itemId), (doc) => {
                setItemName(doc.data().description)
                setItemCurrentQuantity(doc.data().qty)
                setItemSPrice(doc.data().s_price)
                setItemPPrice(doc.data().p_price)
            });
        }
    }, [itemId])


    //----------------------Start of Dynamic form functions----------------------
    const handleSupplierSelect = (value) => {
        if (value == "add-supplier") {
            setSupplierModalShow(true)
        }
        else
        {
            setItemSupplier(value)
        }
    }
    
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
                itemNewQuantity: Number(itemCurrentQuantity) + Number(itemQuantity)
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

    //----------------------End of Dynamic form functions----------------------


    //----------------------Start of addRecord functions----------------------

    //create format
    const createFormat = () => {
        var format = purchaseCounter + "";
        while(format.length < 5) {format = "0" + format};
        format = "PR" + format + '@' + userID;
        return format;
     }

    //add document to database
    const addRecord = async () => {
        setDoc(doc(db, "purchase_record", createFormat()), {
            user: userID,
            transaction_number: createFormat().substring(0,7),
            transaction_note: newNote,
            transaction_date: newDate,
            transaction_supplier: itemSupplier,
            product_list: items,
            product_ids: productIds
        });

        setItemSupplier("0")
        setProductIds([])
        setItems([]);
        setNewNote("");
        updateQuantity()  //update stockcard.qty function
        updatePurchDocNum() //update variables.purchDocNum function
        successToast() //display success toast

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

    //update variables.purchDocNum function
    function updatePurchDocNum() {
        const userDocRef = doc(db, "user", userProfileID)
        const newData = { purchaseId: Number(purchaseCounter) + 1 }

        updateDoc(userDocRef, newData)
    }

    //success toastify
    const successToast = () => {
        toast.success('Purchase Transaction Successfully Recorded!', {
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
                        <div className='col-5 ps-4'>
                            <NewSupplierModal
                                show={supplierModalShow}
                                onHide={() => setSupplierModalShow(false)}
                                />
                            <label>Supplier Name</label>
                            <div className="d-flex justify-content-center">
                                <select className="form-select shadow-none"
                                    value={itemSupplier}
                                    onChange={e => handleSupplierSelect(e.target.value)}>
                                    <option
                                        value="0">
                                        Select Supplier
                                    </option>
                                    <option
                                        value="add-supplier"
                                        className style={{fontStyle: 'italic'}}>
                                        Not on the list? Add a supplier
                                    </option>
                                    {supplierCol.map((supplier) => {
                                        return (
                                            <option
                                                key={supplier.supplier_name}
                                                value={supplier.supplier_name}
                                            >
                                                {supplier.supplier_name}
                                            </option>
                                                )
                                    })}
                                </select>
                            </div>
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
                    <div className="row my-2 mb-3">
                    <div className='row'>
                        <h5>Add Item to List</h5>
                            <hr></hr>
                            <div className='col-6 p-1'>
                                <Form.Select
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
                                </Form.Select>
                            </div>
                            <div className='col-4 p-1'>
                                <Form.Control
                                    placeholder='Quantity'
                                    type='number'
                                    value={itemQuantity}
                                    onChange={e => setItemQuantity(e.target.value)}
                                />

                            </div>
                            <div className='col-2 p-1'>
                                <Button
                                    onClick={addItem}
                                    disabled={itemId === "IT999999" ? true : false}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </Button>
                            </div>
                        </div>

                        <div className='row mt-4'>
                            <h5>Purchase List</h5>
                            <hr></hr>

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
                    onClick={() => { addRecord(varRef.purchDocNum) }}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );



}

export default NewPurchaseModal2;
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { setDoc, collection, onSnapshot, query, doc, updateDoc, where } from "firebase/firestore";
import { Modal, Button, Form, Table } from "react-bootstrap";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { UserAuth } from '../context/AuthContext'

import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NewSupplierModal from '../components/NewSupplierModal'


function NewPurchaseModal(props) {


    //---------------------VARIABLES---------------------


    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [newNote, setNewNote] = useState(""); // note form input
    const [productIds, setProductIds] = useState([]); // array of prod id

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


    //fetch variable collection
    useEffect(() => {
        items.map((item) => {
            setProductIds([...productIds, item.itemId])
        })
    }, [items])

    //fetch variable collection
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "variables", "var"), (doc) => {
            setVarRef(doc.data());
        });
        return unsub;
    }, [])


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

    //fetch variable collection
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "variables", "var"), (doc) => {
            setVarRef(doc.data());
        });
        return unsub;
    }, [])


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

    //add document to database
    const addRecord = async (purchDocNum) => {
        setDoc(doc(db, "purchase_record", "PR" + Number(purchDocNum)), {
            user: userID,
            transaction_number: "PR" + Number(purchDocNum),
            transaction_note: newNote,
            transaction_date: newDate,
            transaction_supplier: itemSupplier,
            product_list: items,
            product_ids: productIds
        });
        setProductIds([])
        setItems([]);
        setNewNote("");
        updateQuantity()  //update stockcard.qty function
        updatePurchDocNum(purchDocNum) //update variables.purchDocNum function
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
    function updatePurchDocNum(purchDocNum) {
        const varColRef = doc(db, "variables", "var")
        const newData = { purchDocNum: Number(purchDocNum) + 1 }

        updateDoc(varColRef, newData)
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
                <Modal.Title id="contained-modal-title-vcenter" className="px-3">
                    Add Purchase Record
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-5">
                <div className='row'>
                    <div className='row'>
                        <div className='col-6'>
                            <Form.Group className="mb-3">
                                <Form.Label>Transaction Number</Form.Label>
                                <Form.Control
                                    defaultValue={varRef.purchDocNum}
                                    disabled
                                />
                            </Form.Group>
                        </div>
                        <div className='col-6'>
                            <Form.Group className="mb-3">
                                <Form.Label>Transaction Date</Form.Label>
                                <Form.Control
                                    type='date'
                                    value={newDate}
                                    onChange={e => setNewDate(e.target.value)}
                                />
                            </Form.Group>
                        </div>
                    </div>


                    <div className='row'>
                        <div className='col-6'>
                            <Form.Group className="mb-3">
                                <Form.Label>Supplier</Form.Label>
                                <Form.Select
                                    value={itemSupplier}
                                    onChange={e => setItemSupplier(e.target.value)}
                                >
                                    <option
                                        value="0">
                                        Select Supplier
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
                                </Form.Select>
                            </Form.Group>
                        </div>
                        <div className='col-6'>
                            <Form.Group className="mb-3">
                                <Form.Label className="text-muted">Supplier not on the list?</Form.Label><br />
                                <NewSupplierModal
                                    show={supplierModalShow}
                                    onHide={() => setSupplierModalShow(false)}
                                />
                                <Button
                                    variant="outline-primary"
                                    onClick={() => setSupplierModalShow(true)}
                                >
                                    New Supplier
                                </Button>
                            </Form.Group>
                        </div>
                    </div>




                    <div className='row'>

                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Note: (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                onChange={(event) => { setNewNote(event.target.value); }}
                            />
                        </Form.Group>
                    </div>

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

            </Modal.Body>
            <Modal.Footer>
                <Modal.Footer>
                    <Button
                        style={{ width: "150px" }}
                        variant="success"
                        disabled={items.length === 0 ? true : false}
                        onClick={() => { addRecord(varRef.purchDocNum) }}
                    >
                        Save
                    </Button>
                </Modal.Footer>
            </Modal.Footer>
        </Modal>
    );



}

export default NewPurchaseModal;
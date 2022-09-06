import React from 'react';
import { Table, Form, Button, ListGroup } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, onSnapshot, query, where, doc, updateDoc, setDoc } from 'firebase/firestore';
import moment from 'moment';
import "react-toastify/dist/ReactToastify.css";
import { UserAuth } from '../context/AuthContext'

import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


function TestPage() {

    //---------------------VARIABLES---------------------

    const [buttonBool, setButtonBool] = useState(true); // note form input







    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [newNote, setNewNote] = useState(""); // note form input

    const [varRef, setVarRef] = useState([]); // variable collection
    const [stockcard, setStockcard] = useState([]); // stockcardCollection variable
    const [items, setItems] = useState([]); // array of objects containing product information
    const [itemId, setItemId] = useState("IT999999"); //product id
    const [itemName, setItemName] = useState(""); //product description
    const [itemQuantity, setItemQuantity] = useState(1); //product quantity
    const [itemCurrentQuantity, setItemCurrentQuantity] = useState(1); //product available stock
    const [newDate, setNewDate] = useState(new Date()); // stockcardCollection variable




    //---------------------FUNCTIONS---------------------

    //buttonBool
    useEffect(() => {
        if (itemQuantity <= itemCurrentQuantity && itemId != "IT999999" && itemQuantity != 0) {
            setButtonBool(false)
        }
        else {
            setButtonBool(true)
        }
    }, [itemQuantity])

    //buttonBool
    useEffect(() => {
        if (itemQuantity <= itemCurrentQuantity && itemId != "IT999999" && itemQuantity != 0) {
            setButtonBool(false)
        }
        else {
            setButtonBool(true)
        }
    }, [itemId])

    

    

    //fetch variable collection
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "variables", "var"), (doc) => {
            setVarRef(doc.data());
        });
        return unsub;
    }, [])


    //Read stock card collection from database
    useEffect(() => {
        const collectionRef = collection(db, "stockcard");
        const q = query(collectionRef, where("qty", ">=", 1));

        const unsub = onSnapshot(q, (snapshot) =>
            setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
    }, [])


    //Read and set data from stockcard document
    useEffect(() => {
        if (itemName != undefined) {
            const unsub = onSnapshot(doc(db, "stockcard", itemId), (doc) => {
                setItemName(doc.data().description)
                setItemCurrentQuantity(doc.data().qty)
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

    //----------------------End of Dynamic form functions----------------------


    //----------------------Start of addRecord functions----------------------

    //add document to database
    const addRecord = async (salesDocNum) => {
        setDoc(doc(db, "sales_record", "SR" + Number(salesDocNum)), {
            user: userID,
            transaction_number: "SR" + Number(salesDocNum),
            transaction_note: newNote,
            transaction_date: newDate,
            product_list: items,
        });

        setItems([]);
        setNewNote("");
        updateQuantity()  //update stockcard.qty function
        updatePurchDocNum(salesDocNum) //update variables.salesDocNum function
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
        const varColRef = doc(db, "variables", "var")
        const newData = { salesDocNum: Number(salesDocNum) + 1 }

        updateDoc(varColRef, newData)
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


    useEffect(() => {
        console.log(items)
    }, [items])

    useEffect(() => {
        console.log(itemName)
    }, [itemName])







    return (

        <div className="row bg-light">
            <Navigation />

            <div className='row'>
                <div className='col-6 p-5'>
                    <div className='row'>
                        <div className='col-6'>
                            <Form.Group className="mb-3">
                                <Form.Label>Transaction Number</Form.Label>
                                <Form.Control
                                    defaultValue={varRef.salesDocNum}
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

                    <div className='row mt-4'>
                        <div className='col-10'></div>
                        <div className='col-2'>
                            <Button
                                variant="success"
                                disabled={items.length === 0 ? true : false}
                                onClick={() => { addRecord(varRef.salesDocNum) }}
                            >
                                Save
                            </Button>
                        </div>
                    </div>

                </div>

                <div className='col-6 p-5'>
                    <h1>productList Values: </h1>
                    <div>


                    </div>



                </div>

            </div>

        </div >
    )

}

export default TestPage;
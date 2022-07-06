import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { addDoc, collection,arrayUnion,updateDoc, onSnapshot,query } from "firebase/firestore";


function NewSalesModal(props) {

    const [setModalShow] = React.useState(false);
    const [stockcard, setStockcard] = useState([]);


    const salesRecordCollectionRef = collection(db, "sales_record")

    const [newDocumentNumber, setNewDocumentNumber] = useState(0);
    const [newNote, setNewNote] = useState("");
    const [newDate, setNewDate] = useState(new Date());
    const [newProductName, setNewProductName] = useState([""]);
    const [newQuanity, setNewProductQuantity] = useState(0);


    //add document to database
    const addRecord = async () => {
        await addDoc(salesRecordCollectionRef,
            {
                document_number: Number(newDocumentNumber),
                document_date: newDate,
                document_note: newNote,
            });
        await updateDoc(salesRecordCollectionRef, {
            soldProd: arrayUnion({ newProductName,product_quantity: Number(newQuanity)
            })
        });
        setNewDocumentNumber(newDocumentNumber+1);
        setModalShow(false)
        alert('Successfuly Added to the Database')
    }



    //read collection from stockcard
    useEffect(() => {

        const stockcardCollectionRef = collection(db, "stockcard")
        const q = query(stockcardCollectionRef);
    
        const unsub = onSnapshot(q, (snapshot) =>
        setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
    
        return unsub;
    }, [])

    var curr = new Date();
    curr.setDate(curr.getDate());
    var date = curr.toISOString().substr(0, 10);

    //Dynamic Button data variable
    const [itemNameList, setItemNameList] = useState([
        { itemName: "" }
    ]);

    //Modal dynamic AddButton
    const handleItemAdd = () => {
        setItemNameList([...itemNameList, { itemName: "" }])
    }

    //Modal dynamic Remove Button
    const handleItemRemove = (index) => {
        const list = [...itemNameList];
        list.splice(index, 1);
        setItemNameList(list)
    }




    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter" className="px-3">
                    Add Sales Record
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-5">
                <div className="row mt-2">
                    <div className="col-8">
                        <label>Document Number</label>
                        <input
                            disabled
                            type="number"
                            className="form-control"
                            placeholder="Document Number"
                            value={newDocumentNumber+1}
                            onChange={(event) => { setNewDocumentNumber(event.target.value); }} />
                    </div>
                    <div className="col-4">
                        <label>Date</label>
                        <input
                            className="form-control"
                            type="date"
                            defaultValue={date}
                            placeholder="Date"
                            onChange={(event) => { setNewDate(event.target.value); }}
                        />
                    </div>
                </div>
                <div className="row mt-2">
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Note: (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            onChange={(event) => { setNewNote(event.target.value); }}
                        />
                    </Form.Group>
                </div>

                <h5>Products</h5>
                <hr></hr>
                <div className="row">
                    <div>
                        {itemNameList.map((singleItem, index) => (
                            <div key={index} className="row">
                                <div className="col-7">
                                    <Form.Select
                                        defaultValue="0"
                                        className="mt-2" >
                                        <option
                                            value="0"
                                            disabled>
                                            Select item
                                        </option>
                                        {stockcard.map((stockcard) => {
                                            return (
                                                <option
                                                    key={stockcard.product_name}
                                                    value={stockcard.product_name}
                                                    onChange={(event) => { setNewProductName(event.target.value); }}>
                                                  {stockcard.product_name} Available Stock: {stockcard.quantity} 
                                                </option>
                                            )
                                        })}
                                    </Form.Select>
                                    {itemNameList.length - 1 === index && itemNameList.length < 20 &&
                                        (
                                            <Button
                                                variant="outline-primary"
                                                type="button"
                                                className="add-btn mt-2"
                                                onClick={handleItemAdd}>
                                                Add Item
                                            </Button>
                                        )}
                                </div>
                                <div className="col-3 mt-2">
                                    <input
                                        type="number"
                                        min={1}
                                        className="form-control"
                                        placeholder="Quantity"
                                        onChange={(event) => { setNewProductQuantity(event.target.value); }}
                                    />
                                </div>
                                <div className="col-2 mt-2">
                                    {itemNameList.length > 1 &&
                                        (
                                            <Button
                                                variant="outline-danger"
                                                className="remove-btn"
                                                onClick={() => handleItemRemove(index)}>
                                                Remove
                                            </Button>
                                        )}
                                </div>

                            </div>
                        ))}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    className="btn btn-success"
                    style={{ width: "150px" }}
                    onClick={addRecord}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );




}
export default NewSalesModal;
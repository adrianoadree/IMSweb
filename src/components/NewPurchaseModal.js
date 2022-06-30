import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { getDocs, addDoc, collection } from "firebase/firestore";

function NewPurchaseModal(props) {

    const [setModalShow] = React.useState(false);


    const [stockcard, setStockcard] = useState([]);

    const purchaseRecordCollectionRef = collection(db, "purchase_record")
    const stockcardCollectionRef = collection(db, "stockcard")

    //data variable declaration
    const [newDocumentNumber, setNewDocumentNumber] = useState(0);
    const [newNote, setNewNote] = useState("");
    const [newDate, setNewDate] = useState(new Date());
    const [newProductName, setNewProductName] = useState("");
    const [newQuanity, setNewProductQuantity] = useState(0);

    //add document to database
    const addRecord = async () => {
        await addDoc(purchaseRecordCollectionRef, { document_number: Number(newDocumentNumber), document_date: newDate, document_note: newNote, product_name: newProductName, product_quantity: Number(newQuanity) });
        setModalShow(false)
        alert('Successfuly Added to the Database')
    }

    //read collection from stockcard
    useEffect(() => {
        const getStockcard = async () => {
            const data = await getDocs(stockcardCollectionRef);
            setStockcard(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        };
        getStockcard()
        console.log("Purchase modal: read stockcard collection")

    }, [])

    var curr = new Date();
    curr.setDate(curr.getDate());
    var date = curr.toISOString().substr(0, 10);




    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter" className="px-3">
                    Add Purchase Record
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-5">
            <div className="row mt-2">
                    <div className="col-6">
                        <label>Product Name</label>
                        <Form.Select
                            defaultValue="0"
                            aria-label="Default select example"
                            required
                            onChange={(event) => { setNewProductName(event.target.value); }}>
                            <option
                                disabled
                                value="0">
                                Select Product
                            </option>
                            {stockcard.map((stockcard) => {
                                return (
                                    <option
                                        value={stockcard.product_name}>
                                        {stockcard.product_name}
                                    </option>
                                )
                            })}
                        </Form.Select>

                    </div>
                    <div className="col-4">
                        <label>Quantity</label>
                        <input className="form-control"
                            type="number"
                            min={1}
                            placeholder="Quantity"
                            onChange={(event) => { setNewProductQuantity(event.target.value); }}
                        />
                    </div>
                </div>
                <hr/>
                <div className="row mt-2">
                    <div className="col-8">
                        <label>Document Number</label>
                        <input type="text" className="form-control" placeholder="Document Number" onChange={(event) => { setNewDocumentNumber(event.target.value); }} />
                    </div>
                    <div className="col-4">
                        <label>Date</label>
                        <input className="form-control"
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
                            rows={2}
                            onChange={(event) => { setNewNote(event.target.value); }}
                        />
                    </Form.Group>
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

export default NewPurchaseModal;
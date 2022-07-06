import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { addDoc, collection, query, onSnapshot,where,doc,updateDoc } from "firebase/firestore";

function NewPurchaseModal(props) {

    const [setModalShow] = useState(false);


    const [stockcard, setStockcard] = useState([]);
    const [supplier, setSupplier] = useState([]);


    const purchaseRecordCollectionRef = collection(db, "purchase_record")
    const purchaseRecordCounterRef = doc(db, "purchase_record", "Dontdelete")


    //data variable declaration
    const [newDocumentNumber, setNewDocumentNumber] = useState(0);
    const [newNote, setNewNote] = useState("");
    const [newDate, setNewDate] = useState(new Date());
    const [newProductName, setNewProductName] = useState("");
    const [newSupplierName, setNewSupplierName] = useState("");
    const [newQuanity, setNewProductQuantity] = useState(0);
    const [docNumberCounter, setDocNumberCounter] = useState(0);



    onSnapshot(purchaseRecordCounterRef, (doc) => {
        setDocNumberCounter(doc.data().docnumbercounter)
      }, [])



    //add document to database
    const addRecord = async () => {
        await addDoc(purchaseRecordCollectionRef, {
            document_number: Number(newDocumentNumber),
            document_date: newDate,
            document_note: newNote,
            product_name: newProductName,
            product_supplier: newSupplierName,
            product_quantity: Number(newQuanity)

        });
        setDocNumberCounter(docNumberCounter + 1);
        await updateDoc(purchaseRecordCounterRef, {
            docnumbercounter: docNumberCounter
          });
        setModalShow(false)
        alert('Successfuly Added to the Database')
    }

    //read supplier collection
    useEffect(() => {
        const supplierCollectionRef = collection(db, "supplier")
        const q = query(supplierCollectionRef);

        const unsub = onSnapshot(q, (snapshot) =>
            setSupplier(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );

        return unsub;
    }, [])

    //read collection from stockcard
    useEffect(() => {
        const stockcardCollectionRef = collection(db, "stockcard")
        const q = query(stockcardCollectionRef, where("product_supplier" , "==", newSupplierName));

        const unsub = onSnapshot(q, (snapshot) =>
            setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;

    }, [newSupplierName])





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
                        <label>Supplier Name</label>
                        <Form.Select
                            defaultValue="0"
                            aria-label="Default select example"
                            required
                            onChange={(event) => { setNewSupplierName(event.target.value); }}
                        >
                            <option
                                disabled
                                value="0">
                                Select Supplier
                            </option>
                            {supplier.map((supplier) => {
                                return (
                                    <option
                                        key={supplier.supplier_name}
                                        value={supplier.supplier_name}>
                                        {supplier.supplier_name}
                                    </option>
                                )
                            })}
                        </Form.Select>

                    </div>

                </div>
                <div className="row mt-4">
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
                                        key={stockcard.product_name}
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
                <hr />
                <div className="row mt-2">
                    <div className="col-8">
                        <label>Document Number</label>
                        <input 
                        type="number" 
                        className="form-control" 
                        disabled
                        value={docNumberCounter}
                        onChange={(event) => { setNewDocumentNumber(event.target.value); }} />
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
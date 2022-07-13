import React from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { addDoc, collection, arrayUnion, updateDoc, onSnapshot, query } from "firebase/firestore";


function NewSalesModal(props) {

    const [setModalShow] = React.useState(false);
    const [purchRecord, setPurchRecord] = useState([]);



    const [newDocumentNumber, setNewDocumentNumber] = useState(0);
    const [newNote, setNewNote] = useState("");
    const [newDate, setNewDate] = useState(new Date());

    //add document to database
    const addRecord = async () => {
        const salesRecordCollectionRef = collection(db, "sales_record")
        await addDoc(salesRecordCollectionRef,
            {
                document_number: Number(newDocumentNumber),
                document_date: newDate,
                document_note: newNote,
                product_list: productList
            });
        setModalShow(false)
        alert('Successfuly Added to the Database')
    }


    //read collection from purchase_record
    useEffect(() => {

        const purchRecordCollectionRef = collection(db, "purchase_record")
        const q = query(purchRecordCollectionRef);

        const unsub = onSnapshot(q, (snapshot) =>
            setPurchRecord(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );

        return unsub;
    }, [])

    var curr = new Date();
    curr.setDate(curr.getDate());
    var date = curr.toISOString().substr(0, 10);



    const [productList, setProductList] = useState([{ productName: "", productQuantity: 0 }]);

    const handleProductChange = (e, index) => {
        const { name, value } = e.target
        const list = [...productList];
        list[index][name] = value
        setProductList(list)
    }

    const handleItemAdd = () => {
        setProductList([...productList, { productName: " ", productQuantity: 0 }])
    }

    const handleItemRemove = (index) => {
        const list = [...productList]
        list.splice(index, 1)
        setProductList(list)
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
                            type="number"
                            className="form-control"
                            placeholder="Document Number"
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
                <div className="row mb-2">
                    <div className="col-6">Product Name</div>
                    <div className="col-3">Quantity</div>
                </div>
                {productList.map((product, index) => (
                    <div key={index} className="row">
                        <div className="col-6 mb-3">
                            <Form.Control
                                hidden
                                size="md"
                                type="text"
                                name="productName"
                                placeholder="Product Name"
                                value={product.productName}
                                onChange={(e) => handleProductChange(e, index)}
                                required
                            />
                            <Form.Select
                                defaultValue={0}
                                name="productName"
                                value={product.productName}
                                onChange={(e) => handleProductChange(e, index)}
                                required
                            >
                                <option
                                    value={0}
                                >
                                    Select item
                                </option>
                                {purchRecord.map((purchRecord) => {
                                    return (
                                        <option
                                            key={purchRecord.product_name}
                                            value={purchRecord.product_name}
                                        >
                                            {purchRecord.product_name}
                                        </option>
                                    )
                                })}
                            </Form.Select>
                            {productList.length - 1 === index && productList.length < 4 && (
                                <Button
                                    className="mt-3"
                                    variant="outline-primary"
                                    size="md"
                                    onClick={handleItemAdd}>
                                    Add
                                </Button>
                            )}
                        </div>
                        <div className="col-3">
                            <Form.Control
                                size="md"
                                type="number"
                                name="productQuantity"
                                placeholder="Quantity"
                                min={0}
                                value={product.productQuantity}
                                onChange={(e) => handleProductChange(e, index)}
                                required
                            />
                        </div>
                        <div className="col-3">
                            {productList.length > 1 && (
                                <Button
                                    variant="outline-danger"
                                    size="md"
                                    onClick={() => handleItemRemove(index)}>
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div >


                ))}



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
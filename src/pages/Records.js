import React from "react";
import { Nav } from "react-bootstrap";
import { Link } from 'react-router-dom';
import Navigation from "../layout/Navigation";
import { Table, Button, Modal,Form } from "react-bootstrap"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faNoteSticky, faXmark, faUser, faPesetaSign } from '@fortawesome/free-solid-svg-icons'
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";
import ListGroup from 'react-bootstrap/ListGroup';

import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import {getDocs,collection,addDoc,doc, deleteDoc} from 'firebase/firestore';








function Records(){

    const [modalShow, setModalShow] = React.useState(false);

    const [purchaseRecord, setPurchaseRecord] = useState([]);
    const purchaseRecordCollectionRef = collection(db, "purchase_record")
    const [supplierRecord, setsupplierRecord] = useState([]);
    const supplierRecordCollectionRef = collection(db, "supplier")


    //read supplierCollection
    useEffect(()=>{
        const getSupplier = async () => {
            const data = await getDocs(supplierRecordCollectionRef);
            setsupplierRecord(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        };
        getSupplier()
    }, [])



    function MyVerticallyCenteredModal(props) {

        const purchaseRecordCollectionRef = collection(db, "purchase_record")
        const [stockcard, setStockcard] = useState([]);
        const stockcardCollectionRef = collection(db, "stockcard")

        //data variable declaration
        const [newProdSupplier, setnewProdSupplier] = useState("");
        const [newDocumentNumber,setNewDocumentNumber] = useState(0);
        const [newNote, setNewNote] = useState("");
        const [newDate, setNewDate] = useState(new Date());
        const [newProductName,setNewProductName] = useState("");
        const [newQuanity, setNewProductQuantity] = useState(0);

        //add document to database
        const addRecord = async() => {
            await addDoc(purchaseRecordCollectionRef, {supplier_name:newProdSupplier, document_number:Number(newDocumentNumber),document_date:newDate,document_note:newNote, product_name:newProductName, product_quantity:Number(newQuanity)});
            setModalShow(false)
            alert('Successfuly Added to the Database')
        }
        
        //read collection from stockcard
        useEffect(()=>{
            const getStockcard = async () => {
                const data = await getDocs(stockcardCollectionRef);
                setStockcard(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
            };
            getStockcard()
        }, [])
        
        var curr = new Date();
        curr.setDate(curr.getDate() + 1);
        var date = curr.toISOString().substr(0,10);
        
        //Dynamic Button data variable
        const [itemNameList,setItemNameList] = useState([
            {itemName: "" }
        ]);
    
        //Modal dynamic AddButton
        const handleItemAdd = () => {
            setItemNameList([...itemNameList, {itemName: "" }])
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
                Add Purchase Record
            </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-5">
                    <div className="row mt-2">
                        <div className="col-8">
                        <label>Supplier</label>
                        <Form.Select 
                        aria-label="Default select example"
                        onChange={(event)=>{ setnewProdSupplier(event.target.value);}}
                        >
                        <option>Select Supplier</option>
                        {supplierRecord.map((supplierRecord) => { 
                            return (
                            <option value={supplierRecord.supplier_name}>{supplierRecord.supplier_name}</option>
                            )
                        })}
                        </Form.Select>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-8">
                            <label>Document Number</label>
                            <input type="text" className="form-control" placeholder="Document Number" onChange={(event)=>{ setNewDocumentNumber(event.target.value);}}/>
                        </div>
                        <div className="col-4">
                            <label>Date</label>
                            <input className="form-control" 
                            type="date" 
                            defaultValue={date}
                            placeholder="Date"
                            onChange={(event)=>{ setNewDate(event.target.value);}}
                            />
                        </div>
                    </div>
                    <div className="row mt-2">
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label>Note: (Optional)</Form.Label>
                            <Form.Control 
                            as="textarea" 
                            rows={3} 
                            onChange={(event)=>{ setNewNote(event.target.value);}}
                            />
                        </Form.Group>
                    </div>
                    
                    <span><br/></span>
                    <h5>Products</h5>
                    <hr></hr>
                    <div className="row">
                        <div>
                            {itemNameList.map((singleItem, index) => (
                                <div key={index} className="row">
                                    <div className="col-7">
                                    <Form.Select className="my-2" >
                                    <option
                                    onChange={(event)=>{ setNewProductName(event.target.value);}}
                                    >Select item</option>
                                        {stockcard.map((stockcard) => { 
                                        return (
                                        <option value={stockcard.product_name}
                                        >{stockcard.product_name}</option>
                                        )
                                        })}         
                                    </Form.Select>
                                    {itemNameList.length -1 === index && itemNameList.length < 5 && 
                                        (
                                        <Button 
                                            type="button"
                                            className="add-btn" 
                                            onClick={handleItemAdd}>
                                        Add Item
                                        </Button>
                                    )}
                                    </div>
                                    <div className="col-2 my-2">
                                        {itemNameList.length > 1 && 
                                        (
                                            <Button 
                                            variant="outline-danger"
                                            className="remove-btn"
                                            onClick={() => handleItemRemove(index)}
                                            >Remove</Button>
                                        )}
                                    </div>
                                    <div className="col-3 my-2">
                                        <input 
                                        type="number" 
                                        className="form-control" 
                                        placeholder="Quantity"
                                        onChange={(event)=>{ setNewProductQuantity(event.target.value);}}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
            </Modal.Body>
            <Modal.Footer>
            <Button onClick={addRecord}>Save</Button>
            </Modal.Footer>
        </Modal>
        );
    }
  
    
    //Display Data from Firebase
    useEffect(()=>{
        const getPurchaseRecord = async () => {
            const data = await getDocs(purchaseRecordCollectionRef);
            setPurchaseRecord(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
            
        };
        getPurchaseRecord()
    }, [])

    //Delete Data from firebase
    const deleteTransaction = async (id) => {
        const transcationDoc = doc(db, "purchase_record", id)
        await deleteDoc (transcationDoc);
        alert('Record DELETED from the Database')
      }

    return(
        <div className="row bg-light">
            <Navigation/>
                <div className="col-3 p-5">
                    <div className="card">
                        <div className="card-header bg-primary text-white" >
                            <div className="row">
                                <div className="col-9 pt-2">
                                    <h6>Transaction List</h6>
                                </div>
                                <div className="col-3">
                                    <Button onClick={() => setModalShow(true)}><FontAwesomeIcon icon ={faPlus}/></Button>
                                    <MyVerticallyCenteredModal
                                        show={modalShow}
                                        onHide={() => setModalShow(false)}
                                    />
                                </div>
                            </div>
                        </div>
         
                            <div className="card-body"style={{height:'500px'}}>
                            <ListGroup variant="flush">
                            {purchaseRecord.map((purchaseRecord) => { 
                                return (
                                    <ListGroup.Item action variant="light">
                                    <div className="row">
                                            <div className="col-9">
                                            <small><strong>{purchaseRecord.supplier_name}</strong></small><br/>
                                            <small className="text-secondary">Doc No: {purchaseRecord.document_number}</small><br/>
                                            <small className="text-secondary">Date</small>

                                            </div>
                                                                             
                                        <div className="col-3">
                                            <Button 
                                            className="text-dark" 
                                            variant="outline-light"
                                            onClick={() => {deleteTransaction(purchaseRecord.id)}}
                                            >
                                                <FontAwesomeIcon icon ={faXmark}/>
                                            </Button>{' '}
                                        </div>
                                    </div>
                                    </ListGroup.Item>
                                );
                                })}
                            </ListGroup>
                                    
                        </div>
                    </div>
                    

                </div>
                <div className="col-9 p-5">
                    <Nav fill variant="pills" defaultActiveKey="/records">
                    <   Nav.Item>
                            <Nav.Link as={Link} to="/records" active>Purchase History</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/salesrecord" >Sales History</Nav.Link>
                        </Nav.Item>               
                    </Nav>
                    <span><br></br></span>
                
                    <div className="row px-5 py-3 bg-white">
                        <div className="row pt-4 px-2 bg-white">
                        <small> <FontAwesomeIcon icon ={faUser}/> Supplier Name: </small>
                        <small> <FontAwesomeIcon icon ={faCalendarDays}/> Date: </small>
                        <small> <FontAwesomeIcon icon ={faNoteSticky}/> Note: </small>
                        <small> <FontAwesomeIcon icon ={faPesetaSign}/> Total: </small>
                        </div>
                    
                    <span><br /></span>
                    <Table striped bordered hover size="sm">
                        <thead className='bg-primary'>
                        <tr>
                            <th className='px-3'>Item Code</th>
                            <th className='px-3'>Item Name</th>
                            <th className='px-3'>Quantity</th>
                            <th className='px-3'>Price</th>
                            <th className='text-center'>Modify / Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                               
                        </tbody>
                    </Table>


                    </div>



                



                
                </div>

        </div>
    )

}

export default Records;
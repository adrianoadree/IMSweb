import React from "react";
import Searchbar from "../components/searchbar";
import { Nav } from "react-bootstrap";
import Navigation from "../layout/Navigation";
import { Table, Button, Modal,Form } from "react-bootstrap"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faBook,faNoteSticky, faXmark } from '@fortawesome/free-solid-svg-icons'
import { faCalendarDays } from "@fortawesome/free-regular-svg-icons";

import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import {getDocs,collection,addDoc} from 'firebase/firestore';




function ShowItemNames(){

    const [stockcard, setStockcard] = useState([]);
    const stockcardCollectionRef = collection(db, "stockcard")

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

    useEffect(()=>{
        const getStockcard = async () => {
            const data = await getDocs(stockcardCollectionRef);
            setStockcard(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        };
        getStockcard()
    }, [])

    return(   
        <div className="row">

            <div>
                {itemNameList.map((singleItem, index) => (
                    
                    <div key={index} className="row">
                        <div className="col-7">
                        <Form.Select className="my-2" >
                        <option>Select item</option>
                            {stockcard.map((stockcard) => { 
                            return (
                            <option>{stockcard.product_name}</option>
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
                            <input type="number" className="form-control" placeholder="Quantity"/>
                        </div>
                    </div>

                ))}
            </div>

        </div>
    );
  }


function MyVerticallyCenteredModal(props) {

    const [purchaseRecord, setPurchaseRecord] = useState([]);
    const purchaseRecordCollectionRef = collection(db, "purchase_record")

    

    //data variable declaration
    const [newDocumentNumber,setNewDocumentNumber] = useState("");

    //Create product to database
    const addDocument = async() => {
        await addDoc(purchaseRecordCollectionRef, {document_number:Number(newDocumentNumber)});
        alert('Successfuly Added to the Database')
    }

    var curr = new Date();
    curr.setDate(curr.getDate() + 1);
    var date = curr.toISOString().substr(0,10);
    

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
                <div className="row">
                    <div className="col-8">
                        <label>Document Number</label>
                        <input type="text" className="form-control" placeholder="Document Number" onChange={(event)=>{ setNewDocumentNumber(event.target.value);}}/>
                    </div>
                    <div className="col-4">
                        <label>Date</label>
                        <input className="form-control" 
                        type="date" 
                        defaultValue={date}
                        placeholder="Date"/>
                    </div>
                </div>
                <div className="row mt-2">
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Note: (Optional)</Form.Label>
                        <Form.Control as="textarea" rows={3} />
                    </Form.Group>
                </div>
                
                <span><br/></span>
                <h5>Products</h5>
                <hr></hr>
                <ShowItemNames/>


                    


          
        </Modal.Body>
        <Modal.Footer>
          <Button>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
  


function Records(){

    const [modalShow, setModalShow] = React.useState(false);

    return(
        <div className="row bg-light">
            <Navigation/>
                <div className="col-3 p-5">
                    <Searchbar />
                    <span><br /></span>
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
                            <ul className="list-group list-group-flush bg-white">
                                <li class="list-group-item">
                                    <div className="row">
                                        <div className="col-9"><span>Document No:<br/></span>
                                        <small>date</small>
                                        </div>
                                        <div className="col-3">
                                            <Button className="text-dark" variant="outline-light"><FontAwesomeIcon icon ={faXmark}/></Button>{' '}
                                        </div>
                                    </div>
                                </li>
                                <li class="list-group-item">
                                    <div className="row">
                                        <div className="col-9"><span>Document No:<br/></span>
                                        <small>date</small>
                                        </div>
                                        <div className="col-3">
                                            <Button className="text-dark" variant="outline-light"><FontAwesomeIcon icon ={faXmark}/></Button>{' '}
                                        </div>
                                    </div>
                                </li>

                            </ul>
                                    
                        </div>
                    </div>
                    

                </div>
            
                <div className="col-9 p-5">
                    <Nav fill variant="pills" defaultActiveKey="/records">
                        <Nav.Item>
                            <Nav.Link href="/records">Purchase History</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="link-1">Sales History</Nav.Link>
                        </Nav.Item>                  
                    </Nav>
                    <span><br></br></span>
                
                    <div className="row px-5 py-3 bg-white">
                        <div className="row pt-4 px-2 bg-white">
                        <small> <FontAwesomeIcon icon ={faBook}/> Document Number: </small>
                        <small> <FontAwesomeIcon icon ={faCalendarDays}/> Date: </small>
                        <small> <FontAwesomeIcon icon ={faNoteSticky}/> Note: </small>
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
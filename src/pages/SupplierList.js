import React from "react";
import Navigation from "../layout/Navigation";
import { Card,Table,Modal,Button,ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook, faBagShopping, faLocationDot, faPlus, faUser, faXmark } from "@fortawesome/free-solid-svg-icons";

import { db } from '../firebase-config';
import {collection,addDoc,getDocs,doc,deleteDoc, getDoc} from 'firebase/firestore';
import { useState,useEffect } from 'react';



 

function SupplierList(){

    const [modalShow, setModalShow] = React.useState(false);

    const [supplier, setSupplier] = useState([]);
    const supplierCollectionRef = collection(db, "supplier")


    //Delete collection from database
    const deleteSupplier = async (id) => {
        const supplierDoc = doc(db, "supplier", id)
        await deleteDoc (supplierDoc);
        alert('Supplier DELETED from the Database')
      }


    //Read supplier collection from database
    useEffect(()=>{
        const getSupplier = async () => {
        const data = await getDocs(supplierCollectionRef);
        setSupplier(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        };
        getSupplier()
    }, [])
    


    function NewSupplierModal(props) {
        
        
        const addSupplier = async() => {
            await addDoc(supplierCollectionRef, {supplier_name:newSupplierName, supplier_company:newSupplierCompany, supplier_address:newSupplierAddress, supplier_contact:newSupplierContactNumber});
            setModalShow(false)
            alert('Successfuly Added to the Database')
        }
        
        

        //data variables
        const [newSupplierName,setnewSupplierName] = useState("");
        const [newSupplierCompany,setnewSupplierCompany] = useState("");
        const [newSupplierAddress,setnewSupplierAddress] = useState("");
        const [newSupplierContactNumber,setnewSupplierContactNumber] = useState(0);


        return (
          <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
          >
            <Modal.Header closeButton>
              <Modal.Title id="contained-modal-title-vcenter">
                New Supplier
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <div className="p-3">
                        <div className="row my-2">
                        <label>Supplier Name</label>
                            <div className="col-8">
                                <input type="text" 
                                className="form-control" 
                                placeholder="Supplier Name"
                                onChange={(event)=>{ setnewSupplierName(event.target.value);}}
                                />
                            </div>
                        </div>
                        <div className="row my-2">
                            <div className="col-7">
                                <label>Company Name</label>
                                <input type="text" 
                                className="form-control" 
                                placeholder="Company" 
                                onChange={(event)=>{ setnewSupplierCompany(event.target.value);}}

                                />
                            </div>
                        </div>
                        <div className="row my-2">
                            <div className="col-12">
                                <label>Address</label>
                                <input type="text" 
                                className="form-control" 
                                placeholder="Address"
                                onChange={(event)=>{ setnewSupplierAddress(event.target.value);}} 
                                />
                            </div>
                        </div>
                        <div className="row my-2">
                            <div className='col-10'>
                                <label>Product Supplier</label>
                                <input type="text" 
                                className="form-control" 
                                placeholder="Product Supplier" 
                                />
                            </div>
                        </div>
                        <div className="row my-2">
                            <div className="col-5">
                                <label>Contact Number</label>
                                <input type="text" 
                                className="form-control" 
                                placeholder="Contact Number" 
                                onChange={(event)=>{ setnewSupplierContactNumber(event.target.value);}}
                                />
                            </div>
                        </div>
                    </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={addSupplier}>Save</Button>
            </Modal.Footer>
          </Modal>
        );
      }

    



     
    //accessing data from collection 
    
    const SupplierInfo = async (id) => {
            
        const SupplierdocRef = doc(db, "supplier", id);
        const docSnap = await getDoc(SupplierdocRef);
        const x = docSnap.data().supplier_name;

        console.log("Document data:", docSnap.data().supplier_name, x);
        
    }    

    
    
       
    function DisplaySupplierInfo(){

    return(
        <div>
            <small className="my-1"> <FontAwesomeIcon icon ={faUser}/> Supplier Name:  </small><br/>
            <small className="my-1"> <FontAwesomeIcon icon ={faLocationDot}/> Address: </small><br/>
            <small className="my-1"> <FontAwesomeIcon icon ={faBagShopping}/> Supplied Product(s): </small><br/>
            <small className="my-1"> <FontAwesomeIcon icon ={faAddressBook}/> Contact Number:</small><br/>
        </div>    
    )
        console.log("displayFunction works!");
    }
    



    return(
            <div className="row bg-light">
                <Navigation/>
                <div className="col-3 p-5">
                    <Card>
                        <Card.Header className="bg-primary">
                            <div className="row">
                                <div className="col-9 pt-2 text-white">
                                    <h6>Supplier List</h6>
                                </div>
                                <div className="col-3">
                                <Button variant="primary" onClick={() => setModalShow(true)}>
                                    <FontAwesomeIcon icon ={faPlus}/>
                                </Button>
                                    <NewSupplierModal
                                        show={modalShow}
                                        onHide={() => setModalShow(false)}
                                    />
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body>
                        <ListGroup variant="flush" style={{height:"550px"}}>
                            {supplier.map((supplier) => { 
                                return(
                                <ListGroup.Item variant="light" action onClick={() => {SupplierInfo(supplier.id)}}>
                                    <div className="row">
                                        <div className="col-9 pt-1">
                                            {supplier.supplier_name}<br/>
                                            <small className="text-secondary">{supplier.supplier_company}</small>
                                        </div>
                                        <div className="col-3 ">
                                        <Button 
                                            className="text-dark" 
                                            variant="outline-light"
                                            size="sm"
                                            onClick={() => {deleteSupplier(supplier.id)}}
                                            >
                                                <FontAwesomeIcon icon ={faXmark}/>
                                         </Button>
                                        </div>  
                                    </div>
                                </ListGroup.Item>
                                );})}

                            </ListGroup>
                        </Card.Body>
                    </Card>
                </div>
                <div className="col-9 p-5">
                    <div className="row p-5 bg-white">
                    <DisplaySupplierInfo/>                                 
                <br/><br/>


                        <h5 className="text-center">Transaction History</h5>
                        <br/><hr/>
                        <Table striped bordered hover size="sm">
                            <thead className='bg-primary'>
                            <tr>
                                <th className='px-3'>Document Number</th>
                                <th className='px-3'>Date</th>
                                <th className='px-3'>Total</th>
                                <th className='text-center'>Modify / Delete</th>
                            </tr>
                            </thead>
                            <tbody>
                                
                            </tbody>
                        </Table>
                    </div>
                </div>


            </div>




    );
}
export default SupplierList;
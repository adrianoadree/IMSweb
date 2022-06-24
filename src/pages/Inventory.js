import { Card, Table,Button } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import CardHeader from 'react-bootstrap/esm/CardHeader';
import {getDocs,collection,addDoc, doc, deleteDoc, updateDoc} from 'firebase/firestore';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashCan, faPenToSquare} from '@fortawesome/free-solid-svg-icons'

function Inventory(){

  const [stockcard, setStockcard] = useState([]);
  const stockcardCollectionRef = collection(db, "stockcard")

  //data variable declaration
  const [newProductName,setNewProductName] = useState("");
  const [newPriceP, setNewPriceP] = useState(0);
  const [newPriceS, setNewPriceS] = useState(0);
  const [newQuanity, setNewQuantity] = useState(0);


  //Read collection from database
  useEffect(()=>{
    const getStockcard = async () => {
        const data = await getDocs(stockcardCollectionRef);
        setStockcard(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
    };
    getStockcard()
}, [])

  //Create product to database
  const addProduct = async() => {
    await addDoc(stockcardCollectionRef, {product_name:newProductName, purchase_price:Number(newPriceP),selling_price:Number(newPriceS),quantity:Number(newQuanity)});
    alert('Successfuly Added to the Database')
  }

  //update Stockcard
  const updateStockcard = async (id, quantity) => {
    const stockcardDoc = doc(db, "stockcard", id)
    const newFields = {quantity: quantity + 1}
    await updateDoc(stockcardDoc, newFields)
  }
  
  //delete row 
  const deleteStockcard = async (id) => {
    const stockcardDoc = doc(db, "stockcard", id)
    await deleteDoc(stockcardDoc);
    alert('Item Removed from the Database')

  }

    return(

    
        
        <div className="row bg-light">
          <Navigation/>
            <div className="col-3 p-5">
              <Card className='bg-white'>
                <CardHeader className='bg-primary'>
                 <h6 className='text-center text-white'>Add New Item</h6>
                </CardHeader>  
                 
                <div className="p-3">
                  <div className="row">
                      <div className="col-12">
                          <label>Item Name</label>
                          <input type="text" className="form-control" placeholder="Item name" onChange={(event)=>{ setNewProductName(event.target.value);
                          }}
                          />
                      </div>
                  </div>
                  <br/>
                  <div className="row">
                    <div className='col-10'>
                      <label>Purchase Price</label>
                      <input type="number" className="form-control" placeholder="Purchase Price" onChange={(event)=>{ setNewPriceP(event.target.value);
                            }}/>
                    </div>
                  </div>
                  <br/>
                  <div className="row">
                    <div className="col-10">
                      <label>Selling Price</label>
                      <input type="number" className="form-control" placeholder="Selling Price" onChange={(event)=>{ setNewPriceS(event.target.value);
                          }}/>
                      </div>
                  </div>
                  <br/>
                  <div className="row">
                      <div className="col-10">
                        <label>Quantity</label>
                        <input type="number" className="form-control" placeholder="Quantity" onChange={(event)=>{ setNewQuantity(event.target.value);
                          }}/>
                      </div>
                  </div>
                  <br/>
                  <div className="row px-3">                     
                    <button onClick={addProduct} className="btn btn-primary">Save</button>
                  </div>
                  


              </div>

              </Card>

            </div>


            
            <div className='col-9 p-5'>
              <div  className='bg-white p-3'>

              <h1 className='text-center py-3'>Inventory</h1>
              <span><br/><br/></span>

              <Table striped bordered hover size="sm">
                <thead className='bg-primary'>
                  <tr>
                    <th className='px-3'>Item Name</th>
                    <th className='px-3'>Selling Price</th>
                    <th className='px-3'>Purchase Price</th>
                    <th className='px-3'>Available Stock</th>
                    <th className='text-center'>Modify / Delete</th>

                  </tr>
                </thead>
                 <tbody>
                        {stockcard.map((stockcard) => { 
                            return (
                            <tr>
                                <td className='px-3'>
                                    <small>{stockcard.product_name}</small>
                                </td>
                                <td className='px-3'>
                                    <small>{stockcard.purchase_price}</small>
                                </td>
                                <td className='px-3'>
                                    <small>{stockcard.selling_price}</small>
                                </td>
                                <td className='px-3'>
                                    <small>{stockcard.quantity}</small>
                                </td>
                                <td className='px-3'>                                
                                  <Button className='text-black px-4' variant="outline-light" onClick={() => {updateStockcard(stockcard.id, stockcard.quantity)}}>
                                    Increment <FontAwesomeIcon icon ={faPenToSquare}></FontAwesomeIcon>                                  
                                  </Button>
                                  /
                                  <Button className='text-black px-4' variant="outline-light" onClick={() => {deleteStockcard(stockcard.id)}}>
                                    <FontAwesomeIcon icon ={faTrashCan}></FontAwesomeIcon>
                                  </Button>
                                </td>
                            </tr>
                            )
                            })}
                  
                </tbody>
              </Table>
              </div>

            </div>
            
        </div>
    );

}
export default Inventory;
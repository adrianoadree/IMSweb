import React from 'react';
import { ListGroup, Table } from 'react-bootstrap';
import Navigation from '../layout/Navigation';
import { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrashCan, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { collection, doc, deleteDoc, onSnapshot, query, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import "react-toastify/dist/ReactToastify.css";
import { faEdit } from '@fortawesome/free-regular-svg-icons';
import Barcode from 'react-barcode';
import JsBarcode from "jsbarcode";
import { orderBy } from 'lodash';




function Inventory() {

  //---------------------VARIABLES---------------------
  const [stockcard, setStockcard] = useState([]); // stockcardCollection variable



  //---------------------FUNCTIONS---------------------

  //Read stock card collection from database
  useEffect(() => {
    const collectionRef = collection(db, "stockcard");
    const q = query(collectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );

    return unsub;

  }, [])


  return (
    <div className="row bg-light">
      <Navigation />

      <div className='row'>

        <div className='col-2' />
        <div className='col-8 p-5'>
          <div className='row px-5 bg-white shadow'>
            <h1 className='text-center pt-4 p1'>Inventory</h1>
            <hr />
            <Table striped bordered hover size="sm">
              <thead className='bg-primary'>
                <tr>
                  <th className='px-3'>Item Code</th>
                  <th className='text-center'>Description</th>
                  <th className='text-center'>Available Stock</th>
                </tr>
              </thead>
              <tbody style={{ height: "390px" }} id="scrollable">
                {stockcard.map((prod, index) => (
                  <tr key={index}>
                    <td className='px-3' key={prod.id}>
                      {prod.id}
                    </td>
                    <td className='px-3' key={prod.description}>
                      {prod.description}
                    </td>
                    <td className="text-center" key={prod.qty}>
                      {prod.qty}
                    </td>

                  
                  </tr>
                ))
                }
              </tbody>
            </Table>


          </div>
        </div>
        <div className='col-2' />
      </div>






    </div>
  );

}
export default Inventory;

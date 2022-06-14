import { Table } from "react-bootstrap";



import { async } from '@firebase/util';
import { useState,useEffect } from 'react';
import { db } from '../firebase-config';
import {collection, getDocs} from 'firebase/firestore';


function InventoryTable(){

    const [Stockcard,setStockcard] = useState([]);
    const stockcardCollectionRef = collection(db, "Stockcard")


    useEffect(()=>{

        const getStockcard = async () => {
            const data = await getDocs(stockcardCollectionRef);
            setStockcard(data.docs.map((doc) => ({...doc.data(), product_id: doc.id})));
        };
        getStockcard()
    }, [])
    
    return(
        <div className="bg-white">
            <Table striped bordered hover size="sm">
            <thead>
                <tr>
                <th>Item Id</th>
                <th>Item Name</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                </tr>
                <tr>
                    <td>
                 
                    {Stockcard.map((Stockcard) => { 
                return <div> 
                    <small>{Stockcard.product_id}</small>
                </div>})}

                    </td>


                    <td>
                    {Stockcard.map((Stockcard) => { 
                return <div> 
                    <small>{Stockcard.product_name}</small>
                </div>})}
                    </td>

                    <td>
                    {Stockcard.map((Stockcard) => { 
                return <div> 
                    <small>{Stockcard.price_p}</small>
                </div>})}
                    </td>

                    <td>

                         {Stockcard.map((Stockcard) => { 
                return <div> 
                    <small>{Stockcard.price_s}</small>
                </div>})}
                    </td>

                </tr>
            </tbody>
        </Table>
        </div>


    );

}

export default InventoryTable;
import { useState } from "react";
import { db } from '../firebase-config';
import {collection, addDoc} from 'firebase/firestore';


function StockcardForm(){

    const [newProductName,setNewProductName] = useState("");
    const [newPriceP, setNewPriceP] = useState(0);
    const [newPriceS, setNewPriceS] = useState(0);
    const [newQuanity, setNewQuantity] = useState(0);


    const stockcardCollectionRef = collection(db, "Stockcard")

    //add product to database
    const addProduct = async() => {
        await addDoc(stockcardCollectionRef, {product_name:newProductName, price_p:newPriceP,price_s:newPriceS,quantity:newQuanity});
        alert('Successfuly Added to the Database')
    }


    return(
        
        <div className="p-5">
            <div className="row">
                <div className="col-10">
                    <input type="text" className="form-control" placeholder="Item name" onChange={(event)=>{ setNewProductName(event.target.value);
                    }}
                    />
                </div>
            </div>
            <br></br>
            <div className="row">
                <div className="col">
                <input type="number" className="form-control" placeholder="Purchase Price" onChange={(event)=>{ setNewPriceP(event.target.value);
                    }}/>
                </div>
                <div className="col">
                <input type="number" className="form-control" placeholder="Selling Price" onChange={(event)=>{ setNewPriceS(event.target.value);
                    }}/>
                </div>
            </div>
            <br></br>
            <div className="row">
                <div className="col-4"><input type="number" className="form-control" placeholder="Quantity" onChange={(event)=>{ setNewQuantity(event.target.value);
                    }}
                    /></div>
            </div>
            <br></br>

            <div className="row">
                <div className="col-10"/><div className="col-2">
                    <button onClick={addProduct} className="btn btn-primary ssave">Save</button></div>
            </div>
            


        </div>


    ); 
}
export default StockcardForm;
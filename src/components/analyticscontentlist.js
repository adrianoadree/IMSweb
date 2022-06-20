import { db } from '../firebase-config';
import {collection, getDocs} from 'firebase/firestore';
import { useState, useEffect } from 'react';



function AnalyticsContentList(){
   
    const [Stockcard,setStockcard] = useState([]);
    const stockcardCollectionRef = collection(db, "stockcard")


    useEffect(()=>{

        const getStockcard = async () => {
            const data = await getDocs(stockcardCollectionRef);
            setStockcard(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        };
        getStockcard()
    }, [])
   
    return(
        
        <div>
         
            <div className="card">
            <div className="card-header bg-primary text-white" >Product Ranking</div>
                <div className="card-body"style={{height:'500px'}}>
                    <ul className="list-group list-group-flush bg-white">
                        {Stockcard.map((Stockcard) => { 
                            return(
                                <li class="list-group-item">
                                    <small>{Stockcard.product_name}</small>
                                </li>
                            )})}
                    </ul>
                </div>
            </div>



        </div>

    );
}
export default AnalyticsContentList;
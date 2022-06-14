import { useState,useEffect } from 'react';
import { db } from '../firebase-config';
import {collection, getDocs} from 'firebase/firestore'


function Invcontentlist(){

    const [Stockcard,setStockcard] = useState([]);
    const stockcardCollectionRef = collection(db, "Stockcard")


    useEffect(()=>{

        const getStockcard = async () => {
            const data = await getDocs(stockcardCollectionRef);
            setStockcard(data.docs.map((doc) => ({...doc.data(), product_id: doc.id})));
        };
        getStockcard()
    }, [])



    return (

        <ul className="list-group list-group-flush listcontainer bg-white guide">
            {Stockcard.map((Stockcard) => { 
                return <li class="list-group-item"><small>{Stockcard.product_name}</small></li>
                })}
           
        </ul>




    );
    
}

export default Invcontentlist;
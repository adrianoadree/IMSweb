import { db } from '../firebase-config';
import {collection, getDocs} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';


function AnalyticsContentList(){
   
    const [Stockcard,setStockcard] = useState([]);
    const stockcardCollectionRef = collection(db, "stockcard")


    useEffect(()=>{
        const getStockcard = async () => {
            const data = await getDocs(stockcardCollectionRef);
            setStockcard(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        };
        getStockcard()
    },[])
   
    return(
        
        <div>
            <div className="card shadow">
            <div className="card-header bg-primary text-white" >Product Ranking</div>
                <div className="card-body"style={{height:'500px'}}>
                <ListGroup as="ol" variant="flush" numbered>
                        {Stockcard.map((Stockcard) => { 
                            return(
                                <ListGroup.Item as="li" key={Stockcard.id}>
                                    <small>{Stockcard.product_name}</small>
                                </ListGroup.Item>
                            )})}
                 </ListGroup>
                </div>
            </div>



        </div>

    );
}
export default AnalyticsContentList;
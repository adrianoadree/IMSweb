import Navigation from "../layout/Navigation";
import { useEffect, useState,  } from "react";
import { db } from "../firebase-config";
import { setDoc, collection, onSnapshot, query, doc, updateDoc, where, getDoc } from "firebase/firestore";
import { Modal, Button, Form } from "react-bootstrap";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { UserAuth } from '../context/AuthContext'

function ReturnID(props) {

    const { user } = UserAuth();//user credentials
    const [userID, setUserID] = useState("");
    const [userCollection, setUserCollection] = useState([]); 
    const [warehouseCounter, setWarehouseCounter] = useState(0);
    const [purchaseCounter, setPurchaseCounter] = useState(0); 
    const [salesCounter, setSalesCounter] = useState(0); 
    const [stockcardCounter, setStockcardCounter] = useState(0);
    const [supplierCounter, setSupplierCounter] = useState(0); 

    useEffect(() => {
        if (props.uid) {
          setUserID(props.uid)
        }
      }, [props.uid])
    
      //read Functions
    
      useEffect(() => {
        if (userID === undefined) {
    
              const userCollectionRef = collection(db, "user")
              const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));
        
              const unsub = onSnapshot(q, (snapshot) =>
                setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
              );
              return unsub;
            }
            else {
        
              const userCollectionRef = collection(db, "user")
              const q = query(userCollectionRef, where("user", "==", userID));
        
              const unsub = onSnapshot(q, (snapshot) =>
                setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
              );
              return unsub;
              
            }
      }, [userID])

      useEffect(() => {
        userCollection.map((metadata) => {
            setWarehouseCounter(metadata.warehouseId)
            setPurchaseCounter(metadata.purchaseId)
            setSalesCounter(metadata.salesId)
            setStockcardCounter(metadata.stockcardId)
            setSupplierCounter(metadata.supplierId)
        });
      }, [userCollection])

}
const returnCntr = (uid, module) => {
    
    
    var userID;
    var userCollection = [];
    var warehouseCounter;
    var purchaseCounter; 
    var salesCounter; 
    var stockcardCounter;
    var supplierCounter; 
    if (uid) {
        userID = uid
      }
    function  getUserCollection() {
        const [userCol, setUserCol] = []; 

        if (userID === undefined) {
    
            var userCollectionRef = collection(db, "user")
            var q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));
            console.log(q)
      
            const unsub = onSnapshot(q, (snapshot) => 
              setUserCol( snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            
            
              );
              return unsub;
          }
          else {
      
            var userCollectionRef = collection(db, "user")
            var q = query(userCollectionRef, where("user", "==", userID));
            console.log(q)
      
            const unsub = onSnapshot(q, (snapshot) =>
              setUserCol(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
            
              );
              return userCollection;
          }
          return userCol
    }
      console.log(userID)
      getUserCollection()
      console.log(userCollection)
      if(userCollection == undefined) {

      }
      else
      {
        userCollection.map((metadata) => {
            warehouseCounter = metadata.warehouseId
            purchaseCounter = metadata.purchaseId
            salesCounter = metadata.salesId
            stockcardCounter = metadata.stockcardId
            supplierCounter = metadata.supplierId
        });
      }

      

    if (module) {
        switch (module) {
            case 'warehouse':
            return warehouseCounter;
              break;
            case 'purchase':
                return purchaseCounter;
              break;
            case 'sales':
                return salesCounter;
            case 'stockcard':
                return stockcardCounter;
              break;
            case 'supplier':
                return supplierCounter;
              break;
          }
    }
    else
    {
        return "No!";
    }
  }

export {ReturnID};
export {returnCntr}

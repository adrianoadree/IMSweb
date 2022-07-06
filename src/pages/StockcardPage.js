import Navigation from "../layout/Navigation";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDocs, where } from "firebase/firestore";
import { Tab, ListGroup, Card, Table,Button } from "react-bootstrap";
import { faPlus, faNoteSticky, faXmark, faUser, faPesetaSign, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



function StockcardPage({ isAuth }) {
  let navigate = useNavigate();
  const [puchRecord, setPurchRecord] = useState([])

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, []);



  //read purchase_record Collection
  useEffect(() => {
    const purchaseRecordCollectionRef = doc(db, "purchase_record", "fKO2XH9vF3N3iJ0qGdbf");
    const q = query(purchaseRecordCollectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setPurchRecord(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))

    );

    return unsub;
  }, []);



  return (
    <div>
      <Navigation />




    </div >




  );


}
export default StockcardPage;
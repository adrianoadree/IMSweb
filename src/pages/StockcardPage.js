import Navigation from "../layout/Navigation";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, where } from "firebase/firestore";

function StockcardPage({ isAuth }) {
  let navigate = useNavigate();
  const [stockcard, setStockcard] = useState({})


  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, []);


  useEffect(() => {
    const collectionRef = collection(db, "stockcard");
    const q = query(collectionRef, where("product_supplier", "==", "Cardo Dalisay"));

    const unsub = onSnapshot(q, (snapshot) =>
    setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );

    return unsub;
  }, []);

  console.log(stockcard)

  return (
    <div>
      <Navigation />





    </div>




  );


}
export default StockcardPage;
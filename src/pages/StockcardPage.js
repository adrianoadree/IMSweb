import Navigation from "../layout/Navigation";
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, query, orderBy, startAfter, limit, getDocs } from "firebase/firestore";
import { Tab, ListGroup, Card, Button, Form } from "react-bootstrap";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";


function StockcardPage({ isAuth }) {

  //---------------------VARIABLES---------------------
  const [stockcard, setStockcard] = useState([]); //stockcard collection




  //---------------------FUNCTIONS---------------------

  //read collection from stockcard
  useEffect(() => {
    const stockcardCollectionRef = collection(db, "stockcard")

    async function test() {
      // Query the first page of docs
      const first = query(stockcardCollectionRef, orderBy("description"), limit(5));
      const documentSnapshots = await getDocs(first);
      setStockcard( documentSnapshots)
      console.log("first: ", stockcard)

      // Get the last visible document
      const lastVisible = documentSnapshots.docs[documentSnapshots.docs.length - 1];
      console.log("last", lastVisible);


      // Construct a new query starting at this document,
      // get the next 25 cities.
      const next = query(collection(db, "stockcard"),
        orderBy("description"),
        startAfter(lastVisible),
        limit(25));

    }
    test();

    // Construct a ne
  }, [])




  return (
    <div>
      <Navigation />
      <div className="row bg-light">
        <h1 className="text-center"> Purchase Transaction</h1>
        <div className="col-6 p-5">
          <ul>


          </ul>

        </div>


        <div className="col-6 p-5">

        </div>
      </div>


    </div >
  );


}

export default StockcardPage;
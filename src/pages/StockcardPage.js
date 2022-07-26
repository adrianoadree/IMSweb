import Navigation from "../layout/Navigation";
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { setDoc, collection, onSnapshot, query, doc } from "firebase/firestore";
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
    const q = query(stockcardCollectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return unsub;
  }, [])


  //Dynamic Add Product Button ------------------------------------------------------------
  const [productList, setProductList] = useState([{ productName: "", productQuantity: 0 }]);

  const handleProductChange = (e, index) => {
    const { name, value } = e.target
    const list = [...productList];
    list[index][name] = value
    setProductList(list)
  }

  const productName = [];
  const handleItemAdd = () => {
    setProductList([...productList, { productName, productQuantity: 0 }])
  }

  const handleItemRemove = (index) => {
    const list = [...productList]
    list.splice(index, 1)
    setProductList(list)
  }
  //End of Dynamic Button functions ---------------------------



  
  const prodArr = []
  productList.map((prod) => (
    prodArr.push(prod.productName) 
  ))


  return (
    <div>
      <Navigation />
      <div className="row bg-light">
        <h1 className="text-center"> Purchase Transaction</h1>
        <div className="col-6 p-5">

          <h5>Products</h5>
          <hr></hr>
          <div className="row mb-2">
            <div className="col-6">Product Name</div>
            <div className="col-3">Quantity</div>
          </div>
          {productList.map((product, index) => (
            <div key={index} className="row">
              <div className="col-6 mb-3">
                <Form.Control
                  hidden
                  size="md"
                  type="text"
                  name="productName"
                  placeholder="Product Name"
                  value={product.productName}
                  onChange={(e) => handleProductChange(e, index)}
                  required
                />
                <Form.Control
                  hidden
                  size="md"
                  type="boolean"
                  name="productName"
                  placeholder="Boolean"
                  value={product.productBoolean}
                  onChange={(e) => handleProductChange(e, index)}
                  required
                />
                <Form.Select
                  defaultValue={0}
                  name="productName"
                  value={product.productName}
                  onChange={(e) => handleProductChange(e, index)}
                  required
                >
                  <option
                    value={0}
                  >
                    Select item
                  </option>
                  {stockcard.map((prod) => {
                    return (
                      <option
                        key={prod.description}
                        value={prod.description}
                      >
                        {prod.description}
                      </option>
                    )
                  })}
                </Form.Select>
                {productList.length - 1 === index && productList.length < 4 && (
                  <Button
                    className="mt-3"
                    variant="outline-primary"
                    size="md"
                    onClick={handleItemAdd}>
                    Add
                  </Button>
                )}
              </div>
              <div className="col-3">
                <Form.Control
                  size="md"
                  type="number"
                  name="productQuantity"
                  placeholder="Quantity"
                  min={0}
                  value={product.productQuantity}
                  onChange={(e) => handleProductChange(e, index)}
                  required
                />
              </div>
              <div className="col-3">
                {productList.length > 1 && (
                  <Button
                    variant="outline-danger"
                    size="md"
                    onClick={() => handleItemRemove(index)}>
                    Remove
                  </Button>
                )}
              </div>
            </div >
          ))}
        </div>


        <div className="col-6 p-5">
         {prodArr.map((prod) => (
          <li>{prod}</li>
         ))}

        </div>
      </div>


    </div >
  );


}

export default StockcardPage;
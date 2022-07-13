import Navigation from "../layout/Navigation";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDocs, where, addDoc } from "firebase/firestore";
import {
  Tab, ListGroup, Card, Table, Button,

  FloatingLabel, Form
} from "react-bootstrap";
import { faPlus, faNoteSticky, faXmark, faUser, faPesetaSign, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



function StockcardPage({ isAuth }) {

  const [purchRecord, setPurchRecord] = useState([]);


  //read collection from stockcard
  useEffect(() => {

    const purchRecordCollectionRef = collection(db, "purchase_record")
    const q = query(purchRecordCollectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setPurchRecord(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );

    return unsub;
  }, [])

  //add document to database
  const addRecord = async () => {
    const salesRecordCollectionRef = collection(db, "sales_record")
    await addDoc(salesRecordCollectionRef,
      {
        product_list: productList
      });

    alert('Successfuly Added to the Database')
  }


  const numbers = [1, 2, 3, 4, 5];
  const firstNum = [1, 2];
  const secNum = [9, 8];
  const arrNum = [firstNum, secNum];

  const doubled = numbers.map((number) => number * 2);


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



  console.log(productList)

  return (
    <div>
      <Navigation />
      <div className="row p-5">
        <div className="col-6 guide">



          <h5>Products</h5>
          <hr></hr>
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
                  {purchRecord.map((purchRecord) => {
                    return (
                      <option
                        key={purchRecord.product_name}
                        value={purchRecord.product_name}
                      >
                          {purchRecord.product_name}
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

          <Button
            onClick={addRecord}
          >
            Submit
          </Button>
        </div>


        <div className="col-6">
          <h2>Test</h2>
          {productList.map((product, index) => (
            <ul key={index}>
              <li>
                name: {product.productName} quantity: {product.productQuantity}
              </li>
            </ul>
          ))}
        </div>





      </div>
    </div >
  );


}
export default StockcardPage;
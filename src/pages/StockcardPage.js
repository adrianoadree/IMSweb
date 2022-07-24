import Navigation from "../layout/Navigation";
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { setDoc, collection, onSnapshot, query, doc } from "firebase/firestore";
import { Tab, ListGroup, Card, Button, Form } from "react-bootstrap";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";


function StockcardPage({ isAuth }) {



  //fetch sales_record Document
  /*
  useEffect(() => {
    async function fetchSalesRecord() {

      const salesRecord = doc(db, "sales_record", docId)
      const docSnap = await getDoc(salesRecord)

      if (docSnap.exists()) {
        setSalesRecord(docSnap.data());
      }
    }
    fetchSalesRecord();

  }, [docId])
  */


  //fetch sold_product spec Document
  /*
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "sold_products", docId), (doc) => {
      setList(doc.data().product_list);
    });
    return unsub;
  }, [docId])
  /*
  
  /*
  //delete
  const deleteSalesRecord = async (id) => {
    const salesRecDoc = doc(db, "sales_record", id)
    const soldProdListDoc = doc(db, "sold_products", id)
    await deleteDoc(salesRecDoc);
    await deleteDoc(soldProdListDoc);
  }
  */


  //---------------------VARIABLES---------------------

  const [stockcard, setStockcard] = useState([]);
  const [newDocumentNumber, setNewDocumentNumber] = useState(0);
  const [newNote, setNewNote] = useState("");

  var curr = new Date();
  curr.setDate(curr.getDate());
  var date = curr.toISOString().substr(0, 10);




  //---------------------FUNCTIONS---------------------

  //add document to database
  const addRecord = () => {
    setDoc(doc(db, "purchase_record", "PR00" + newDocumentNumber), {
      document_date: date,
      document_note: newNote,
      document_number: "PR00" + newDocumentNumber,
      productList
      
    });

    successToast();
  }

  //read stockcard collection
  useEffect(() => {
    const stockcardCollectionRef = collection(db, "stockcard")
    const q = query(stockcardCollectionRef);

    const unsub = onSnapshot(q, (snapshot) =>
      setStockcard(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    );
    return unsub;
  }, [])

  
  //Toastify
  const successToast = () => {
    toast.success(' New Purchase Recorded! ', {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

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





  return (
    <div>
      <Navigation />
      <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
        <div className="row bg-light">
          <div className="col-3 p-5">
            <Card>
              <Card.Header
                className="bg-primary text-white"
              >
                <div className="row">
                  <div className="col-9 pt-2">
                    <h6>Transaction List</h6>
                  </div>
                  <div className="col-3">

                  </div>
                </div>
              </Card.Header>
              <Card.Body style={{ height: "550px" }}>
                <ListGroup variant="flush">


                </ListGroup>
              </Card.Body>
            </Card>

          </div>
          <div className="col-9 p-5">
            <Tab.Content>
              <Tab.Pane eventKey={0}>
                <div className="row mt-2">
                  <div className="col-8">
                    <label>Document Number</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Document Number"
                      onChange={(event) => { setNewDocumentNumber(event.target.value); }} />
                  </div>
                  <div className="col-4">
                    <label>Date</label>
                    <input
                      className="form-control"
                      value={moment(date).format('LL')}
                      disabled
                    />
                  </div>
                </div>
                <div className="row mt-2">
                  <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                    <Form.Label>Note: (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      onChange={(event) => { setNewNote(event.target.value); }}
                    />
                  </Form.Group>
                </div>

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



              </Tab.Pane>
            </Tab.Content>
          </div>
        </div>


      </Tab.Container>

    </div >
  );


}

export default StockcardPage;
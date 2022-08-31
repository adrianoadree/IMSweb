import Navigation from "../layout/Navigation";
import { useEffect, useState,  } from "react";
import { db } from "../firebase-config";
import { setDoc, collection, onSnapshot, query, doc, updateDoc, where, getDoc } from "firebase/firestore";
import { Modal, Button, Form } from "react-bootstrap";
import moment from "moment";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

function FillMapModal(props) {


    const [stockcard, setStockcard] = useState([]); //stockcard collection
    const [varRef, setVarRef] = useState([]); // variable collection
    const [newNote, setNewNote] = useState(""); // note form input
    const [stockcardData, setStockcardData] = useState([{}]);
    const [queryList, setQueryList] = useState([]); //compound query access
    const [warehouseMap, setWarehouseMap] = useState([]);
    
    
   useEffect(() => {
    async function readWarehouseDoc() {
      const warehouseRef = doc(db, "warehouse", props.whid)
      const docSnap = await getDoc(warehouseRef)
      if (docSnap.exists()) {
        setWarehouseMap(docSnap.data().cell);
        
      }
    }
    readWarehouseDoc()
  }, [props.whid])

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
    const [productList, setProductList] = useState([{ productId: "", productQuantity: 1 }]);
    const [prodList, setProdList] = useState([])

    const handleProductChange = (e, index) => {
    console.log("e: ", e)
    console.log("index: ", index)
        const { name, value } = e.target
        console.log("name: ", name)
        const list = [...productList];
        const list2 = [...prodList];
        list[index][name] = value
        list2[index] = value
        console.log("value: ", value)
        
        setProductList(list)
        setProdList(list2)
        console.log("change productList newval: ", productList)
        console.log("change productList newval: ", prodList)
    }
    const handleItemAdd = () => {
        setProdList([...prodList]);
        setProductList([...productList, { productId: "", productQuantity: 1 }]);
        console.log("add productList newval: ", productList);
    }

    const handleItemRemove = (index) => {
        const list = [...productList]
        list.splice(index, 1)
        setProductList(list)
        console.log("productList newval: ", productList)
    }
    //End of Dynamic Button functions ---------------------------


    //stores list.productId array to queryList
    useEffect(() => {
        const TempArr = [];
        productList.map((name) => {
            TempArr.push(name.productId)
        })
        setQueryList(TempArr)
    }, [productList])//list listener, rerenders when list value changes

    useEffect(() => {
        console.log("queryList newval: ", queryList)
    }, [queryList])


    useEffect(() => {
        console.log("productList newval: ", productList)
    }, [productList])

    useEffect(() => {
        console.log("stockcardData newval: ", stockcardData)
    }, [stockcardData])

    useEffect(() => {
        //query stockcard document that contains, [queryList] datas
        function queryStockcardData() {
            const stockcardRef = collection(db, "stockcard")

            if (queryList.length !== 0) {
                const q = query(stockcardRef, where("description", "in", [...queryList]));
                const unsub = onSnapshot(q, (snapshot) =>
                    setStockcardData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))),
                );
                return unsub;
            }

        }
        queryStockcardData();
    }, [queryList])



    //add document to database
    
    const updateCell= async () => {
    
    	warehouseMap[props.cellindex].products = [9,8,7,6];
    	
	console.log(warehouseMap);

   /* const getWarehouse= doc(db, 'warehouse', props.whid);
        updateDoc(getWarehouse, {
            
        });
        alert('Successfuly Added to the Database')*/
    }
    
    return (

        <Modal
            {...props}
            dialogClassName="modal-90w"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >

            <ToastContainer
                position="top-right"
                autoClose={3500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter" className="px-3">
                    Fill Cell
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-3">

                <span className="text-center"><h6>Add Products</h6></span>
                <hr></hr>
                <div className="row mb-2">
                    <div className="col-12">Product Name</div>
                </div>
                {productList.map((product, index) => (
                    <div key={index} className="row">
                        <div className="col-9 mb-3">
                            <Form.Control
                                hidden
                                size="md"
                                type="text"
                                name="index"
                                value={index}
                                onChange={(e) => handleProductChange(e, index)}
                                required
                            />
                            <Form.Select
                                defaultValue={0}
                                name="productId"
                                value={index}
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
                                            key={prod.id}
                                            value={prod.id}
                                        >
                                            {prod.description}
                                        </option>
                                    )
                                })}
                            </Form.Select>

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
                                                        {productList.length - 1 === index && productList.length < 10 && (
                                <Button
                                    className="mt-3 float-end"
                                    variant="outline-primary"
                                    size="md"
                                    onClick={handleItemAdd}>
                                    Add
                                </Button>
                            )}
                        </div>
                    </div >
                ))}

            </Modal.Body>
            <Modal.Footer>
                <Button
                    className="btn btn-success"
                    style={{ width: "150px" }}
                    onClick={() => { updateCell() }}
                    >
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );



}

export default FillMapModal;

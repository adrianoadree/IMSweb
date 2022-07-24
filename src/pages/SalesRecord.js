import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc } from "firebase/firestore";
import { Tab, ListGroup, Card, Table, Button, Nav } from "react-bootstrap";
import { faPlus, faNoteSticky, faCalendarDay, faFile, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import NewSalesModal from "../components/NewSalesModal";
import moment from "moment";


function SalesRecord({ isAuth }) {

    const [modalShow, setModalShow] = useState(false); //add new sales record modal
    const [salesRecord, setSalesRecord] = useState([]); //sales_record spec doc
    const [salesRecordCollection, setSalesRecordCollection] = useState([]); //sales_record collection
    const [docId, setDocId] = useState("xx") // doc id variable
    const [list, setList] = useState([{}]); // array of sold_product list


    //---------------------FUNCTIONS---------------------

    //fetch sales_record Document
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

    //read sales_record collection
    useEffect(() => {
        const salesRecordCollectionRef = collection(db, "sales_record")
        const q = query(salesRecordCollectionRef);

        const unsub = onSnapshot(q, (snapshot) =>
            setSalesRecordCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
    }, [])


    //fetch sold_product spec Document
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "sold_products", docId), (doc) => {
            setList(doc.data().product_list);
        });
        return unsub;
    }, [docId])

    //delete
    const deleteSalesRecord = async (id) => {
        const salesRecDoc = doc(db, "sales_record", id)
        const soldProdListDoc = doc(db, "sold_products", id)
        await deleteDoc(salesRecDoc);
        await deleteDoc(soldProdListDoc);
    }


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
                                        <Button onClick={() => setModalShow(true)}><FontAwesomeIcon icon={faPlus} /></Button>
                                        <NewSalesModal
                                            show={modalShow}
                                            onHide={() => setModalShow(false)}
                                        />
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body style={{ height: "550px" }}>
                                <ListGroup variant="flush">
                                    {salesRecordCollection.map((salesRecordCollection) => {
                                        return (
                                            <ListGroup.Item
                                                action
                                                key={salesRecordCollection.id}
                                                eventKey={salesRecordCollection.id}
                                                onClick={() => { setDocId(salesRecordCollection.id) }}>
                                                <div className="row">
                                                    <div className="col-9">
                                                        <small><strong>Doc No: {salesRecordCollection.document_number}</strong></small><br />
                                                        <small>Date: {salesRecordCollection.document_date}</small><br />
                                                    </div>
                                                    <div className="col-3">

                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>

                            </Card.Body>
                        </Card>

                    </div>
                    <div className="col-9 p-5">
                        <Tab.Content>
                            <Tab.Pane eventKey={0}>
                                <div>
                                    <Nav className="shadow" fill variant="pills" defaultActiveKey="/salesRecord">
                                        <   Nav.Item>
                                            <Nav.Link as={Link} to="/records" >Purchase History</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link as={Link} to="/salesrecord" active>Sales History</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                    <span><br></br></span>
                                    <div className="row px-5 py-3 bg-white shadow">
                                        <div className="row pt-4 px-2 bg-white">
                                            <small> <FontAwesomeIcon icon={faFile} /> Document Number: </small>
                                            <small> <FontAwesomeIcon icon={faCalendarDay} /> Date: </small>
                                            <small> <FontAwesomeIcon icon={faNoteSticky} /> Note: </small>
                                        </div>

                                        <span><br /></span>
                                        <Table striped bordered hover size="sm">
                                            <thead className='bg-primary'>
                                                <tr>
                                                    <th className='px-3'>Item Name</th>
                                                    <th className='px-3'>Quantity</th>
                                                    <th className='px-3'>Price</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ height: "300px" }}>

                                            </tbody>
                                        </Table>


                                    </div>


                                </div>
                            </Tab.Pane>

                            <Tab.Pane eventKey={docId}>
                                <div>
                                    <Nav className="shadow" fill variant="pills" defaultActiveKey="/salesRecord">
                                        <   Nav.Item>
                                            <Nav.Link as={Link} to="/records" >Purchase History</Nav.Link>
                                        </Nav.Item>
                                        <Nav.Item>
                                            <Nav.Link as={Link} to="/salesrecord" active>Sales History</Nav.Link>
                                        </Nav.Item>
                                    </Nav>
                                    <span><br></br></span>
                                    <div className="row px-5 py-3 bg-white shadow">
                                        <div className="row pt-4 px-2 bg-white">

                                            <div className="col-11 ">
                                                <small> <FontAwesomeIcon icon={faFile} /> Document Number: <strong>{salesRecord.document_number}</strong></small><br />
                                                <small> <FontAwesomeIcon icon={faCalendarDay} /> Date:  <strong>{moment(salesRecord.document_date).format('LL')}</strong></small><br />
                                                <small> <FontAwesomeIcon icon={faNoteSticky} /> Note:  <strong>{salesRecord.document_note}</strong></small><br />
                                            </div>
                                            <div className="col-1">
                                                <Button
                                                    className="text-black"
                                                    size="lg"
                                                    variant="outline-light"
                                                    onClick={() => { deleteSalesRecord(docId) }}
                                                >
                                                    <FontAwesomeIcon icon={faTrashCan} />
                                                </Button>
                                            </div>

                                        </div>

                                        <span><br /></span>
                                        <div style={{ height: "400px" }}>
                                            <Table striped bordered hover size="sm">
                                                <thead className='bg-primary'>
                                                    <tr>
                                                        <th className='px-3'>Item Name</th>
                                                        <th className='px-3'>Quantity</th>
                                                        <th className='px-3'>Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {list.map((product) => (
                                                        <tr>
                                                            <td key={product.productName}>{product.productName} </td>
                                                            <td key={product.productQuantity}>{product.productQuantity}</td>
                                                            <td></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </div>
                                    </div>


                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </div>




                </div>


            </Tab.Container>

        </div >
    );



}

export default SalesRecord;
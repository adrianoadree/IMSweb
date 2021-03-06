import Navigation from "../layout/Navigation";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ListGroup from 'react-bootstrap/ListGroup';
import NewSalesModal from "../components/NewSalesModal";
import { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { useNavigate } from 'react-router-dom';
import {
    faPlus,
    faNoteSticky,
    faPesetaSign,
    faFile,
    faXmark,
    faCalendarDay
} from '@fortawesome/free-solid-svg-icons'
import {
    Button,
    Card,
    Nav,
    Table,
    Tab
} from "react-bootstrap";
import {
    collection,
    doc,
    deleteDoc,
    query,
    onSnapshot
} from "firebase/firestore";




function SalesRecord({ isAuth }) {

    const [modalShow, setModalShow] = useState(false);
    const [salesRecord, setSalesRecord] = useState([]);

    const [salesId, setSalesId] = useState("xxx")
    let navigate = useNavigate();

    useEffect(() => {
        if (!isAuth) {
            navigate("/login");
        }
    }, []);

    //read  sales_record collection
    useEffect(() => {
        const salesRecordCollectionRef = collection(db, "sales_record")
        const q = query(salesRecordCollectionRef);

        const unsub = onSnapshot(q, (snapshot) =>
            setSalesRecord(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        );
        return unsub;
    }, [])

    const deleteSalesRecord = async (id) => {
        const supplierDoc = doc(db, "sales_record", id)
        await deleteDoc(supplierDoc);
    }

    return (
        <div>
            <Navigation />
            <Tab.Container id="list-group-tabs-example" defaultActiveKey={0}>
                <div className="row bg-light">
                    <div className='col-3 p-5'>
                        <Card className="shadow">
                            <Card.Header className="bg-primary text-white">
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
                            <Card.Body className="" style={{ height: "550px" }}>
                                <ListGroup variant="flush">
                                    {salesRecord.map((salesRecord) => {
                                        return (
                                            <ListGroup.Item
                                                action
                                                key={salesRecord.id}
                                                eventKey={salesRecord.id}
                                                onClick={() => { setSalesId(salesRecord.id) }}>
                                                <div className="row">
                                                    <div className="col-9">
                                                        <small>Doc No: {salesRecord.document_number}</small><br />
                                                        <small>Date</small>

                                                    </div>

                                                    <div className="col-3">
                                                        <Button
                                                            className="text-dark"
                                                            variant="outline-light"
                                                            onClick={() => { deleteSalesRecord(salesRecord.id) }}
                                                        >
                                                            <FontAwesomeIcon icon={faXmark} />
                                                        </Button>{' '}
                                                    </div>
                                                </div>
                                            </ListGroup.Item>
                                        );
                                    })}
                                </ListGroup>
                            </Card.Body>
                        </Card>



                    </div>



                    <div className='col-9 p-5'>
                        <Tab.Content>
                            <Tab.Pane eventKey={salesId}>
                                <div>
                                    <Nav className="shadow" fill variant="pills" defaultActiveKey="/salesRecord">
                                        <Nav.Item>
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
                                            <small> <FontAwesomeIcon icon={faPesetaSign} /> Total: </small>
                                        </div>

                                        <span><br /></span>
                                        <Table striped bordered hover size="sm">
                                            <thead className='bg-primary'>
                                                <tr>
                                                    <th className='px-3'>Item Code</th>
                                                    <th className='px-3'>Item Name</th>
                                                    <th className='px-3'>Quantity</th>
                                                    <th className='px-3'>Price</th>
                                                    <th className='text-center'>Modify / Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ height: "300px" }}>

                                            </tbody>
                                        </Table>


                                    </div>


                                </div>
                            </Tab.Pane>
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
                                            <small> <FontAwesomeIcon icon={faPesetaSign} /> Total: </small>
                                        </div>

                                        <span><br /></span>
                                        <Table striped bordered hover size="sm">
                                            <thead className='bg-primary'>
                                                <tr>
                                                    <th className='px-3'>Item Code</th>
                                                    <th className='px-3'>Item Name</th>
                                                    <th className='px-3'>Quantity</th>
                                                    <th className='px-3'>Price</th>
                                                    <th className='text-center'>Modify / Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody style={{ height: "300px" }}>

                                            </tbody>
                                        </Table>


                                    </div>


                                </div>
                            </Tab.Pane>
                        </Tab.Content>
                    </div>
                </div>




            </Tab.Container>

        </div>

    );
}

export default SalesRecord;
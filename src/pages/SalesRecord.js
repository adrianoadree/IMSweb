import Navigation from "../layout/Navigation";
import { Button, Card, Nav,Table } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus,faCalendarDay,faNoteSticky,faPesetaSign, faFile } from '@fortawesome/free-solid-svg-icons'
import ListGroup from 'react-bootstrap/ListGroup';


function SalesRecord(){



    return(
        <div>
            <div className="row bg-light">            
                <Navigation/>
                <div className="col-3 p-5">
                    <Card className="shadow">
                        <Card.Header className="bg-primary text-white">
                            <div className="row">
                                <div className="col-9 pt-2">
                                <h6>List</h6>
                                </div>
                                    
                                <div className="col-3">
                                   <Button><FontAwesomeIcon icon ={faPlus}/></Button>
                                </div>
                            </div>
                        </Card.Header>
                        <Card.Body style={{height:'500px'}}>
                        <ListGroup variant="flush">
                            <ListGroup.Item action variant="light">Cras justo odio</ListGroup.Item>
                            <ListGroup.Item action variant="light">Dapibus ac facilisis in</ListGroup.Item>
                            <ListGroup.Item action variant="light">Morbi leo risus</ListGroup.Item>
                            <ListGroup.Item action variant="light">Porta ac consectetur ac</ListGroup.Item>
                        </ListGroup>
                        </Card.Body>
                    </Card>

                </div>
                <div className="col-9 p-5">
                    <Nav className="shadow" fill variant="pills" defaultActiveKey="/records">
                        <Nav.Item>
                            <Nav.Link as={Link} to="/records">Purchase History</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link as={Link} to="/salesrecord" active>Sales History</Nav.Link>
                        </Nav.Item>               
                    </Nav>
                    <span><br></br></span>
                    <div className="row px-5 py-3 bg-white shadow">
                        <div className="row pt-4 px-2 bg-white">
                        <small> <FontAwesomeIcon icon ={faFile}/> Document Number: </small>
                        <small> <FontAwesomeIcon icon ={faCalendarDay}/> Date: </small>
                        <small> <FontAwesomeIcon icon ={faNoteSticky}/> Note: </small>
                        <small> <FontAwesomeIcon icon ={faPesetaSign}/> Total: </small>
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
                        <tbody style={{height:"300px"}}>
                               
                        </tbody>
                    </Table>


                    </div>


                </div>
            </div>
        </div>

    );
}

export default SalesRecord;
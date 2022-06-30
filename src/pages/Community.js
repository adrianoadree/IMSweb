import { Card, Placeholder, Form, Button, Toast, ToastContainer } from "react-bootstrap";
import CommunityPosts from "../components/posts";
import Navigation from "../layout/Navigation";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserLarge } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";


function Community() {

    const [show, setShow] = useState(false);


  
    return (


        <div className="row bg-light">


            <Navigation />
            <div className="col-3" />
            <div className="col-6 p-5">

                <ToastContainer className="m-3" position='top-end'>
                    <Toast className="bg-success" onClose={() => setShow(false)} show={show} delay={3000} autohide>
                        <Toast.Header>
                            <strong className="me-auto">IMS</strong>
                        </Toast.Header>
                        <Toast.Body>
                            <span>Product <strong>SUCCESSFULLY ADDED</strong> to the Inventory</span>
                        </Toast.Body>
                    </Toast>
                </ToastContainer>

                <Card className="shadow mb-4">
                    <Card.Header className="bg-primary"><small className="text-white">Create Post</small></Card.Header>
                    <Card.Body>
                        <Form>
                            <Form.Control as="textarea" placeholder="Share something to the community" rows={2} />
                        </Form>
                    </Card.Body>
                    <Card.Footer className="bg-white">
                        <div className="row px-2">
                            <Button
                                onClick={() => setShow(true)}
                                variant="outline-primary">Post</Button>
                        </div>
                    </Card.Footer>
                </Card>

                <strong className="text-muted">Feed of Posts</strong><hr />
                <Card className="my-4 shadow">
                    <Card.Header className="bg-primary">
                        <div className="row">
                            <div className="col-10">
                                <small className="text-white"><FontAwesomeIcon icon={faUserLarge} /> USER</small>
                            </div>
                            <div className="col-2 ">
                                <small className="text-white" >Date</small>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <span>"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."</span>
                    </Card.Body>
                    <Card.Footer className="bg-light">
                        <div className="row">
                            <div className="col-12 text-muted">Comment Section</div>
                            <div className="row">
                                <div className="col-2">
                                    <FontAwesomeIcon icon={faUserLarge} /> USER
                                </div>
                                <div className="col-10">
                                    <input className="col-12" placeholder="Enter your comment here..."></input>
                                </div>
                            </div>
                        </div>
                    </Card.Footer>
                </Card>
                <Placeholder as="p" animation="glow">
                    <Placeholder lg={12} />
                </Placeholder>

                <CommunityPosts />


            </div>
            <div className="col-3" />

        </div>

    );
}

export default Community;
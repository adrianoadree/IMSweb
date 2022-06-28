import { Card, Form, Button, InputGroup, FormControl } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";

function LoginPage() {
    return (
        <div className="row bg-light" style={{ height: "667px" }}>
            <div className="col-1"></div>
            <div className="col-5 p-5">
                <div className="row bg-white border" style={{ height: "200px", width: "500px" }}></div>
                <br></br>
                <div className="row bg-white border" style={{ height: "300px", width: "500px" }}>
                    <div className="col-4 guide"></div>
                    <div className="col-4"></div>
                    <div className="col-4 guide"></div>
                </div>



            </div>


            <div className="col-5 p-5 ">
                <Card className="bg-white shadow">
                    <Card.Body style={{ height: "550px" }}>
                        <div className="row" style={{ height: "100px" }}>
                            <h1 className="mt-5 text-center">IMS</h1>
                        </div>
                        <div className="row p-4">
                            <br></br>
                            <Form.Label className="mt-5" htmlFor="formEmail">Email Address</Form.Label>
                            <InputGroup className="mb-3">
                                <InputGroup.Text className="bg-muted" id="basic-addon3">
                                    <FontAwesomeIcon icon={faUser} />
                                </InputGroup.Text>
                                <FormControl id="formEmail" placeholder="Enter email" aria-describedby="basic-addon3" />
                            </InputGroup>


                            <Form.Label htmlFor="formPassword">Password</Form.Label>
                            <InputGroup className="mb-3">
                                <InputGroup.Text className="bg-muted" id="basic-addon3">
                                    <FontAwesomeIcon icon={faLock} />
                                </InputGroup.Text>
                                <FormControl id="formPassword" placeholder="Password" aria-describedby="basic-addon3" />
                            </InputGroup>
                            <div className="row p-2">
                                <Button variant="primary" type="submit">
                                    Login
                                </Button>
                            </div>
                            <br></br>
                            <hr />
                            <div className="row px-5">
                                <Button variant="success" type="submit">
                                    Signup
                                </Button>
                            </div>


                        </div>



                    </Card.Body>
                </Card>

            </div>
            <div className="col-1"></div>


        </div>
    )

}
export default LoginPage;
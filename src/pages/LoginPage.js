import React from "react";
import { Card, Form, Button, InputGroup, FormControl, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import SignupModal from "../components/SignupModal";
import { auth } from "../firebase-config";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

function LoginPage({ isAuth, setIsAuth }) {

    const [isLoggedin, setisLoggedIn] = useState(false)
    const [signupModalShow, setSignupModalShow] = useState(false);
    const [show, setShow] = useState(false);

    const [user, setUser] = useState({});
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    let navigate = useNavigate();

    useEffect(() => {
        setisLoggedIn(isAuth)
        if (isAuth) {
            navigate("/");
        }
    }, []);


    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });


    const login = async () => {
        try {
            const user = await signInWithEmailAndPassword(
                auth,
                loginEmail,
                loginPassword
            );
            setIsAuth(true)
            setShow(false)
            navigate("/")
        } catch (error) {
            setShow(true)
            console.log(error.message);
        }
    };

    return (
        <div className="row bg-light" style={{ height: "667px" }}>
            <div className="col-3" />
            <div className="col-6 p-5 ">
                
                <Card className="bg-white shadow">
                    <Card.Body >
                        <div className="row" style={{ height: "100px" }}>
                            <h1 className="mt-5 text-center">IMS</h1>
                        </div>
                        <div className="row p-4">
                            <Alert show={show} variant="danger">
                                <p className="text-center">
                                    Wrong email or password. Please try again
                                </p>
                            </Alert>
                            <Form.Label className="mt-1" htmlFor="formEmail">Email Address</Form.Label>
                            <InputGroup className="mb-3">
                                <InputGroup.Text className="bg-muted" id="basic-addon3">
                                    <FontAwesomeIcon icon={faUser} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter email"
                                    onChange={(event) => {
                                        setLoginEmail(event.target.value);
                                    }} />
                            </InputGroup>


                            <Form.Label htmlFor="formPassword">Password</Form.Label>
                            <InputGroup className="mb-3">
                                <InputGroup.Text className="bg-muted" id="basic-addon3">
                                    <FontAwesomeIcon icon={faLock} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    placeholder="Password"
                                    onChange={(event) => {
                                        setLoginPassword(event.target.value);
                                    }} />

                            </InputGroup>
                            <div className="row p-2">
                                <Button
                                    variant="primary"
                                    onClick={login}>
                                    Login
                                </Button>
                            </div>
                            <br></br>
                            <hr />
                            <div className="row px-5">
                                <Button
                                    variant="success"
                                    onClick={() => setSignupModalShow(true)}>
                                    Signup
                                </Button>
                                <SignupModal
                                    show={signupModalShow}
                                    onHide={() => setSignupModalShow(false)}
                                />

                            </div>


                        </div>



                    </Card.Body>
                </Card>

            </div>
            <div className="col-3"></div>


        </div>
    )

}
export default LoginPage;
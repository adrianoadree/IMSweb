import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { createUserWithEmailAndPassword,signOut } from 'firebase/auth'
import { auth } from "../firebase-config";

function SignupModal(props) {

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [signupModalShow, setSignupModalShow] = useState(false);

   
    const register = async () => {
        try {
            const user = await createUserWithEmailAndPassword(auth,
                registerEmail,
                registerPassword
            );
            setSignupModalShow(false)
            await signOut(auth)
            console.log(user)
        } catch (error) {
            console.log(error.message);
        }
    };


    return (
        <Modal
            {...props}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    Create an Account
                </Modal.Title>
            </Modal.Header>


            <Modal.Body className="px-5">


                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Enter email"
                            onChange={(event) => {
                                setRegisterEmail(event.target.value);
                            }} />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            onChange={(event) => {
                                setRegisterPassword(event.target.value);
                            }} />
                    </Form.Group>
                    <Button variant="primary"
                    onClick={register}>
                        Submit
                    </Button>
                </Form>
            </Modal.Body>




            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );

}
export default SignupModal
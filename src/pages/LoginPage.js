import React, { useEffect, useState } from 'react';
import { GoogleButton } from 'react-google-button';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap';
import { db } from "../firebase-config";
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy } from "firebase/firestore";

const LoginPage = () => {

    const { googleSignIn, user, isNew } = UserAuth();
    const navigate = useNavigate();
    const [userID, setUserID] = useState("");

    const handleGoogleSignIn = async () => {
        try {
            await googleSignIn();
            
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => { 
        if (user != null) {
            navigate('/');
        }
    }, [user]);


    return (
        <div>
            <div id="login-page">
                <div className="row w-100 h-100">
                    <div className="col-8">

                    </div>
                    <div className="col-4 d-flex align-items-center justify-content-center p-5">
                        <div id="contents" className="d-flex align-items-center justify-content-center">
                            <div id="add-border">
                                <div className="w-100 h-100">           
                                    <div id="brand-image-container">
                                        <img id="brand-image" src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FLogo.png?alt=media&token=4a122e42-8aac-4f96-8221-453a40294d52">
                                        </img>
                                    </div>
                                    <div className="w-100 h-100 d-flex m-0 p-0 d-flex justify-content-center align-items-center flex-column">
                                        <div id="brand" className="mb-5">
                                            <h1>IMS</h1>
                                            <small>Inventory Management System</small>
                                        </div>
                                        <div id="google-button-container">
                                            <GoogleButton type="light" onClick={handleGoogleSignIn} className="google-button"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    }
export default LoginPage; 

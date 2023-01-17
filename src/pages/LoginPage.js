import React, { useEffect, useState } from 'react';
import { GoogleButton } from 'react-google-button';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { Button, Carousel } from 'react-bootstrap';
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
                    <div className="col-8 d-flex align-items-center justify-content-center p-5">
                        <Carousel className='backgroundshadowborder' style={{ width: '800px', height: '500px' }}>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src='https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FCarousel%2FCarousel1.png?alt=media&token=4a783367-b508-4a5e-b40d-7e947ead7abf'
                                    style={{ width: '800px', height: '500px' }}
                                />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src='https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FCarousel%2FCarousel2.png?alt=media&token=fabb70bf-70bc-4f4c-af55-4b0f4c8398b0'
                                    style={{ width: '800px', height: '500px' }}
                                />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src='https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FCarousel%2FCarousel3.png?alt=media&token=41edcdd5-44f6-476e-aed7-4ed8bd039329'
                                    style={{ width: '800px', height: '500px' }}
                                />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src='https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FCarousel%2FCarousel4.png?alt=media&token=0a7a0aab-1a64-4e84-ad61-a368e4d249c8'
                                    style={{ width: '800px', height: '500px' }}
                                />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src='https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FCarousel%2FCarousel5.png?alt=media&token=3740d619-c646-40a2-8cfa-2eb4228ef61e'
                                    style={{ width: '800px', height: '500px' }}
                                />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src='https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FCarousel%2FCarousel6.png?alt=media&token=616dac3e-0943-4098-b3ea-47d954a19b2e'
                                    style={{ width: '800px', height: '500px' }}
                                />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src='https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FCarousel%2FCarousel7.png?alt=media&token=42aec4ff-6f3e-44d4-b00f-1eff6e059a34'
                                    style={{ width: '800px', height: '500px' }}
                                />
                            </Carousel.Item>

                        </Carousel>
                    </div>
                    <div className="col-4 d-flex align-items-center justify-content-center p-5">
                        <div id="contents" className="px-0 d-flex align-items-center justify-content-center">
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
                                            <GoogleButton type="light" onClick={handleGoogleSignIn} className="google-button" />
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

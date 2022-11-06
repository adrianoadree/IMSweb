import React, { useEffect, useState } from 'react';
import { GoogleButton } from 'react-google-button';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap';
import { db } from "../firebase-config";
import Navigation from '../layout/Navigation';
import { collection, onSnapshot, query, doc, getDoc, deleteDoc, where, orderBy } from "firebase/firestore";
import  UserRouter  from '../pages/UserRouter'

const VerificationMessage = () => {

    const { googleSignIn, user, isNew } = UserAuth();
    const navigate = useNavigate();

    return (
        <div>
            <UserRouter
                route='/verify'
            />
            <Navigation
                page='/verify'
            />
            <div id="login-page" className="py-4 d-flex align-items-center justify-content-center">
                <div id="contents" className="d-flex align-items-center justify-content-center">
                    <div id="add-border" className="d-flex align-items-center justify-content-center">           
                        <div className="module-container d-flex align-items-center justify-content-center flex-column">
                            <h2 className="py-4">
                                <strong>
                                    Hey, {(user.displayName).split(" ")[0]}
                                </strong>
                            </h2>
                            <h4 className="py-1">
                                Your verification is underway.
                            </h4>
                            <br />
                            <h5 className="py-0">
                                This should take 2-5 business days.
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    }
export default VerificationMessage; 

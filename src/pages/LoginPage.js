import React, { useEffect } from 'react';
import { GoogleButton } from 'react-google-button';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoog } from '@fortawesome/free-solid-svg-icons'

const LoginPage = () => {

    const { googleSignIn, user } = UserAuth();
    const navigate = useNavigate();

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
            <div className='bg-light row p-5' style={{ height: "600px" }}>

                <div className='col-4'></div>
                <div className='col-4 bg-white shadow' >


                    <div className='row mt-4 p-5'>
                        <h1 className='text-center text-3xl font-bold py-8'>IMS</h1>
                        <small className='text-center text-muted'>Inventory Management System</small>

                    </div>
                    <div className='row p-5'>
                        <p className='text-center text-muted'>Login with</p>
                        <hr />
                            <GoogleButton onClick={handleGoogleSignIn}  style={{width:"500px"}}/>
                    </div>



                </div>
                <div className='col-4'></div>

            </div>
        </div>
    );
}
export default LoginPage;
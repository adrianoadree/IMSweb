import React from 'react';
import  UserRouter  from '../pages/UserRouter'

const MobileWarning = () => {

    return (
        <div>
            <UserRouter />
            <div id="mobile-warning">
                <div className="p-5 w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                    <div className="px-5 py-2 d-flex align-items-center justify-content-center flex-column">
                        <img id="brand-img-mobile" src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FLogo.png?alt=media&token=4a122e42-8aac-4f96-8221-453a40294d52"/>
                    </div>
                    <hr />
                    <div className="text-center" style={{backgroundColor: "#09151f", borderRadius: "10px", padding: "2em 1.5em", color: "#ffffff"}}>

                        <h2 className="mb-2"><strong>IMS Web works better on a PC</strong></h2>
                        <h6 style={{color: "#b2c6d6"}}>Please use IMS Mobile instead</h6>
                    </div>
                    <hr />
                </div>
            </div>
        </div>
    );
    }
export default MobileWarning; 

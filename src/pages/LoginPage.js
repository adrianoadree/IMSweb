import React, { useEffect, useRef, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'
import { Carousel } from 'react-bootstrap';
import Showcase from '../components/Showcase';

const LoginPage = () => {

    const { googleSignIn, user, } = UserAuth();
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        try {
            await googleSignIn();

        } catch (error) {
            console.log(error);
        }
    };

    const signInButtonRef = useRef(null)
    const [isScrolling, setIsScrolling] = useState()
    const warehouseMappingImages = ["https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fwarehouse_mapping_map.png?alt=media&token=62802399-6c0a-4d43-b37f-a7c87b557c45","https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fwarehouse_mapping_choices.png?alt=media&token=4f8475f0-c6cc-4c51-9d4c-82d134e9a0a5","https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fwarehouse_mapping_storage.png?alt=media&token=4fdbd0b1-d9e6-4c6f-8c5d-2cfee786d748"]

    useEffect(() => {
        if (user != null) {
            navigate('/');
        }
    }, [user]);


    useEffect(() => {
        var timer = null; 
        window.addEventListener("scroll", function() {
            if(timer !== null) {
                clearTimeout(timer);
                setIsScrolling(true)
            }
            timer = setTimeout(function() {
                setIsScrolling(false)
            }, 750);
        }, false);
      }, [])

    useEffect(() => {
        if(isScrolling) {
            signInButtonRef.current.classList.add('hidden')
        }
        else {
            signInButtonRef.current.classList.remove('hidden')
        }
    }, [isScrolling])

    function DraggableCarousel (props) {
        var original_image_sequence = props.images;
        const [centerImage, setCenterImage] = useState(original_image_sequence[0]);
        const [leftImage, setLeftImage] = useState(original_image_sequence[1]);
        const [rightImage, setRightImage] = useState(original_image_sequence[2]);

        const changeImage = (image_order, images) => {
            if(image_order == "left") {
                setCenterImage(images[1])
                setLeftImage(images[0])
                setRightImage(images[2])
            }
            else if(image_order == "right") {
                setCenterImage(images[2])
                setLeftImage(images[0])
                setRightImage(images[1])
            }
        }
    
        return (
            <div id="draggable-carousel" className="d-flex align-items-center justify-content-center">
                <div 
                    id="left-image"
                    onClick={() => {changeImage("left", [centerImage, leftImage, rightImage])}}
                >
                    <img src={leftImage}/>
                </div>
                <div 
                    id="center-image"
                    onClick={() => {changeImage("center", [centerImage, leftImage, rightImage])}}
                >
                    <img src={centerImage}/>
                </div>
                <div 
                    id="right-image"
                    onClick={() => {changeImage("right", [centerImage, leftImage, rightImage])}}
                >
                    <img src={rightImage}/>
                </div>
            </div>
        )
    }

    return (
        <div  style={{backgroundColor: "#ffffff"}}>
            <div id="login-page">
                <div ref={signInButtonRef} id="contents" className="d-flex align-items-center justify-content-between">
                        <button id="sign-in-button" onClick={handleGoogleSignIn}>
                            <div>Sign in or Sign Up</div>
                            <small>powered by <span id="google-logo">Google</span></small>
                        </button>
                    </div>
                    <div id="showcase">
                        <section id="overview" className="px-10perc">
                            <div className="w-100 h-100 row m-0 p-0">
                                <div className="col-6 d-flex justify-content-center flex-column">
                                    <img id="brand-image" src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2FLogo.png?alt=media&token=4a122e42-8aac-4f96-8221-453a40294d52"/>
                                        <h0>
                                            <strong>IMS</strong>
                                        </h0>
                                        <h3-4>
                                            Inventory Management System
                                        </h3-4>
                                        <h5 className="mt-5">
                                            Manage your inventory anywhere.
                                        </h5>
                                        <h6 id="bottom-info" className="mt-5 text-muted">
                                            Scroll down to learn more
                                        </h6>
                                </div>
                                <div className="col-6">
                                    <img id="figure" src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Foverview.png?alt=media&token=d2ae9120-8b6d-47a6-ac2a-16e1f46b5f4f"/>
                                </div>
                            </div>
                        </section>
                        <section id="mobile-companion">
                            <div className="w-100 h-100 row m-0 p-0">
                                <div 
                                    className="col-5 px-10perc pe-2 d-flex justify-content-center flex-column align-items-end"
                                    style={{backgroundColor: "#80cfff"}}
                                >
                                    <div className="d-flex align-items-center justify-content-right flex-row">
                                        <div className="p-5">
                                            <img src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fmobile_app.png?alt=media&token=c3e15b69-7f77-4413-8127-efe0507c7e41" style={{width: "100%", height: "100%"}}/>
                                        </div>
                                        <div className="text-right">
                                            <h1-4 style={{color: "#ffffff"}}>
                                                mobile
                                            </h1-4>
                                            <h4 className="mt-4">
                                                Portable
                                            </h4>
                                            <h4 className="mt-4">
                                                Multi-user
                                            </h4>
                                            <h4 className="mt-4">
                                                Hybrid
                                            </h4>
                                        </div>
                                    </div>
                                </div>
                                <div 
                                    className="col-7 px-10perc ps-2 d-flex justify-content-center flex-column align-items-start" 
                                    style={{backgroundColor: "#ffffff", color: "#80cfff"}}
                                >
                                    <div className="d-flex align-items-center justify-content-right flex-row">
                                        <div className="text-right">
                                            <h1-4 className="mb-5">
                                                companion
                                            </h1-4>
                                            <h6 className="mt-4" style={{color: "#000000"}}>
                                                Transactions can also be made in the app
                                            </h6>
                                            <h6 className="mt-4" style={{color: "#000000"}}>
                                                User-ownership allows the app to be used by multiple employees at the same time
                                            </h6>
                                            <h6 className="mt-4" style={{color: "#000000"}}>
                                                Users can use the app online and offline
                                            </h6>
                                        </div>
                                        <div className="p-5">
                                            <img src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fweb_app_half.png?alt=media&token=e43076f9-ff1f-43f8-afc9-7b2496f1dd49" style={{width: "100%", height: "100%"}}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section id="warehouse-mapping">
                            <div className="w-100 h-100 row m-0 p-0">
                                <div
                                    className="col-6 px-10perc pe-5 d-flex justify-content-center flex-column align-items-end"
                                    style={{backgroundColor: "#fafbfc"}}
                                >
                                <DraggableCarousel 
                                    images = {warehouseMappingImages}
                                />
                                </div>
                                <div
                                    className="col-6 px-10perc ps-4 d-flex justify-content-center flex-column align-items-end"
                                    style={{backgroundColor: "#fafbfc"}}
                                >
                                    <div className="text-right">
                                        <h1-4 style={{ color: "#4172c1" }}>
                                            warehouse mapping
                                        </h1-4>
                                        <h4 className="mt-4">
                                            Customizable and Searchable
                                        </h4>
                                        <h6 className="mt-5">
                                            Have a minimap of your warehouse and know the locations of your product
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section id="inventory-forecasting">
                            <div className="w-100 h-100 row m-0 p-0">
                                <div 
                                    className="col-4 px-10perc pe-5 d-flex justify-content-center flex-column align-items-end"
                                    style={{backgroundColor: "#ffffff"}}
                                >
                                    <div className="d-flex align-items-start justify-content-center flex-column">
                                        <img 
                                            src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Freorder_notifications_1.png?alt=media&token=b1a5570c-f025-4d89-9b7e-4fbf7e537902" 
                                            style={{width: "100%", height: "100%"}}
                                            className="mb-3 reorder-notification"
                                        />
                                        <img 
                                            src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Freorder_notifications_2.png?alt=media&token=94a8436e-12ca-4ccc-9abe-778ede46ed38" 
                                            style={{width: "100%", height: "100%"}}
                                            className="mb-3 reorder-notification delay-1s"
                                        />
                                        <img 
                                            src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Freorder_notifications_3.png?alt=media&token=c6521787-2739-4180-a9a0-2558fb9a6bdb" 
                                            style={{width: "100%", height: "100%"}}
                                            className="mb-3 reorder-notification delay-2s"
                                        />
                                    </div>
                                </div>
                                <div 
                                    className="col-3 px-2 d-flex justify-content-center flex-column align-items-end"
                                    style={{backgroundColor: "#ffffff"}}
                                >
                                    <div className="d-flex align-items-center justify-content-right flex-row">
                                        <div className="text-center">
                                            <h1-4>
                                                analytics
                                            </h1-4>
                                            <h4 className="mt-4">
                                                Instantaneous and Adaptive
                                            </h4>
                                            <h6 className="mt-5">
                                                Receive projections on inventory depletion and reordering dates
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                                <div 
                                    className="col-5 px-10perc ps-2 d-flex justify-content-center flex-column align-items-end"
                                    style={{backgroundColor: "#ffffff"}}
                                >
                                    <div id="analytics" className="w-100 h-100 d-flex align-items-center justify-content-right flex-row">
                                        <div className="w-100 h-100 p-0 m-0">
                                            <img 
                                                src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fanalytics_mini_trend.png?alt=media&token=502d9a41-b6fc-4031-bf14-70d0d5a5fbc2"
                                                style={{width: "100%", height: "100%", objectFit: "contain"}}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section 
                            id="codes-generation"
                            style={{backgroundColor: "#80cfff"}}
                        >
                            <div className="w-100 h-100 row m-0 p-0">
                                <div className="col-6 px-10perc pe-0 d-flex justify-content-center flex-column align-items-end">
                                    <div className="text-right">
                                        <h1-4 style={{color: "#ffffff"}}>
                                            barcode autogeneration
                                        </h1-4>
                                        <h4 className="mt-4">
                                            Printable & Scannable
                                        </h4>
                                        <h6 className="mt-5">
                                            When added into the stockcard, a product is automatically assigned with a unique barcode
                                        </h6>
                                    </div>
                                </div>
                                <div className="col-6 px-10perc ps-2 d-flex justify-content-center flex-column align-items-end">
                                    <img 
                                        src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fbarcode_generation.png?alt=media&token=317bb667-7f7b-4369-8e18-3cd7ce87f465"
                                        style={{width: "100%", height: "100%", objectFit: "contain"}}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>
            </div>
        </div>
    );
}
export default LoginPage; 

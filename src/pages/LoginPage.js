import React, { useEffect, useRef, useState } from 'react';
import { UserAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload} from '@fortawesome/free-solid-svg-icons';
import Carousel from 'react-bootstrap/Carousel';

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

    const [width, setWidth] = useState(window.innerWidth);
    function handleWindowSizeChange() {
        setWidth(window.innerWidth);
      }
      useEffect(() => {
          window.addEventListener('resize', handleWindowSizeChange);
          return () => {
              window.removeEventListener('resize', handleWindowSizeChange);
          }
      }, []);
      
      const isMobile = width <= 768;

    useEffect(() => {
        if (user != null) {
            navigate('/');
        }
    }, [user]);

    function MobileLoginPage() {
        const carousel_content = [
        {caption: "Quick Access Dashboard", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_dashboard.png?alt=media&token=2840ec02-bb7f-4858-aea5-2bc3744530c1"},
        {caption: "Multi-user", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_user-select.png?alt=media&token=035ed65b-a6c7-4eb4-bb36-23463b4ab27e"},
        {caption: "Record Viewing", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_records.png?alt=media&token=d01ad8b4-f6ea-407a-a596-efbc7f04a5e6"},
        {caption: "Barcode Scanning", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_barcode-scanning.png?alt=media&token=ceec8bae-9142-4b30-98c9-d11284321001"},
        {caption: "Warehouse Map Viewing", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_warehouse.png?alt=media&token=ace42c49-5dde-4fbf-8569-73d6235024b7"},
        {caption: "Analytics", img: "https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_analytics.png?alt=media&token=b0b6cb8b-0edd-4f44-8f98-4c9adbe9334d"}
    ]
        return (
            <div id="mobile-warning" style={{ background: "#ffffff" }}>
                <div className="p-5 w-100 h-100 d-flex align-items-center justify-content-center flex-column">
                    <div id="IMS-carousel-container" className="mb-2">
                        <div className="w-100 h-auto m-0 p-0">
                            <img
                                src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_border_top.png?alt=media&token=e477553b-05d3-435b-9cc6-1fc643183f97"
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                        </div>
                        <div className="w-100 h-auto p-0 d-flex align-items-center justify-content-center flex-row" style={{marginTop: '-1px'}}>
                            <div className="m-0 p-0">
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_border_left.png?alt=media&token=0c735225-3219-4421-91d7-b4e32a7762b1"
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                />
                            </div>
                            <div className="m-0 p-0">
                                <Carousel
                                    id="IMS-carousel"
                                >
                                    {carousel_content.map((item)=>{
                                        return(
                                            <Carousel.Item>
                                                <img
                                                    src={item.img}
                                                    alt="Mobile Companion"
                                                >
                                                </img>
                                                <Carousel.Caption>
                                                    <h5>
                                                        {item.caption}
                                                    </h5>
                                                </Carousel.Caption>
                                            </Carousel.Item>
                                        )
                                    })}
                                </Carousel>
                            </div>
                            <div className="m-0 p-0">
                                <img
                                    src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_border_right.png?alt=media&token=ddc0b349-4fc4-4d1f-a2f6-faa58af1c011"
                                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                />
                            </div>
                        </div>
                        <div className="w-100 h-auto p-0" style={{marginTop: '-2px'}}>
                            <img
                                src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fslide_border_bottom.png?alt=media&token=b5b4d530-f24b-442e-b9c4-292c6004a1da"
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            />
                        </div>
                    </div>
                    <h3 className="mt-5 mb-5"><strong>IMS is also available on <span style={{ color: "#3DDC84" }}>Android</span></strong></h3>
                    <button className="edit d-flex align-items-center justify-content-center" style={{ padding: "0.5em 1em" }}>
                        <h3 className="pe-3" style={{ borderRight: "1px solid #b2c6d6" }}><FontAwesomeIcon icon={faDownload} /></h3>
                        <h4 className="ps-3">Download Now</h4>
                    </button>
                </div>
            </div>
        )
    }

    function MainLoginPage()
    { 

        const signInButtonRef = useRef(null)
        const [isScrolling, setIsScrolling] = useState()
        const warehouseMappingImages = ["https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fwarehouse_mapping_map.png?alt=media&token=62802399-6c0a-4d43-b37f-a7c87b557c45","https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fwarehouse_mapping_choices.png?alt=media&token=4f8475f0-c6cc-4c51-9d4c-82d134e9a0a5","https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Fwarehouse_mapping_storage.png?alt=media&token=4fdbd0b1-d9e6-4c6f-8c5d-2cfee786d748"]
        
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
                                                    src="https://firebasestorage.googleapis.com/v0/b/inventoryapp-330808.appspot.com/o/system%2Flogin_page%2Freorder_notifications.png?alt=media&token=905c6c6e-df35-4710-899c-d0eb198b55fd" 
                                                    style={{width: "100%", height: "100%", objectFit: "contain"}}
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
            )
    }
    return (
        <>
        {isMobile?
        <MobileLoginPage/>
        :
        <MainLoginPage/>
        }
        </>
    );
}
export default LoginPage; 

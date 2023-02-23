import React, { useEffect } from 'react';
import { useState } from 'react';
import { db } from '../firebase-config';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';

import { UserAuth } from '../context/AuthContext'

import { ListGroup } from "react-bootstrap";
import { CaretDown, CaretUp } from 'react-ionicons'

function Tips(props) {
  const { user } = UserAuth(); // user credentials
  const userCollectionRef = collection(db, "user"); // users collection reference
  const [userCollection, setUserCollection] = useState([]); // users collection 
  const [userID, setUserID] = useState(""); // user id
  const [userName, setUserName] = useState(""); // user name
  const [isNew, setIsNew] = useState(false); // user newness
  const [preferencesTips, setPreferencesTips] = useState() // user tips preference setting

  const [shown, setShown] = useState(true); // listener if the tips is maximized or not
  const [tips, setTips] = useState(); // all system tips
  const [tipsToDisplay, setTipsToDisplay] = useState(); // current page tip data
  const [tipId, setTipId] = useState() // selected tip id
  const [tipsIfNew, setTipsIfNew] = useState(); // tips if user is new
  const [tipDescriptions, setTipDescriptions] = useState() // selected tip descriptions

  const [changedView, setChangedView] = useState(false) // listener if tips subtopic is changed

  //=============================== START OF STATE LISTENERS ===============================
  // fetch system tips
  useEffect(() => {
    onSnapshot(doc(db, "masterdata", "aids"), (doc) => {
      setTips(doc.data().tips);
      setTipsIfNew(doc.data().tipsIfNew);
      if (changedView) {
        setChangedView(false)
      }
      else {
        setChangedView(true)
      }
    }, []);
  }, [isNew])

  // fetch user id
  useEffect(() => {
    if (user) {
      setUserID(user.uid)
    }
  }, [{ user }])

  // fetch user collection
  useEffect(() => {
    if (userID === undefined) {
      const q = query(userCollectionRef, where("user", "==", "DONOTDELETE"));

      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;
    }
    else {
      const userCollectionRef = collection(db, "user");
      const q = query(userCollectionRef, where("user", "==", userID));

      const unsub = onSnapshot(q, (snapshot) =>
        setUserCollection(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
      );
      return unsub;

    }
  }, [userID])

  // fetch current user profile
  useEffect(() => {
    userCollection.map((metadata) => {
      setPreferencesTips(metadata.preferences.showTips);
      setUserName(metadata.name);
      setIsNew(metadata.isNew)
    });
  }, [userCollection])

  // maximize/minimize tips
  useEffect(() => {
    var bnr = document.getElementById("banner");
    if (preferencesTips) {
      if (shown) {
        bnr.style.display = "block";
      }
      else {
        bnr.style.display = "none";
      }
    }
    else {

    }
  }, [shown])

  // change tips to display according to active page
  useEffect(() => {
    if (tips === undefined && tipsIfNew === undefined) {

    }
    else {
      switch (props.page) {
        case '/warehouse':
          isNew ? setTipsToDisplay(tipsIfNew.warehouse) : expandTipsToDisplay(tips.warehouse)
          setTipId(0)
          break;
        case '/purchase':
          isNew ? setTipsToDisplay(tipsIfNew.purchase) : expandTipsToDisplay(tips.purchase)
          setTipId(0)
          break;
        case '/sales':
          isNew ? setTipsToDisplay(tipsIfNew.sales) : expandTipsToDisplay(tips.sales)
          setTipId(0)
          break;
        case '/stockcard':
          isNew ? setTipsToDisplay(tipsIfNew.stockcard) : expandTipsToDisplay(tips.stockcard)
          setTipId(0)
          break;
        case '/analytics':
          isNew ? setTipsToDisplay(tipsIfNew.analytics) : expandTipsToDisplay(tips.analytics)
          setTipId(0)
          break;
        case '/supplier':
          isNew ? setTipsToDisplay(tipsIfNew.supplier) : expandTipsToDisplay(tips.supplier)
          setTipId(0)
          break;
        case '/profileManagement':
          isNew ? setTipsToDisplay(tipsIfNew.profilemanagement) : expandTipsToDisplay(tips.profilemanagement)
          setTipId(0)
          break;
        case '/verify':
          isNew ? setTipsToDisplay(tipsIfNew.verify) : expandTipsToDisplay(tips.verify)
          setTipId(0)
          break;
        case '/home':
          isNew ? setTipsToDisplay(tipsIfNew.home) : expandTipsToDisplay(tips.home)
          setTipId(0)
          break;
        case '/supplier':
          isNew ? setTipsToDisplay(tipsIfNew.supplier) : expandTipsToDisplay(tips.supplier)
          setTipId(0)
          break;
        case '/printbar':
          isNew ? setTipsToDisplay(tipsIfNew.printbar) : expandTipsToDisplay(tips.printbar)
          setTipId(0)
          break;
        case '/printqr':
          isNew ? setTipsToDisplay(tipsIfNew.printqr) : expandTipsToDisplay(tips.printqr)
          setTipId(0)
          break;
        case '/reports':
          isNew ? setTipsToDisplay(tipsIfNew.reports) : expandTipsToDisplay(tips.reports)
          setTipId(0)
          break;
        case '/analytics':
          isNew ? setTipsToDisplay(tipsIfNew.analytics) : expandTipsToDisplay(tips.analytics)
          setTipId(0)
          break;
        case '/inventoryadjustment':
          isNew ? setTipsToDisplay(tipsIfNew.adjustment) : expandTipsToDisplay(tips.adjustment)
          setTipId(0)
          break;
        default: setTipsToDisplay(["hello"])
      }
    }
  }, [tips && tipsIfNew])

  // pool descriptions on user event
  useEffect(() => {
    if (tipId === undefined) {

    }
    else {
      setTipDescriptions(tipsToDisplay[tipId].descriptions)
    }
  }, [tipId || changedView])
  //================================ END OF STATE LISTENERS ================================
  //------------------------------- START OF HANDLERS -------------------------------

  // placeholder for tips to display
  const expandTipsToDisplay = (tips_to_display) => {
    var temp_tips_to_display = tips_to_display
    while (temp_tips_to_display.length < 4) {
      temp_tips_to_display.push({ "topic": "|", "description": ["|", "|"] })
    }
    setTipsToDisplay(temp_tips_to_display)
  }

  // change selected tip id
  const handleTopicChange = (topic) => {
    tipsToDisplay.map((tip, index) => {
      if (tip.topic == topic) {
        setTipId(index)
      }
    })
  }
  //=================================== END OF HANDLERS  ===================================

  return (
    <>
      {preferencesTips ?
        <div id="banner-container" className={isNew ? "" : "customer-old"}>
          <div id="banner">
            <div id="banner-left">
              {isNew === undefined ?
                <></>
              :
                <>
                  {isNew ?
                    <h1>
                      <span className="f-cursive">
                        Welcome
                      </span>
                      <span> {userName.split(" ")[0]},</span>
                    </h1>
                  :
                    <>
                      {tipsToDisplay === undefined || tipsToDisplay.length == 0 ?
                        <></>
                      :
                        <ListGroup defaultActiveKey={tipsToDisplay[0].topic}>
                          {tipsToDisplay.map((tipItem) => (
                            <ListGroup.Item
                              action
                              eventKey={tipItem.topic}
                              key={tipItem.topic}
                              onClick={() => { handleTopicChange(tipItem.topic) }}
                              className={tipItem.topic == "|" ? "empty-topic" : ""}
                            >
                              {tipItem.topic}
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      }
                    </>
                  }
                </>
              }
            </div>
            <div id="banner-divider">
            </div>
            <div id="banner-right">
              {tipDescriptions === undefined || tipDescriptions.length == 0 ?
                <></>
              :
                <>
                  {isNew ? <h5><strong>{tipsToDisplay[0].topic}</strong></h5> : <></>}
                  {tipDescriptions.map((tip, index) => {
                    return (
                      <div className="tip-item d-flex align-items-center">
                        <div className="d-flex justify-content-center align-items-center me-2">
                          <div className="circle-small green d-flex justify-content-center align-items-center">
                            <strong>{isNew ? <>&#9679;</> : index + 1}</strong>
                          </div>
                        </div>
                        <div>
                          {tip}
                        </div>
                      </div>
                    );
                  })}
                </>
              }
            </div>
          </div>
          <div id="banner-footer" className="d-flex justify-content-end align-items-center">
            <button
              id="banner-visibility-toggle"
              className="plain-button d-flex justify-content-end align-items-center"
              data-title={shown ? "Minimize" : "Maximize"}
              onClick={() => { shown ? setShown(false) : setShown(true) }}
            >
              {shown ?
                <CaretUp
                  color={'#000000'}
                  height="15px"
                  width="15px"
                />
              :
                <CaretDown
                  color={'#000000'}
                  height="15px"
                  width="15px"
                />
              }
            </button>
          </div>
        </div>
      :
        <></>
      }</>
  )
}

export default Tips;
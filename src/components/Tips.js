import React, { useEffect } from 'react';
import { Checkbox, CaretDown, CaretUp } from 'react-ionicons'
import { useState } from 'react';
import { db } from '../firebase-config';
import { doc, onSnapshot, } from 'firebase/firestore';
import { ListGroup } from "react-bootstrap";




function Tips(props) {

  const [shown, setShown] = useState(true);
  const [tipDescriptions, setTipDescriptions] = useState()
  const [tips, setTips] = useState();
  const [tipId, setTipId] = useState()
  const [tipsIfNew, setTipsIfNew] = useState();
  const [tipsToDisplay, setTipsToDisplay] = useState();
  const [changedView, setChangedView] = useState(false)

  useEffect(()=>{
    var bnr = document.getElementById("banner");
    if(shown) {
      bnr.style.display = "block";
    }
    else
    {
      bnr.style.display = "none";
    }
  }, [shown])

 
  const expandTipsToDisplay = (tips_to_display) => {
    var temp_tips_to_display = tips_to_display
    while(temp_tips_to_display.length < 4)
    {
      temp_tips_to_display.push({"topic": "|", "description": ["|", "|"]})
    }
    setTipsToDisplay(temp_tips_to_display)
  }


    useEffect(()=>{
      onSnapshot(doc(db, "masterdata", "aids"), (doc) => {
        setTips(doc.data().tips);
        setTipsIfNew(doc.data().tipsIfNew);
      if(changedView)
      {
        setChangedView(false)
      }
      else
      {
        setChangedView(true)
      }
      }, []);
    }, [props.isNew])

  
    useEffect(()=>{
      if(tips === undefined && tipsIfNew === undefined) {
        
      }
      else
      {
        switch(props.page) {
          case '/warehouse':
            props.isNew? setTipsToDisplay(tipsIfNew.warehouse):expandTipsToDisplay(tips.warehouse)
            setTipId(0)
            break;
          case '/purchase':
            props.isNew? setTipsToDisplay(tipsIfNew.purchase):expandTipsToDisplay(tips.purchase)
            setTipId(0)
          break;
            case '/sales':
            props.isNew? setTipsToDisplay(tipsIfNew.sales):expandTipsToDisplay(tips.sales)
            setTipId(0)
          break;
            case '/stockcard':
            props.isNew? setTipsToDisplay(tipsIfNew.stockcard):expandTipsToDisplay(tips.stockcard)
            setTipId(0)
            break;
          case '/analytics':
            props.isNew? setTipsToDisplay(tipsIfNew.analytics):expandTipsToDisplay(tips.analytics)
            setTipId(0)
            break;
          case '/supplier':
            props.isNew? setTipsToDisplay(tipsIfNew.supplier):expandTipsToDisplay(tips.supplier)
            setTipId(0)
            break;
          case '/profileManagement':
            props.isNew? setTipsToDisplay(tipsIfNew.profilemanagement):expandTipsToDisplay(tips.profilemanagement)
            setTipId(0)
            break;
          case '/verify':
            props.isNew? setTipsToDisplay(tipsIfNew.verify):expandTipsToDisplay(tips.verify)
            setTipId(0)
            break;
          case '/home':
            props.isNew? setTipsToDisplay(tipsIfNew.home):expandTipsToDisplay(tips.home)
            setTipId(0)
            break;
          case '/supplier':
            props.isNew? setTipsToDisplay(tipsIfNew.supplier):expandTipsToDisplay(tips.supplier)
            setTipId(0)
            break;
          case '/printbar':
            props.isNew? setTipsToDisplay(tipsIfNew.printbar):expandTipsToDisplay(tips.printbar)
            setTipId(0)
            break;
          case '/printqr':
            props.isNew? setTipsToDisplay(tipsIfNew.printqr):expandTipsToDisplay(tips.printqr)
            setTipId(0)
            break;
          case '/reports':
            props.isNew? setTipsToDisplay(tipsIfNew.reports):expandTipsToDisplay(tips.reports)
            setTipId(0)
            break;
          case '/analytics':
            props.isNew? setTipsToDisplay(tipsIfNew.analytics):expandTipsToDisplay(tips.analytics)
            setTipId(0)
            break;
          case '/inventoryadjustment':
            props.isNew? setTipsToDisplay(tipsIfNew.adjustment):expandTipsToDisplay(tips.adjustment)
            setTipId(0)
            break;
          default: setTipsToDisplay(["hello"])
        }
      }
    }, [tips && tipsIfNew])
      
    useEffect(() => {
      if(tipId === undefined)
      {
  
      }
      else
      {
        setTipDescriptions(tipsToDisplay[tipId].descriptions)
      }
    }, [tipId || changedView])
  
  const handleTopicChange = (topic) => {
    tipsToDisplay.map((tip, index)=>{
      if(tip.topic == topic)
      {
        setTipId(index)
      }
    })
  }

useEffect(()=>{
  console.log(tipsToDisplay)
})

  var name = props.name;
  var fname = name.split(" ")[0];

  return(
    <div id="banner-container" className={props.isNew?"":"customer-old"}>
      <div id="banner">
        <div id="banner-left">
            {props.isNew === undefined?
              <></>
            :
              <>
                {props.isNew?
                  <h1>
                    <span className="f-cursive">
                      Welcome 
                    </span>
                    <span> {fname},</span>
                  </h1>
                :
                  <>
                    {tipsToDisplay === undefined || tipsToDisplay.length == 0?
                      <></>
                    :
                    <ListGroup defaultActiveKey={tipsToDisplay[0].topic}>
                      {tipsToDisplay.map((tipItem)=>(
                          <ListGroup.Item
                            action
                            eventKey={tipItem.topic}
                            key={tipItem.topic}
                            onClick={() => { handleTopicChange(tipItem.topic) }}
                            className={tipItem.topic == "|"?"empty-topic":""}
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
          {tipDescriptions === undefined || tipDescriptions.length == 0?
            <></>
          :
            <>
              {props.isNew?<h5><strong>{tipsToDisplay[0].topic}</strong></h5>:<></>}
                {tipDescriptions.map((tip, index )=>{
                  return(
                    <div className="tip-item d-flex align-items-center">
                      <div className="d-flex justify-content-center align-items-center me-2">
                        <div className="circle-small green d-flex justify-content-center align-items-center">
                          <strong>{props.isNew?<>&#9679;</>:index + 1}</strong>
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
          data-title={shown?"Minimize":"Maximize"}
          onClick={() => {shown?setShown(false):setShown(true)}}
        >
          {shown?
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
  )
}

export default Tips;
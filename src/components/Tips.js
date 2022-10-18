import React, { useEffect } from 'react';
import { Checkbox, CaretDown, CaretUp } from 'react-ionicons'
import { useState } from 'react';
import { db } from '../firebase-config';
import { doc, onSnapshot, } from 'firebase/firestore';




function Tips(props) {

  const [shown, setShown] = useState(true);
  const [tips, setTips] = useState([]);
  const [tipsIfNew, setTipsIfNew] = useState([]);
  const [tipsToDisplay, setTipsToDisplay] = useState([]);
  const toggle=() =>{
    var bnr = document.getElementById("banner");
    var tgl = document.getElementById("banner-visibility-toggle");
    if (bnr.style.display === "none") {
      bnr.style.display = "block";
      tgl.setAttribute("data-title","Hide");
      setShown(true);
    } else {
      bnr.style.display = "none";
      tgl.setAttribute("data-title","Show");
      setShown(false);
    }
  }
  
    
  const getAids = () => {
    onSnapshot(doc(db, "masterdata", "aids"), (doc) => {
        setTips(doc.data().tips);
        setTipsIfNew(doc.data().tipsIfNew);
    }, []);
  }
    
  useEffect(()=>{
    if(tips === undefined || tipsIfNew === undefined) {
      
    }
    else
    {
      getAids();
      switch(props.page) {
        case '/warehouse': props.new? setTipsToDisplay(tipsIfNew.warehouse):setTipsToDisplay(tips.warehouse)
          break;
        case '/purchase':  props.new? setTipsToDisplay(tipsIfNew.purchase):setTipsToDisplay(tips.purchase)
        break;
          case '/sales': props.new? setTipsToDisplay(tipsIfNew.sales):setTipsToDisplay(tips.sales)
        break;
          case '/stockcard': props.new? setTipsToDisplay(tipsIfNew.stockcard):setTipsToDisplay(tips.stockcard)
        break;
        case '/analytics': props.new? setTipsToDisplay(tipsIfNew.analytics):setTipsToDisplay(tips.analytics)
          break;
        case '/supplier': props.new? setTipsToDisplay(tipsIfNew.supplier):setTipsToDisplay(tips.supplier)
          break;
        default: setTipsToDisplay(["",""])
      }
    }
  }, [tips])
    
  useEffect(() =>{
    console.log('set' + setTipsToDisplay)
  })

  var name = props.name;
  var fname = name.split(" ")[0];

  return(
    <div id="banner-container">
      <div id="banner">
        <div id="banner-left">
        <h1>
          <span className="f-cursive">
            {props.isNew === undefined?
              <>
              </>
            :
              <>
              {props.isNew?
                <>
                  Welcome 
                </>
              :
                <>
                  Hey 
                </>
              }
              </>
            }
          </span>
          <span> </span>{fname}!</h1>
        </div>
          
        <div id="banner-right">
        
        {tipsToDisplay === undefined?
            <>
            </>
            :
            <>
            {tipsToDisplay.map((tip, index )=>{
                  return(
                    <>
                      <Checkbox
                      className="me-2 pull-down"
                      color={'#80b200'} 
                      title={'Category'}
                      height="25px"
                      width="25px"
                      />
                      {tip}
                      <br />
                    </>
                  );
              })}
            </>
            }
        </div>
      
</div>
<div id="banner-footer">
        <button
          id="banner-visibility-toggle"
          className="hide float-end"
          data-title="Hide"
          onClick={() => toggle()}
        >
          {shown?
            <CaretUp
              className="caret pull-down"
              color={'#000000'} 
              title={'Category'}
              height="15px"
              width="15px"
            />
            :
            <CaretDown
            className="caret pull-down"
            color={'#000000'} 
            title={'Category'}
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
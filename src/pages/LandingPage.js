import ReportToday from "../components/reportstoday";
import ReportYesterday from '../components/reportyesterday';
import Navigation from "../layout/Navigation";


function LandingPage(){


    return(
        <div className="row bg-light">
            <Navigation/>
            <div className="col-1"/>

            <div className="col-5 p-5" >
                <ReportYesterday/>
            </div>

            <div className="col-5 p-5" >
                <ReportToday/>
            </div>




            <div className="col-1"/>

        </div>
    )
}
export default LandingPage;
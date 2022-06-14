function ReportToday(){
    return(
        <div>


        <div className="card">
            <div className="card-header text-white bg-primary p-3" style={{ height: '80px' }} >
                <h5>Today's Report</h5>
                <small>Saturday, March 26, 2022</small>
            </div>
            <div className="card-body row">
              
              <div className="card-body col-6">
              <div className='card mb-3'>
                  <div className="card-header text-white bg-primary ">Purchase</div>
                  <div className="card-body">
                      <ul className="list-group list-group-flush bg-white" style={{ height: '370px' }}>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                      </ul>
                  </div>
                  <div className="card-footer text-white bg-primary">Total: </div>
              </div>
              </div>

              <div className="card-body col-6">
              <div className='card mb-3'>
                  <div className="card-header text-white bg-primary ">Sales</div>
                  <div className="card-body">
                      <ul className="list-group list-group-flush bg-white" style={{ height: '370px' }}>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                          <li class="list-group-item"><small>Item Name{1+2+3+1}</small></li>
                      </ul>
                  </div>
                  <div className="card-footer text-white bg-primary">Total: </div>
              </div>
              </div>



            </div>
            
            <div className="card-footer text-white bg-primary" ></div>

        </div>





</div>




    );
}

export default ReportToday;
import { Table } from "react-bootstrap";

const tableval = [
    {
        itemcode: '1123',
        quantity: '4',
        description: 'bondpaper',
        amount: 'P123',
        extension: 'fullpaid'
    },

    {
        itemcode: '5541',
        quantity: '2',
        description: 'sand',
        amount: 'P155',
        extension: 'partial'
    }
]




function TableData(){
    return(
        <Table striped bordered hover size="sm">
            <thead>
                <tr>
                <th>Item Code</th>
                <th>Quantity</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Extension</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                </tr>
                <tr>
                    <td>2</td>
                        {tableval.map((val)=>{
                            return <td key={val.itemcode}>{val.description}</td> 
                        })}
                    <td></td>
                    <td></td>


                </tr>
                <tr>
                    <td>2</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>

                </tr>
            </tbody>
        </Table>


    );
}

export default TableData;
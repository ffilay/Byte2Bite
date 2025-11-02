import 'bootstrap/dist/css/bootstrap.min.css';
import { BsTrash } from "react-icons/bs";
import { Items, menuService } from '../../services/menuService'

type Props = {
  menuItem: Items[];
};

export default function MenuTable({ menuItem }: Props) {

    return (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <colgroup>  
              <col style={{ width: '25%' }} /> 
              <col style={{ width: '25%' }} /> 
              <col style={{ width: '25%' }} /> 
              <col style={{ width: '25%' }} /> 
              <col style={{ width: 80 }} /> 
              <col style={{ width: 60 }} />
            </colgroup>
            <thead className="table-dark">
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Price</th>
                <th scope="col">Category</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
          {menuItem.map((item) => (
            <tr key={item.id}>
              <td>{item.name} </td>
              <td>{item.price} </td>
              <td>{item.category}</td>
              <td>{item.description}</td>
            </tr>
          ))}
        </tbody>
            </table>
        </div>
      );
};
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "react-bootstrap";
import { Items } from "../../services/menuService";

type Props = {
  show: boolean;
  onClose: () => void;
  menuItem?: Items;
};

export default function MenuItemModal({ show, onClose, menuItem }: Props) {
  const title = menuItem?.name
    ? `Edit ${menuItem.name}`
    : "Edit Menu Item";

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body />
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Back
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

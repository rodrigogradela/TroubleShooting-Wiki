import Modal from 'react-modal';

Modal.setAppElement('#root');

function ImageZoom({ image, onClose }) {
  return (
    <Modal
      isOpen={!!image}
      onRequestClose={onClose}
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          padding: 0,
          backgroundColor: '#FFFFFF', // bridgestone-white
          border: '1px solid #1A1A1A', // bridgestone-black
          borderRadius: '0.5rem',
        }
      }}
    >
      <img
        src={`data:${image.type};base64,${image.data}`}
        alt="Zoomed image"
        className="max-w-full max-h-full"
      />
      <button
        onClick={onClose}
        className="absolute top-2 right-2 bg-bridgestone-red text-bridgestone-white p-2 rounded"
      >
        Close
      </button>
    </Modal>
  );
}

export default ImageZoom;
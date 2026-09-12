export default function Modal({
  title,
  onClose,
  children
}) {
  return (
    <div
      className="modal-bg"
      onMouseDown={e =>
        e.target === e.currentTarget &&
        onClose()
      }
    >
      <div className="modal card">

        <div className="modal-head">
          <h2>{title}</h2>

          <button onClick={onClose}>
            ×
          </button>
        </div>

        {children}

      </div>
    </div>
  )
}

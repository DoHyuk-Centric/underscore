interface LoginBackgroundProps {
  visible: boolean
}

function LoginBackground({ visible }: LoginBackgroundProps) {
  return (
    <div
      className={`stock-hanzi-cloud ${visible ? 'stock-hanzi-cloud-ready' : 'stock-hanzi-cloud-pending'}`}
      aria-hidden="true"
    >
      <span className="stock-hanzi">株</span>
      <span className="stock-hanzi">益</span>
    </div>
  )
}

export default LoginBackground

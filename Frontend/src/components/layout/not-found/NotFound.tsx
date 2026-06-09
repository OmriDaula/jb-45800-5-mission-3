import { NavLink } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className='NotFound'>
      <h1>404</h1>
      <p>The page you are looking for does not exist.</p>
      <NavLink to="/home" className="btn">Back to Home</NavLink>
    </div>
  )
}

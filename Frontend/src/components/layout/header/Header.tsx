import { NavLink } from 'react-router-dom'
import './Header.css'

export default function Header() {
  return (
    <div className="Header">
      <NavLink to="/home" className="HeaderLogo">
        <span className="logo-mark">DM</span>
        <span className="logo-text">Dev Meetings</span>
      </NavLink>

      <nav className="HeaderNav">
        <NavLink to="/home">Home</NavLink>
        <NavLink to="/meetings">Meetings</NavLink>
        <NavLink to="/meetings/new">New Meeting</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
    </div>
  )
}

import './Footer.css'

export default function Footer() {
  return (
    <div className='Footer'>
      <p>Dev Teams Meetings &copy; {new Date().getFullYear()}</p>
      <p>Built by <strong>Omri Abu Daula</strong></p>
    </div>
  )
}

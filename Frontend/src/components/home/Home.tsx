import { NavLink } from 'react-router-dom'
import hero from '../../assets/meetings-hero.svg'
import './Home.css'

export default function Home() {
  return (
    <div className='Home'>
      <div className='Home-content'>
        <h1>Dev Teams Meetings</h1>
        <p>
          Welcome to the meetings hub for our development teams. This system helps
          tech teams &mdash; like the UI, Mobile, React, Backend, DevOps and QA teams &mdash;
          plan, browse and manage their meetings in one place. Pick a team to see its
          schedule, instantly tell apart upcoming meetings from past ones by their color,
          check how long each meeting lasts, and add, edit or remove meetings whenever
          plans change.
        </p>
        <div className='Home-actions'>
          <NavLink to="/meetings" className='btn btn-primary'>Browse Meetings</NavLink>
          <NavLink to="/meetings/new" className='btn btn-ghost'>Schedule a Meeting</NavLink>
        </div>
      </div>
      <div className='Home-image'>
        <img src={hero} alt="Development team meeting" />
      </div>
    </div>
  )
}

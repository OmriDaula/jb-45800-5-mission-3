import './About.css'

export default function About() {
  return (
    <div className='About'>
      <h1>About This System</h1>

      <section className='About-card'>
        <h2>The System</h2>
        <p>
          Dev Teams Meetings is a full-stack web application for managing the meetings of
          development teams at a tech company. Each meeting belongs to a development team
          and holds a start time, an end time, a description and a meeting room.
        </p>
        <p>
          The Meetings page lets you choose a development team and view only that team's
          meetings. Every meeting shows its duration in a friendly format, and is color
          coded &mdash; <span className='tag tag-future'>orange</span> for meetings that
          start in the future and <span className='tag tag-past'>green</span> for meetings
          that already started. You can add new meetings, edit existing ones and delete
          meetings you no longer need.
        </p>
        <p>
          The application is built as three layers: a <strong>MySQL</strong> database, a
          <strong> Node.js / Express</strong> REST API written in TypeScript with
          Sequelize, and a <strong>React</strong> (TypeScript) front-end.
        </p>
      </section>

      <section className='About-card'>
        <h2>The Developer</h2>
        <p><strong>Name:</strong> Omri Abu Daula</p>
        <p>
          A full-stack web development student at John Bryce, passionate about building
          clean, well-architected web apps with TypeScript and React.
        </p>
        <p><strong>Course:</strong> Full Stack Web Developer &mdash; John Bryce</p>
        <p><strong>Project:</strong> Mission 3 &mdash; MySQL / TypeScript / Node.js / React</p>
      </section>
    </div>
  )
}

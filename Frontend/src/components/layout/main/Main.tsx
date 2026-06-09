import { Navigate, Route, Routes } from 'react-router-dom'
import Home from '../../home/Home'
import About from '../../about/About'
import Meetings from '../../meetings/meetings/Meetings'
import NewMeeting from '../../meetings/new-meeting/NewMeeting'
import UpdateMeeting from '../../meetings/update-meeting/UpdateMeeting'
import NotFound from '../not-found/NotFound'

export default function Main() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/meetings" element={<Meetings />} />
      <Route path="/meetings/new" element={<NewMeeting />} />
      <Route path="/meetings/:code/edit" element={<UpdateMeeting />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

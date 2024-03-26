import './App.css';
import AssignRoles from './AssignRoles';
import Home from './Home';
import AddProd from './AddProd';
import PerformAction from './PerformAction';
import Track from './Track';
import Show from './Show';
import Client from './ClientWindow'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"


function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/roles" exact element={<AssignRoles />} />
          <Route path="/addprod" exact element={<AddProd />} />
          <Route path="/performaction" exact element={<PerformAction />} />
          <Route path="/track" exact element={<Track />} />
          <Route path="/show" exact element={<Show />} />
          <Route path="/client" exact element={<Client />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
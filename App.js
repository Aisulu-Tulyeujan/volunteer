import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/login";
import Register from "/components/register";
import "./Style.css";

function App(){
  return (
   <Router>
     <div className="App">
       <nav>
         <ul>
           <li>
             <Link to="/">Login</Link>
           </li>
           <li>
             <Link to="/register">Register</Link>
           </li>
         </ul>
       </nav>

       <Routes>
         <Route path="/" element={<Login />} />
         <Route path="/register" element="{<REgister />} />
       </Routes>
     </div>
   </Router>
 );
}
  
    

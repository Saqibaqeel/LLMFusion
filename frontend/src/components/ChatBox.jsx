import React from 'react'
import FeaturePanel from './FeaturePanel'
import ChatInterface from './ChatInterface'
import useAuth from "../store/UseAuth";

function Chatbox() {
    
  return (
    <div className="container-fluid vh-100">
      <div className="row h-100">
        {/* Left Feature Panel */}
        <div className="col-md-5 h-100 p-3 bg-light border-end">
          <FeaturePanel />
        </div>

        {/* Right Chat Interface */}
        <div className="col-md-7 h-100 p-0">
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}

export default Chatbox
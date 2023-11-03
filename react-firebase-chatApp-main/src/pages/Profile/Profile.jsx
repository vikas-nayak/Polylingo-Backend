import React from 'react';

function Profile() {
  return (
    <div style={{position: 'fixed', top: '50%', left: '50%',borderRadius: '5px', transform: 'translate(-50%, -50%)' , border: '1px solid blue', padding: '10px', width: '300px', backgroundColor: 'white', margin: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80" alt="Profile" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover' }} />
      </div>
      <h2 style={{ textAlign: 'center', color: 'black' }}>User Name</h2>
      <p style={{ textAlign: 'center', color: 'black' }}>Select Language</p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button style={{ backgroundColor: 'red', color: 'white', marginRight: '10px', padding: '5px' }}>Hindi</button>
        <button style={{ backgroundColor: 'red', color: 'white', marginRight: '10px' , padding: '5px'}}>Marathi</button>
        <button style={{ backgroundColor: 'red', color: 'white', marginRight: '10px' , padding: '5px'}}>English</button>
      </div>
      <button style={{ backgroundColor: 'red', color: 'white', width: '100%', marginTop: '10px' }}>Logout</button>
    </div>
  );
}

export default Profile;

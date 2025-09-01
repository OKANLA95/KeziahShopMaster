// src/pages/AssignRole.js

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function AssignRole() {
  const [uid, setUid] = useState('');
  const [role, setRole] = useState('Sales');
  const [message, setMessage] = useState('');

  const assignRole = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role });
      setMessage(`✅ Role "${role}" assigned to user ${uid}`);
    } catch (error) {
      console.error('Error assigning role:', error);
      setMessage(`❌ Failed to assign role: ${error.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <h2>Assign Role to User</h2>
      <form onSubmit={assignRole}>
        <input
          type="text"
          placeholder="User UID"
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          required
        /><br />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="Sales">Sales</option>
          <option value="Manager">Manager</option>
          <option value="Finance">Finance</option>
        </select><br />
        <button type="submit">Assign Role</button>
      </form>
      {message && <p style={{ marginTop: 10 }}>{message}</p>}
    </div>
  );
}

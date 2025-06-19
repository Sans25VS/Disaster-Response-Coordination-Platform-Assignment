import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const API_BASE = 'http://localhost:4000'; // Changed to Node.js backend

function getAppStyles(darkMode) {
  return `
    body { background: ${darkMode ? '#181a1b' : '#f8f9fa'}; }
    .main-container { max-width: 1200px; margin: 0 auto; padding: 32px; background: ${darkMode ? '#23272f' : '#fff'}; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); color: ${darkMode ? '#f1f1f1' : '#222'}; }
    h1, h2, label, .section-title { color: ${darkMode ? '#f1f1f1' : '#222'}; transition: color 0.2s; }
    form input, form textarea { border: 1px solid #ccc; border-radius: 6px; padding: 8px; font-size: 1rem; transition: border 0.2s, background 0.2s, color 0.2s; background: ${darkMode ? '#23272f' : '#fff'}; color: ${darkMode ? '#f1f1f1' : '#222'}; }
    form input:focus, form textarea:focus { border: 1.5px solid #007bff; outline: none; }
    button, .toggle-switch { background: #007bff; color: #fff; border: none; border-radius: 20px; padding: 8px 18px; font-size: 1rem; cursor: pointer; transition: background 0.2s, color 0.2s; }
    button:hover, .toggle-switch:hover { background: #0056b3; }
    .priority-anim { animation: pulse 1.2s infinite alternate; }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(255,0,0,0.2); }
      100% { box-shadow: 0 0 12px 4px rgba(255,0,0,0.18); }
    }
    .toggle-switch { position: absolute; top: 24px; right: 32px; width: 48px; height: 28px; background: ${darkMode ? '#333' : '#eee'}; border-radius: 20px; display: flex; align-items: center; justify-content: ${darkMode ? 'flex-end' : 'flex-start'}; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .toggle-knob { width: 20px; height: 20px; border-radius: 50%; background: ${darkMode ? '#181a1b' : '#ffeb3b'}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: ${darkMode ? '#fff' : '#f39c12'}; box-shadow: 0 0 8px ${darkMode ? '#007bff' : '#ffeb3b'}; transition: background 0.3s, color 0.3s, box-shadow 0.3s; }
    .form-card { border: 1px solid #e0e0e0; border-radius: 12px; padding: 20px; margin-bottom: 24px; background: ${darkMode ? '#111' : '#f6faff'}; transition: background 0.3s; min-width: 320px; }
    ul, li { color: ${darkMode ? '#e0e0e0' : '#222'}; transition: color 0.2s; }
  `;
}

function App() {
  // State
  const [disasters, setDisasters] = useState([]);
  const [reports, setReports] = useState([]);
  const [resources, setResources] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [disasterForm, setDisasterForm] = useState({ title: '', location: '', description: '', tags: '' });
  const [reportForm, setReportForm] = useState({ content: '', imageUrl: '' });
  const [supabaseDisasters, setSupabaseDisasters] = useState([]);
  const [editingDisaster, setEditingDisaster] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', location_name: '', description: '', tags: '' });
  const [editingApiDisaster, setEditingApiDisaster] = useState(null);
  const [editApiForm, setEditApiForm] = useState({ title: '', location: '', description: '', tags: '' });
  const [geminiDescription, setGeminiDescription] = useState('');
  const [geminiLocationResult, setGeminiLocationResult] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [mockSocialMedia, setMockSocialMedia] = useState([]);
  const [loadingMockSocial, setLoadingMockSocial] = useState(false);
  const [twitterResults, setTwitterResults] = useState([]);
  const [twitterQuery, setTwitterQuery] = useState('');
  const [twitterLoading, setTwitterLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Fetch disasters
  const fetchDisasters = async () => {
    const res = await fetch(`${API_BASE}/disasters`);
    setDisasters(await res.json());
  };

  // Fetch reports
  const fetchReports = async () => {
    const res = await fetch(`${API_BASE}/reports`);
    setReports(await res.json());
  };

  // Fetch resources
  const fetchResources = async () => {
    const res = await fetch(`${API_BASE}/resources`);
    setResources(await res.json());
  };

  // Fetch verifications
  const fetchVerifications = async () => {
    const res = await fetch(`${API_BASE}/verifications`);
    setVerifications(await res.json());
  };

  // Example: Fetch disasters directly from Supabase
  const fetchSupabaseDisasters = async () => {
    const { data, error } = await supabase.from('disasters').select('*');
    if (!error) setSupabaseDisasters(data);
  };

  // Fetch mock social media
  const fetchMockSocialMedia = async () => {
    setLoadingMockSocial(true);
    const res = await fetch('http://localhost:4000/mock-social-media');
    const data = await res.json();
    setMockSocialMedia(data);
    setLoadingMockSocial(false);
  };

  // Helper to flag priority alerts
  function isPriorityText(text) {
    const t = text.toLowerCase();
    return t.includes('urgent') || t.includes('sos');
  }

  // Fetch Twitter search results
  const fetchTwitterResults = async (query) => {
    setTwitterLoading(true);
    setTwitterResults([]);
    try {
      const res = await fetch(`http://localhost:4000/twitter/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      // Twitter API returns {data: [{text, ...}, ...]}
      const posts = (data.data || []).map(post => ({ ...post, priority: isPriorityText(post.text) }));
      setTwitterResults(posts);
    } catch (err) {
      setTwitterResults([]);
    }
    setTwitterLoading(false);
  };

  // WebSocket for real-time updates (mocked for now)
  useEffect(() => {
    fetchDisasters();
    fetchReports();
    fetchResources();
    fetchVerifications();
    fetchSupabaseDisasters();
    fetchMockSocialMedia();
    // TODO: Add real WebSocket logic here
  }, []);

  // Handlers
  const handleDisasterChange = e => {
    setDisasterForm({ ...disasterForm, [e.target.name]: e.target.value });
  };
  const handleReportChange = e => {
    setReportForm({ ...reportForm, [e.target.name]: e.target.value });
  };

  const handleDisasterSubmit = async e => {
    e.preventDefault();
    await fetch(`${API_BASE}/disasters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: disasterForm.title,
        location: disasterForm.location,
        description: disasterForm.description,
        tags: disasterForm.tags.split(',').map(t => t.trim()),
      }),
    });
    setDisasterForm({ title: '', location: '', description: '', tags: '' });
    fetchDisasters();
  };

  const handleReportSubmit = async e => {
    e.preventDefault();
    await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: reportForm.content,
        imageUrl: reportForm.imageUrl,
      }),
    });
    setReportForm({ content: '', imageUrl: '' });
    fetchReports();
  };

  // Delete disaster from Supabase
  const handleDeleteSupabaseDisaster = async (id) => {
    await supabase.from('disasters').delete().eq('id', id);
    fetchSupabaseDisasters();
  };

  // Start editing
  const handleEditSupabaseDisaster = (disaster) => {
    setEditingDisaster(disaster.id);
    setEditForm({
      title: disaster.title || '',
      location_name: disaster.location_name || '',
      description: disaster.description || '',
      tags: disaster.tags ? disaster.tags.join(', ') : ''
    });
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Submit update
  const handleUpdateSupabaseDisaster = async (e) => {
    e.preventDefault();
    await supabase.from('disasters').update({
      title: editForm.title,
      location_name: editForm.location_name,
      description: editForm.description,
      tags: editForm.tags.split(',').map(t => t.trim())
    }).eq('id', editingDisaster);
    setEditingDisaster(null);
    fetchSupabaseDisasters();
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingDisaster(null);
  };

  // Start editing API disaster
  const handleEditApiDisaster = (disaster) => {
    setEditingApiDisaster(disaster.id);
    setEditApiForm({
      title: disaster.title || '',
      location: disaster.location || '',
      description: disaster.description || '',
      tags: disaster.tags ? disaster.tags.join(', ') : ''
    });
  };

  // Handle API edit form change
  const handleEditApiFormChange = (e) => {
    setEditApiForm({ ...editApiForm, [e.target.name]: e.target.value });
  };

  // Submit API update
  const handleUpdateApiDisaster = async (e) => {
    e.preventDefault();
    await fetch(`${API_BASE}/disasters/${editingApiDisaster}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editApiForm.title,
        location: editApiForm.location,
        description: editApiForm.description,
        tags: editApiForm.tags.split(',').map(t => t.trim())
      })
    });
    setEditingApiDisaster(null);
    fetchDisasters();
  };

  // Cancel API editing
  const handleCancelApiEdit = () => {
    setEditingApiDisaster(null);
  };

  // Delete API disaster
  const handleDeleteApiDisaster = async (id) => {
    await fetch(`${API_BASE}/disasters/${id}`, { method: 'DELETE' });
    fetchDisasters();
  };

  const handleGeminiExtractLocation = async (e) => {
    e.preventDefault();
    setGeminiLoading(true);
    setGeminiLocationResult(null);
    try {
      const res = await fetch('http://localhost:4000/gemini/extract-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: geminiDescription })
      });
      const data = await res.json();
      setGeminiLocationResult(data);
    } catch (err) {
      setGeminiLocationResult({ error: 'Request failed' });
    }
    setGeminiLoading(false);
  };

  return (
    <>
      <style>{getAppStyles(darkMode)}</style>
      <button className="toggle-switch" onClick={() => setDarkMode(dm => !dm)} aria-label="Toggle dark mode">
        <span className="toggle-knob">
          {darkMode ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="#fff" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" fill="#f9d71c" />
              <g stroke="#f9d71c" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
                <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
                <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
              </g>
            </svg>
          )}
        </span>
      </button>
      <div className="main-container">
        <h1 style={{ textAlign: 'center', marginBottom: 32 }} className="section-title">Disaster Response Platform</h1>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {/* Disaster Form */}
          <form onSubmit={handleDisasterSubmit} className="form-card">
            <h2>Create/Update Disaster</h2>
            <input name="title" placeholder="Title" value={disasterForm.title} onChange={handleDisasterChange} required style={{ width: '100%', marginBottom: 8 }} />
            <input name="location" placeholder="Location Name or Description" value={disasterForm.location} onChange={handleDisasterChange} required style={{ width: '100%', marginBottom: 8 }} />
            <textarea name="description" placeholder="Description" value={disasterForm.description} onChange={handleDisasterChange} required style={{ width: '100%', marginBottom: 8 }} />
            <input name="tags" placeholder="Tags (comma separated)" value={disasterForm.tags} onChange={handleDisasterChange} style={{ width: '100%', marginBottom: 8 }} />
            <button type="submit">Submit Disaster</button>
          </form>
          {/* Report Form */}
          <form onSubmit={handleReportSubmit} className="form-card">
            <h2>Submit Report</h2>
            <textarea name="content" placeholder="Report Content" value={reportForm.content} onChange={handleReportChange} required style={{ width: '100%', marginBottom: 8 }} />
            <input name="imageUrl" placeholder="Image URL" value={reportForm.imageUrl} onChange={handleReportChange} style={{ width: '100%', marginBottom: 8 }} />
            <button type="submit">Submit Report</button>
          </form>
        </div>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 24 }}>
          {/* Disasters Display */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2>Disasters</h2>
            <ul style={{ paddingLeft: 0 }}>
              {disasters.map(d => (
                <li key={d.id} style={{ listStyle: 'none', marginBottom: 16, background: '#f9f9f9', borderRadius: 8, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  {editingApiDisaster === d.id ? (
                    <form onSubmit={handleUpdateApiDisaster} style={{ display: 'inline-block', marginBottom: 8 }}>
                      <input name="title" value={editApiForm.title} onChange={handleEditApiFormChange} placeholder="Title" required style={{ marginRight: 4 }} />
                      <input name="location" value={editApiForm.location} onChange={handleEditApiFormChange} placeholder="Location" style={{ marginRight: 4 }} />
                      <input name="description" value={editApiForm.description} onChange={handleEditApiFormChange} placeholder="Description" style={{ marginRight: 4 }} />
                      <input name="tags" value={editApiForm.tags} onChange={handleEditApiFormChange} placeholder="Tags (comma separated)" style={{ marginRight: 4 }} />
                      <button type="submit">Save</button>
                      <button type="button" onClick={handleCancelApiEdit} style={{ marginLeft: 4, background: '#aaa' }}>Cancel</button>
                    </form>
                  ) : (
                    <>
                      <b>{d.title}</b> ({d.location})<br />
                      {d.description}<br />
                      Tags: {d.tags && d.tags.join(', ')}
                      <button style={{ marginLeft: 8 }} onClick={() => handleEditApiDisaster(d)}>Edit</button>
                      <button style={{ marginLeft: 8, background: '#e74c3c' }} onClick={() => handleDeleteApiDisaster(d.id)}>Delete</button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {/* Reports Display */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2>Social Media Reports</h2>
            <ul style={{ paddingLeft: 0 }}>
              {reports.map(r => (
                <li key={r.id} style={{ listStyle: 'none', marginBottom: 16, background: '#f9f9f9', borderRadius: 8, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <b>{r.content}</b><br />
                  {r.imageUrl && <img src={r.imageUrl} alt="report" style={{ maxWidth: 100, marginTop: 8, borderRadius: 6 }} />}
                </li>
              ))}
            </ul>
          </div>
          {/* Resources Display */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2>Resources</h2>
            <ul style={{ paddingLeft: 0 }}>
              {resources.map(res => (
                <li key={res.id} style={{ listStyle: 'none', marginBottom: 16, background: '#f9f9f9', borderRadius: 8, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <b>{res.name}</b> ({res.type})<br />
                  {res.description}
                </li>
              ))}
            </ul>
          </div>
          {/* Verification Statuses */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <h2>Verification Statuses</h2>
            <ul style={{ paddingLeft: 0 }}>
              {verifications.map(v => (
                <li key={v.id} style={{ listStyle: 'none', marginBottom: 16, background: '#f9f9f9', borderRadius: 8, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                  <b>{v.status}</b> for {v.targetType} #{v.targetId}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Supabase Disasters Section */}
        <div style={{ marginTop: 40 }}>
          <h2>Disasters (Direct from Supabase)</h2>
          <ul style={{ paddingLeft: 0 }}>
            {supabaseDisasters.map(d => (
              <li key={d.id} style={{ listStyle: 'none', marginBottom: 16, background: '#f9f9f9', borderRadius: 8, padding: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
                {editingDisaster === d.id ? (
                  <form onSubmit={handleUpdateSupabaseDisaster} style={{ display: 'inline-block', marginBottom: 8 }}>
                    <input name="title" value={editForm.title} onChange={handleEditFormChange} placeholder="Title" required style={{ marginRight: 4 }} />
                    <input name="location_name" value={editForm.location_name} onChange={handleEditFormChange} placeholder="Location Name" style={{ marginRight: 4 }} />
                    <input name="description" value={editForm.description} onChange={handleEditFormChange} placeholder="Description" style={{ marginRight: 4 }} />
                    <input name="tags" value={editForm.tags} onChange={handleEditFormChange} placeholder="Tags (comma separated)" style={{ marginRight: 4 }} />
                    <button type="submit">Save</button>
                    <button type="button" onClick={handleCancelEdit} style={{ marginLeft: 4, background: '#aaa' }}>Cancel</button>
                  </form>
                ) : (
                  <>
                    <b>{d.title}</b> ({d.location_name})<br />
                    {d.description}<br />
                    Tags: {d.tags && d.tags.join(', ')}
                    <button style={{ marginLeft: 8 }} onClick={() => handleEditSupabaseDisaster(d)}>Edit</button>
                    <button style={{ marginLeft: 8, background: '#e74c3c' }} onClick={() => handleDeleteSupabaseDisaster(d.id)}>Delete</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
        {/* Gemini Location Extraction Section */}
        <div style={{ marginTop: 40 }}>
          <h2>Gemini Location Extraction (Sample)</h2>
          <form onSubmit={handleGeminiExtractLocation} style={{ marginBottom: 8 }}>
            <input
              type="text"
              value={geminiDescription}
              onChange={e => setGeminiDescription(e.target.value)}
              placeholder="Enter description (e.g. Flooding in Manhattan, NYC)"
              style={{ width: 400, marginRight: 8 }}
              required
            />
            <button type="submit" disabled={geminiLoading}>Extract Location</button>
          </form>
          {geminiLoading && <div>Loading...</div>}
          {geminiLocationResult && (
            <pre style={{ background: '#f4f4f4', padding: 8, borderRadius: 4 }}>
              {JSON.stringify(geminiLocationResult, null, 2)}
            </pre>
          )}
        </div>
        {/* Mock Social Media Section */}
        <div style={{ marginTop: 40 }}>
          <h2>Mock Social Media Reports (Priority Highlighted)</h2>
          {loadingMockSocial && <div>Loading...</div>}
          <ul style={{ paddingLeft: 0 }}>
            {mockSocialMedia.map((post, idx) => (
              <li key={idx} className={post.priority ? 'priority-anim' : ''} style={post.priority ? { border: '2px solid red', background: '#ffeaea', padding: 8, borderRadius: 4, marginBottom: 8, listStyle: 'none', transition: 'box-shadow 0.3s' } : { marginBottom: 8, listStyle: 'none' }}>
                <b>{post.user}:</b> {post.post}
                {post.priority && <span style={{ color: 'red', fontWeight: 'bold', marginLeft: 8 }}>[PRIORITY]</span>}
              </li>
            ))}
          </ul>
        </div>
        {/* Twitter Search Section */}
        <div style={{ marginTop: 40 }}>
          <h2>Twitter Search (Priority Highlighted)</h2>
          <form onSubmit={e => { e.preventDefault(); fetchTwitterResults(twitterQuery); }} style={{ marginBottom: 8 }}>
            <input
              type="text"
              value={twitterQuery}
              onChange={e => setTwitterQuery(e.target.value)}
              placeholder="Search Twitter (e.g. #floodrelief)"
              style={{ width: 300, marginRight: 8 }}
              required
            />
            <button type="submit" disabled={twitterLoading}>Search</button>
          </form>
          {twitterLoading && <div>Loading...</div>}
          <ul style={{ paddingLeft: 0 }}>
            {twitterResults.map((post, idx) => (
              <li key={idx} className={post.priority ? 'priority-anim' : ''} style={post.priority ? { border: '2px solid red', background: '#ffeaea', padding: 8, borderRadius: 4, marginBottom: 8, listStyle: 'none', transition: 'box-shadow 0.3s' } : { marginBottom: 8, listStyle: 'none' }}>
                {post.text}
                {post.priority && <span style={{ color: 'red', fontWeight: 'bold', marginLeft: 8 }}>[PRIORITY]</span>}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 40, color: '#888', textAlign: 'center' }}>
          <b>Note:</b> Real-time updates for social media and resources are mocked. Add WebSocket logic for production.
        </div>
      </div>
    </>
  );
}

export default App; 
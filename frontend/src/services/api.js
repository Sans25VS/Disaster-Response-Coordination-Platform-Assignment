import { supabase } from './supabaseClient';

const API_BASE = 'http://localhost:4000';

// Helper to flag priority alerts
function isPriorityText(text) {
  const t = text.toLowerCase();
  return t.includes('urgent') || t.includes('sos');
}

// Mock API
export const fetchDisasters = async () => {
  const res = await fetch(`${API_BASE}/disasters`);
  return res.json();
};

export const fetchReports = async () => {
  const res = await fetch(`${API_BASE}/reports`);
  return res.json();
};

export const fetchResources = async () => {
  const res = await fetch(`${API_BASE}/resources`);
  return res.json();
};

export const fetchVerifications = async () => {
  const res = await fetch(`${API_BASE}/verifications`);
  return res.json();
};

// Supabase Disasters
export const fetchSupabaseDisasters = async () => {
  const { data, error } = await supabase.from('disasters').select('*');
  if (error) {
    console.error('Error fetching disasters:', error);
    return [];
  }
  return data;
};

export const deleteSupabaseDisaster = async (id) => {
  const { error } = await supabase.from('disasters').delete().eq('id', id);
  if (error) console.error('Error deleting disaster:', error);
  return !error;
};

export const updateSupabaseDisaster = async (id, updates, existingTrail = []) => {
    const newAuditEntry = { action: 'update', user_id: 'frontend_user', timestamp: new Date().toISOString() };
    const { error } = await supabase.from('disasters').update({
        ...updates,
        audit_trail: [...existingTrail, newAuditEntry]
    }).eq('id', id);
    if (error) console.error('Error updating disaster:', error);
    return !error;
};

export const createSupabaseDisaster = async (disaster) => {
    const { error } = await supabase.from('disasters').insert([disaster]);
    if (error) console.error('Error creating disaster:', error);
    return !error;
}


// Supabase Reports
export const fetchSupabaseReports = async () => {
    const { data, error } = await supabase.from('reports').select('*');
    if (error) {
        console.error('Error fetching reports:', error);
        return [];
    }
    return data;
};

export const createSupabaseReport = async (report) => {
    const { error } = await supabase.from('reports').insert([report]);
    if (error) console.error('Error creating report:', error);
    return !error;
}

export const deleteSupabaseReport = async (id) => {
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) console.error('Error deleting report:', error);
    return !error;
}


// Supabase Resources
export const fetchSupabaseResources = async () => {
    const { data, error } = await supabase.from('resources').select('*');
    if (error) {
        console.error('Error fetching resources:', error);
        return [];
    }
    return data;
};

export const createSupabaseResource = async (resource) => {
    const { error } = await supabase.from('resources').insert([resource]);
    if (error) console.error('Error creating resource:', error);
    return !error;
}

export const updateSupabaseResource = async (id, updates) => {
    const { error } = await supabase.from('resources').update(updates).eq('id', id);
    if (error) console.error('Error updating resource:', error);
    return !error;
}

export const deleteSupabaseResource = async (id) => {
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) console.error('Error deleting resource:', error);
    return !error;
}


// Social Media
export const fetchMockSocialMedia = async () => {
  const res = await fetch('http://localhost:4000/mock-social-media');
  const data = await res.json();
  return data;
};

export const fetchTwitterResults = async (query) => {
    if (!query) return [];
    try {
      const res = await fetch(`http://localhost:4000/twitter/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      // Twitter API returns {data: [{text, ...}, ...]}
      return (data.data || []).map(post => ({ ...post, priority: isPriorityText(post.text) }));
    } catch (err) {
      console.error('Error fetching twitter results:', err);
      return [];
    }
};


// External Services
export const fetchHospitals = async (lat, lng) => {
  const res = await fetch(`http://localhost:4000/resources/hospitals?lat=${lat}&lng=${lng}`);
  const data = await res.json();
  return data.results || [];
};

export const geocodeLocation = async (locationName) => {
    try {
        const res = await fetch(`http://localhost:4000/geocode?address=${encodeURIComponent(locationName)}`);
        if (!res.ok) {
            throw new Error(`Geocoding failed with status: ${res.status}`);
        }
        return await res.json();
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

export const geminiExtractLocation = async (description) => {
    try {
        const res = await fetch(`${API_BASE}/gemini/extract-location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: description }),
        });
        if (!res.ok) {
            throw new Error(`Gemini location extraction failed with status: ${res.status}`);
        }
        return await res.json();
    } catch (error) {
        console.error('Gemini location extraction error:', error);
        return null;
    }
}; 
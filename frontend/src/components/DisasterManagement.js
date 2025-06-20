import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../services/api';
import './../styles/Management.css';
import './../styles/Table.css';

const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = useState(config);

    const sortedItems = useMemo(() => {
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (
            sortConfig &&
            sortConfig.key === key &&
            sortConfig.direction === 'ascending'
        ) {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};


const DisasterManagement = () => {
    const [supabaseDisasters, setSupabaseDisasters] = useState([]);
    const [editingDisaster, setEditingDisaster] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', location_name: '', description: '', tags: '' });
    const [disasterForm, setDisasterForm] = useState({ title: '', location_name: '', description: '', tags: '' });
    const { items: sortedDisasters, requestSort, sortConfig } = useSortableData(supabaseDisasters);

    useEffect(() => {
        fetchDisasters();
    }, []);

    const fetchDisasters = async () => {
        const disasters = await api.fetchSupabaseDisasters();
        setSupabaseDisasters(disasters);
    };

    const handleEditClick = (disaster) => {
        setEditingDisaster(disaster.id);
        setEditForm({
            title: disaster.title || '',
            location_name: disaster.location_name || '',
            description: disaster.description || '',
            tags: disaster.tags ? disaster.tags.join(', ') : ''
        });
    };

    const handleCancelEdit = () => {
        setEditingDisaster(null);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        const existingDisaster = supabaseDisasters.find(d => d.id === editingDisaster);
        await api.updateSupabaseDisaster(editingDisaster, {
            title: editForm.title,
            location_name: editForm.location_name,
            description: editForm.description,
            tags: editForm.tags.split(',').map(t => t.trim()),
        }, existingDisaster.audit_trail);
        setEditingDisaster(null);
        fetchDisasters();
    };

    const handleDelete = async (id) => {
        await api.deleteSupabaseDisaster(id);
        fetchDisasters();
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        await api.createSupabaseDisaster({
            ...disasterForm,
            tags: disasterForm.tags.split(',').map(t => t.trim()),
        });
        setDisasterForm({ title: '', location_name: '', description: '', tags: '' });
        fetchDisasters();
    };

    const handleCreateFormChange = (e) => {
        setDisasterForm({ ...disasterForm, [e.target.name]: e.target.value });
    };

    const handleEditFormChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    }
    
    const getClassNameFor = (name) => {
        if (!sortConfig) {
          return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    return (
        <div className="management-section">
            <h2>Manage Disasters</h2>

            <div className="form-card">
                <h3>{editingDisaster ? 'Edit Disaster' : 'Create New Disaster'}</h3>
                <form onSubmit={editingDisaster ? handleUpdateSubmit : handleCreateSubmit}>
                    <input name="title" value={editingDisaster ? editForm.title : disasterForm.title} onChange={editingDisaster? handleEditFormChange : handleCreateFormChange} placeholder="Title" required />
                    <input name="location_name" value={editingDisaster ? editForm.location_name : disasterForm.location_name} onChange={editingDisaster ? handleEditFormChange : handleCreateFormChange} placeholder="Location Name" required />
                    <textarea name="description" value={editingDisaster ? editForm.description : disasterForm.description} onChange={editingDisaster ? handleEditFormChange : handleCreateFormChange} placeholder="Description" />
                    <input name="tags" value={editingDisaster ? editForm.tags : disasterForm.tags} onChange={editingDisaster ? handleEditFormChange : handleCreateFormChange} placeholder="Tags (comma-separated)" />
                    <div className="form-actions">
                        <button type="submit">{editingDisaster ? 'Update Disaster' : 'Create Disaster'}</button>
                        {editingDisaster && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="list-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>
                                <button type="button" onClick={() => requestSort('title')} className={getClassNameFor('title')}>
                                    Title
                                </button>
                            </th>
                            <th>
                                <button type="button" onClick={() => requestSort('location_name')} className={getClassNameFor('location_name')}>
                                    Location
                                </button>
                            </th>
                            <th>Description</th>
                            <th>Tags</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDisasters.map(disaster => (
                            <tr key={disaster.id}>
                                <td>{disaster.title}</td>
                                <td>{disaster.location_name}</td>
                                <td>{disaster.description}</td>
                                <td>{disaster.tags?.join(', ')}</td>
                                <td className="actions-cell">
                                    <button onClick={() => handleEditClick(disaster)}>Edit</button>
                                    <button onClick={() => handleDelete(disaster.id)} className="delete-button">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DisasterManagement; 
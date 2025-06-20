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

const ResourceManagement = () => {
    const [resources, setResources] = useState([]);
    const [editingResource, setEditingResource] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', type: '', location_name: '' });
    const [resourceForm, setResourceForm] = useState({ name: '', type: '', location_name: '', disaster_id: '' });
    const [disasters, setDisasters] = useState([]);
    const { items: sortedResources, requestSort, sortConfig } = useSortableData(resources);

    useEffect(() => {
        fetchResourcesAndDisasters();
    }, []);

    const fetchResourcesAndDisasters = async () => {
        const resourcesData = await api.fetchSupabaseResources();
        const disastersData = await api.fetchSupabaseDisasters();
        setResources(resourcesData);
        setDisasters(disastersData);
    };

    const handleEditClick = (resource) => {
        setEditingResource(resource.id);
        setEditForm({
            name: resource.name || '',
            type: resource.type || '',
            location_name: resource.location_name || '',
        });
    };

    const handleCancelEdit = () => {
        setEditingResource(null);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        await api.updateSupabaseResource(editingResource, {
            name: editForm.name,
            type: editForm.type,
            location_name: editForm.location_name,
        });
        setEditingResource(null);
        fetchResourcesAndDisasters();
    };

    const handleDelete = async (id) => {
        await api.deleteSupabaseResource(id);
        fetchResourcesAndDisasters();
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        await api.createSupabaseResource({
            ...resourceForm,
            disaster_id: resourceForm.disaster_id === '' ? null : Number(resourceForm.disaster_id),
        });
        setResourceForm({ name: '', type: '', location_name: '', disaster_id: '' });
        fetchResourcesAndDisasters();
    };

    const handleCreateFormChange = (e) => {
        setResourceForm({ ...resourceForm, [e.target.name]: e.target.value });
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
            <h2>Manage Resources</h2>

            <div className="form-card">
                <h3>{editingResource ? 'Edit Resource' : 'Create New Resource'}</h3>
                <form onSubmit={editingResource ? handleUpdateSubmit : handleCreateSubmit}>
                    <input name="name" value={editingResource ? editForm.name : resourceForm.name} onChange={editingResource ? handleEditFormChange : handleCreateFormChange} placeholder="Resource Name" required />
                    <input name="type" value={editingResource ? editForm.type : resourceForm.type} onChange={editingResource ? handleEditFormChange : handleCreateFormChange} placeholder="Resource Type (e.g., hospital)" required />
                    <input name="location_name" value={editingResource ? editForm.location_name : resourceForm.location_name} onChange={editingResource ? handleEditFormChange : handleCreateFormChange} placeholder="Location Name" required />
                    {!editingResource && (
                        <select name="disaster_id" value={resourceForm.disaster_id} onChange={handleCreateFormChange}>
                            <option value="">No associated disaster</option>
                            {disasters.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                        </select>
                    )}
                    <div className="form-actions">
                        <button type="submit">{editingResource ? 'Update Resource' : 'Create Resource'}</button>
                        {editingResource && <button type="button" onClick={handleCancelEdit}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="list-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th><button type="button" onClick={() => requestSort('name')} className={getClassNameFor('name')}>Name</button></th>
                            <th><button type="button" onClick={() => requestSort('type')} className={getClassNameFor('type')}>Type</button></th>
                            <th><button type="button" onClick={() => requestSort('location_name')} className={getClassNameFor('location_name')}>Location</button></th>
                            <th>Associated Disaster</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedResources.map(resource => (
                            <tr key={resource.id}>
                                <td>{resource.name}</td>
                                <td>{resource.type}</td>
                                <td>{resource.location_name}</td>
                                <td>{disasters.find(d => d.id === resource.disaster_id)?.title || 'N/A'}</td>
                                <td className="actions-cell">
                                    <button onClick={() => handleEditClick(resource)}>Edit</button>
                                    <button onClick={() => handleDelete(resource.id)} className="delete-button">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResourceManagement; 
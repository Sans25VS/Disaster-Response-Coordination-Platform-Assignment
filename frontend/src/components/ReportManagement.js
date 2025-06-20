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

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [reportForm, setReportForm] = useState({ content: '', disaster_id: '' });
    const [disasters, setDisasters] = useState([]);
    const { items: sortedReports, requestSort, sortConfig } = useSortableData(reports);

    useEffect(() => {
        fetchReportsAndDisasters();
    }, []);

    const fetchReportsAndDisasters = async () => {
        const reportsData = await api.fetchSupabaseReports();
        const disastersData = await api.fetchSupabaseDisasters();
        setReports(reportsData);
        setDisasters(disastersData);
    };

    const handleDelete = async (id) => {
        await api.deleteSupabaseReport(id);
        fetchReportsAndDisasters();
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!reportForm.disaster_id) {
            alert('Please select a disaster.');
            return;
        }
        await api.createSupabaseReport({
            ...reportForm,
            disaster_id: Number(reportForm.disaster_id),
        });
        setReportForm({ content: '', disaster_id: '' });
        fetchReportsAndDisasters();
    };

    const handleCreateFormChange = (e) => {
        setReportForm({ ...reportForm, [e.target.name]: e.target.value });
    };

    const getClassNameFor = (name) => {
        if (!sortConfig) {
          return;
        }
        return sortConfig.key === name ? sortConfig.direction : undefined;
    };

    return (
        <div className="management-section">
            <h2>Manage Reports</h2>

            <div className="form-card">
                <h3>Create New Report</h3>
                <form onSubmit={handleCreateSubmit}>
                    <textarea name="content" value={reportForm.content} onChange={handleCreateFormChange} placeholder="Report Content" required />
                    <select name="disaster_id" value={reportForm.disaster_id} onChange={handleCreateFormChange} required>
                        <option value="">Select a disaster...</option>
                        {disasters.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                    </select>
                    <div className="form-actions">
                        <button type="submit">Create Report</button>
                    </div>
                </form>
            </div>

            <div className="list-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th><button type="button" onClick={() => requestSort('created_at')} className={getClassNameFor('created_at')}>Date</button></th>
                            <th>Content</th>
                            <th><button type="button" onClick={() => requestSort('disaster_id')} className={getClassNameFor('disaster_id')}>Associated Disaster</button></th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedReports.map(report => (
                            <tr key={report.id}>
                                <td>{new Date(report.created_at).toLocaleString()}</td>
                                <td>{report.content}</td>
                                <td>{disasters.find(d => d.id === report.disaster_id)?.title || 'N/A'}</td>
                                <td className="actions-cell">
                                    <button onClick={() => handleDelete(report.id)} className="delete-button">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ReportManagement; 
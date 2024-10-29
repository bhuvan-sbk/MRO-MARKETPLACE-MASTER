// frontend/src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip
} from '@mui/material';
import {
  Edit,
  Delete,
  Block,
  Check,
  Warning
} from '@mui/icons-material';
import api from '../../services/api';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    fetchData();
  }, [tabValue]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (tabValue) {
        case 0: // Users
          const usersResponse = await api.get('/admin/users');
          setUsers(usersResponse.data);
          break;
        case 1: // Services
          const servicesResponse = await api.get('/admin/services');
          setServices(servicesResponse.data);
          break;
        case 2: // Reports
          const reportsResponse = await api.get('/admin/reports');
          setReports(reportsResponse.data);
          break;
      }
    } catch (err) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (item, action) => {
    setSelectedItem(item);
    setActionType(action);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    try {
      switch (actionType) {
        case 'suspend':
          await api.post(`/admin/users/${selectedItem._id}/suspend`);
          break;
        case 'activate':
          await api.post(`/admin/users/${selectedItem._id}/activate`);
          break;
        case 'delete':
          await api.delete(`/admin/${tabValue === 0 ? 'users' : 'services'}/${selectedItem._id}`);
          break;
      }
      fetchData();
      setDialogOpen(false);
    } catch (err) {
      setError('Action failed');
    }
  };

  const renderUsers = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Company Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>{user.companyName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip 
                  label={user.status}
                  color={user.status === 'active' ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <IconButton 
                  onClick={() => handleAction(user, user.status === 'active' ? 'suspend' : 'activate')}
                  color={user.status === 'active' ? 'error' : 'success'}
                >
                  {user.status === 'active' ? <Block /> : <Check />}
                </IconButton>
                <IconButton 
                  onClick={() => handleAction(user, 'delete')}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderServices = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Service Name</TableCell>
            <TableCell>Provider</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {services.map((service) => (
            <TableRow key={service._id}>
              <TableCell>{service.name}</TableCell>
              <TableCell>{service.provider.companyName}</TableCell>
              <TableCell>{service.category}</TableCell>
              <TableCell>
                <Chip 
                  label={service.status}
                  color={service.status === 'active' ? 'success' : 'warning'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton 
                  onClick={() => handleAction(service, service.status === 'active' ? 'suspend' : 'activate')}
                  color={service.status === 'active' ? 'error' : 'success'}
                >
                  {service.status === 'active' ? <Block /> : <Check />}
                </IconButton>
                <IconButton 
                  onClick={() => handleAction(service, 'delete')}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderReports = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Report Type</TableCell>
            <TableCell>Reported By</TableCell>
            <TableCell>Subject</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report._id}>
              <TableCell>{report.type}</TableCell>
              <TableCell>{report.reportedBy.companyName}</TableCell>
              <TableCell>{report.subject}</TableCell>
              <TableCell>
                <Chip 
                  label={report.status}
                  color={report.status === 'resolved' ? 'success' : 'warning'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleAction(report, 'resolve')}
                  disabled={report.status === 'resolved'}
                >
                  Resolve
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">Admin Dashboard</Typography>
      </Box>

      <Paper>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Users" />
          <Tab label="Services" />
          <Tab label="Reports" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Typography>Loading...</Typography>
          ) : (
            <>
              {tabValue === 0 && renderUsers()}
              {tabValue === 1 && renderServices()}
              {tabValue === 2 && renderReports()}
            </>
          )}
        </Box>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          Confirm {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {actionType} this {tabValue === 0 ? 'user' : 'service'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmAction} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
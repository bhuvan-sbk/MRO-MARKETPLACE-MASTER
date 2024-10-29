// frontend/src/components/reports/ReportGenerator.js
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Grid,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  PictureAsPdf,
  TableChart,
  Download,
  DateRange,
  Category
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import api from '../../services/api';

const ReportGenerator = () => {
  const [reportConfig, setReportConfig] = useState({
    type: 'summary',
    format: 'pdf',
    dateRange: {
      startDate: null,
      endDate: null
    },
    categories: [],
    includeCharts: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedReports, setGeneratedReports] = useState([]);

  const reportTypes = [
    { value: 'summary', label: 'Business Summary' },
    { value: 'financial', label: 'Financial Report' },
    { value: 'bookings', label: 'Booking Analytics' },
    { value: 'services', label: 'Service Performance' },
    { value: 'customers', label: 'Customer Analysis' }
  ];

  const handleChange = (field) => (event) => {
    setReportConfig({
      ...reportConfig,
      [field]: event.target.value
    });
  };

  const handleDateChange = (field) => (date) => {
    setReportConfig({
      ...reportConfig,
      dateRange: {
        ...reportConfig.dateRange,
        [field]: date
      }
    });
  };

  const generateReport = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/reports/generate', reportConfig);
      const newReport = {
        id: response.data.reportId,
        name: `${reportConfig.type}_${new Date().toISOString().split('T')[0]}`,
        url: response.data.reportUrl,
        type: reportConfig.type,
        format: reportConfig.format,
        generatedAt: new Date()
      };
      
      setGeneratedReports([newReport, ...generatedReports]);
    } catch (err) {
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId) => {
    try {
      const response = await api.get(`/reports/download/${reportId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${reportId}.${reportConfig.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to download report');
    }
  };

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3}>
        {/* Report Configuration */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate New Report
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={reportConfig.type}
                    onChange={handleChange('type')}
                    label="Report Type"
                  >
                    {reportTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={reportConfig.format}
                    onChange={handleChange('format')}
                    label="Format"
                  >
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="excel">Excel</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={reportConfig.dateRange.startDate}
                  onChange={handleDateChange('startDate')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={reportConfig.dateRange.endDate}
                  onChange={handleDateChange('endDate')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={reportConfig.dateRange.startDate}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Categories</InputLabel>
                  <Select
                    multiple
                    value={reportConfig.categories}
                    onChange={handleChange('categories')}
                    label="Categories"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    <MenuItem value="revenue">Revenue</MenuItem>
                    <MenuItem value="bookings">Bookings</MenuItem>
                    <MenuItem value="services">Services</MenuItem>
                    <MenuItem value="customers">Customers</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={generateReport}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Reports */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Reports
            </Typography>

            <List>
              {generatedReports.map((report) => (
                <ListItem
                  key={report.id}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      onClick={() => downloadReport(report.id)}
                    >
                      <Download />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    {report.format === 'pdf' ? <PictureAsPdf /> : <TableChart />}
                  </ListItemIcon>
                  <ListItemText
                    primary={report.name}
                    secondary={new Date(report.generatedAt).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ReportGenerator;
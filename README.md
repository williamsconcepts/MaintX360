# MaintPro360

## Digital Maintenance Management Platform for Oil & Gas Assets

MaintPro360 is a web-based Computerized Maintenance Management System (CMMS) designed to help oil and gas companies manage equipment maintenance activities, work orders, technicians, and maintenance records in a centralized digital platform.

The system reduces equipment downtime, improves maintenance planning, enhances technician productivity, and provides visibility into asset performance and maintenance operations.

---

## Problem Statement

Many maintenance teams still rely on:

- Paper-based maintenance logs
- Excel spreadsheets
- Email communication
- WhatsApp coordination
- Manual maintenance scheduling

These methods often result in:

- Missed maintenance activities
- Equipment breakdowns
- Untracked work orders
- Poor maintenance documentation
- Increased operational costs
- Reduced asset reliability

MaintPro360 digitizes maintenance operations to improve efficiency, accountability, and equipment uptime.

---

## Project Objectives

The primary objectives of MaintPro360 are:

- Digitize maintenance operations
- Centralize asset information
- Improve preventive maintenance planning
- Track maintenance work orders
- Manage technicians and assignments
- Maintain historical maintenance records
- Provide operational dashboards and reports

---

## Target Users

### Maintenance Manager

Responsible for:

- Monitoring maintenance activities
- Approving work orders
- Managing schedules
- Reviewing reports

### Maintenance Technician

Responsible for:

- Executing maintenance tasks
- Updating work order status
- Recording maintenance activities

### Operations Supervisor

Responsible for:

- Monitoring asset condition
- Reviewing maintenance performance
- Managing operational risks

### Administrator

Responsible for:

- Managing users
- Managing system configuration
- Maintaining master data

---

# Key Features

## Dashboard

The dashboard provides an overview of maintenance operations.

### KPIs

- Total Assets
- Active Work Orders
- Completed Work Orders
- Upcoming Maintenance
- Maintenance Completion Rate
- Available Technicians

### Dashboard Widgets

- Asset Summary
- Work Order Status
- Upcoming Maintenance
- Recent Activities
- Maintenance Trends

---

## Asset Management

The Asset Management module allows users to maintain a complete asset register.

### Asset Information

- Asset ID
- Asset Name
- Asset Type
- Location
- Status
- Installation Date
- Manufacturer
- Serial Number

### Functions

- Add Asset
- Edit Asset
- Delete Asset
- Search Assets
- Filter Assets
- View Asset Details

---

## Preventive Maintenance

The Preventive Maintenance module helps organizations plan and schedule maintenance activities before failures occur.

### Schedule Information

- Asset
- Maintenance Type
- Frequency
- Start Date
- Next Due Date
- Assigned Technician

### Functions

- Create Schedule
- Update Schedule
- View Upcoming Maintenance
- Receive Maintenance Alerts
- Track Schedule Compliance

---

## Work Order Management

The Work Order module manages maintenance requests from creation to completion.

### Work Order Information

- Work Order Number
- Asset
- Description
- Priority
- Assigned Technician
- Status
- Date Created
- Due Date

### Priority Levels

- Low
- Medium
- High
- Critical

### Status Options

- Open
- Assigned
- In Progress
- Completed
- Cancelled

### Functions

- Create Work Order
- Assign Technician
- Update Status
- Close Work Order
- Track Progress

---

## Technician Management

The Technician module manages maintenance personnel.

### Technician Information

- Employee ID
- Full Name
- Department
- Skill Set
- Phone Number
- Email Address

### Functions

- Add Technician
- Edit Technician
- Delete Technician
- Assign Work Orders
- View Technician Workload

---

## Maintenance History

Maintains a historical record of completed maintenance activities.

### Maintenance Record Information

- Asset
- Maintenance Date
- Technician
- Work Performed
- Notes
- Completion Status

### Benefits

- Equipment history tracking
- Audit readiness
- Maintenance trend analysis
- Improved decision making

---

## Reporting & Analytics

MaintPro360 provides operational insights through visual dashboards.

### Reports

- Asset Status Report
- Work Order Report
- Maintenance Completion Report
- Technician Performance Report
- Monthly Maintenance Report

### Analytics

- Maintenance Trends
- Asset Reliability Metrics
- Downtime Analysis
- Work Order Statistics

---

# MVP Scope

The Minimum Viable Product (MVP) will focus on three core modules:

## Module 1: Asset Register

Manage operational equipment.

### Features

- Add Asset
- Edit Asset
- Delete Asset
- Search Asset

---

## Module 2: Work Orders

Track maintenance requests.

### Features

- Create Work Order
- Assign Technician
- Update Status
- View Work Orders

---

## Module 3: Technician Management

Manage maintenance personnel.

### Features

- Add Technician
- Edit Technician
- Assign Work Orders

---

# Technology Stack

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript

## Storage (MVP)

- Browser LocalStorage

## Charts & Analytics

- Chart.js

## Backend (Future Phase)

- Node.js
- Express.js

## Database (Future Phase)

- MongoDB

---

# Local Storage Structure

## Assets

```javascript
[
  {
    assetId: "PMP001",
    assetName: "Crude Transfer Pump",
    assetType: "Pump",
    location: "Flow Station A",
    status: "Operational"
  }
]
```

## Work Orders

```javascript
[
  {
    workOrderNo: "WO001",
    assetId: "PMP001",
    technician: "TECH001",
    priority: "High",
    status: "Open"
  }
]
```

## Technicians

```javascript
[
  {
    employeeId: "TECH001",
    name: "Samuel Johnson",
    skill: "Mechanical",
    department: "Maintenance"
  }
]
```

---

# Folder Structure

```text
maintpro360/
│
├── index.html
├── dashboard.html
├── assets.html
├── workorders.html
├── technicians.html
├── schedules.html
├── history.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   ├── assets.js
│   ├── workorders.js
│   ├── technicians.js
│   ├── schedules.js
│   └── history.js
│
└── README.md
```

---

# Future Enhancements

- User Authentication
- Role-Based Access Control
- QR Code Asset Identification
- Email Notifications
- Maintenance Approval Workflow
- Mobile App Integration
- IoT Sensor Integration
- Predictive Maintenance Analytics
- Cloud Deployment
- Multi-Site Asset Management

---

# Business Value

MaintPro360 helps organizations:

- Improve equipment reliability
- Reduce downtime
- Increase technician productivity
- Improve maintenance compliance
- Reduce operational costs
- Improve maintenance visibility
- Support digital transformation initiatives

---

# Project Status

🚧 MVP Development Phase

Current Version: **v1.0.0**

Modules Included:

- Asset Management
- Work Orders
- Technician Management
- Dashboard KPIs
- LocalStorage Persistence

Upcoming Modules:

- Preventive Maintenance
- Maintenance History
- Reports & Analytics
- Backend API Integration
- MongoDB Database

---

## Developed For

NCDMB Digitalization & Local Content Development Program

### MaintPro360

**"Keeping Critical Assets Running Efficiently."**
# JenusSign Frontend v1.2.0
## Business Keys & Broker-Agent Hierarchy

---

## 🎯 What's New in v1.2.0

### ✅ Business Keys Integration
- All entities now display business keys (BRK-001, AGT-001, CUST-12345, PROP-12345)
- Business keys shown in tables and detail views
- Search functionality includes business keys

### ✅ Broker Role Support
- New Broker role with full authorization
- Brokers see all customers/proposals under their agents
- Agents see only their own data
- Proper role-based filtering

### ✅ Enhanced User Management
- Complete user management interface (Admin only)
- Display business keys for all users
- Show broker-agent relationships
- Role-based statistics dashboard

### ✅ Improved Tables
- Customer table shows Agent + Broker columns with business keys
- Proposal table shows Agent + Broker columns with business keys
- Better visual hierarchy with color-coded business keys

---

## 📦 Installation

```bash
# Extract the archive
tar -xzf jenussign-frontend-v1.2.tar.gz
cd jenussign-frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open: http://localhost:5173

---

## 🔐 Demo Credentials

### Non-Customer Portal

**Admin (Full Access + Settings):**
- Email: admin@insurance.com
- Password: admin123
- OTP: 123456

**Broker (See all agents' data):**
- Email: broker@insurance.com
- Password: broker123
- OTP: 123456

**Agent (See own data only):**
- Email: agent@insurance.com
- Password: agent123
- OTP: 123456

**Employee (See all data, no settings):**
- Email: employee@insurance.com
- Password: employee123
- OTP: 123456

---

## 🎨 Features

### Role-Based Authorization

| Role     | Customers View           | Proposals View           | User Management | 
|----------|--------------------------|--------------------------|-----------------|
| Admin    | All + Settings           | All                      | Full Access     |
| Employee | All                      | All                      | Read Only       |
| Broker   | All agents' customers    | All agents' proposals    | Read Only       |
| Agent    | Own customers only       | Own proposals only       | Read Only       |

### Business Keys Display

**Customers Table:**
- Business Key (CUST-12345)
- Customer Name and Email
- Agent Name + Business Key (AGT-001)
- Broker Name + Business Key (BRK-001)

**Proposals Table:**
- Business Key (PROP-54321)
- Proposal Reference
- Customer Name + Business Key
- Agent Name + Business Key
- Broker Name + Business Key

**Users Table (Admin Only):**
- Business Key (BRK-001, AGT-001, etc.)
- User Name and Email
- Role with icon
- Broker Assignment (for agents)

---

## 📁 Project Structure

```
jenussign-frontend-v1.2/
├── src/
│   ├── api/
│   │   └── mockApi.js              ← Enhanced with business keys
│   ├── modules/
│   │   ├── noncustomer-portal/
│   │   │   ├── pages/
│   │   │   │   ├── PortalLoginPage.jsx
│   │   │   │   ├── CustomersListPage.jsx    ← Shows business keys
│   │   │   │   ├── ProposalsListPage.jsx    ← Shows business keys
│   │   │   │   └── UserManagementPage.jsx   ← Admin only
│   │   │   └── components/
│   │   │       └── PortalLayout.jsx
│   │   └── shared/
│   │       └── components/
│   ├── stores/
│   │   └── authStore.js           ← Authentication state
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md                       ← This file
```

---

## 🧪 Testing Scenarios

### Test 1: Broker Authorization
1. Login as broker@insurance.com
2. Navigate to Customers
3. **Expected**: See customers for AGT-001 (Sarah Agent) and AGT-002 (Mike Agent)
4. Note business keys displayed

### Test 2: Agent Authorization
1. Login as agent@insurance.com
2. Navigate to Customers
3. **Expected**: See only customers assigned to AGT-001
4. Navigate to Proposals
5. **Expected**: See only proposals for your customers

### Test 3: User Management (Admin Only)
1. Login as admin@insurance.com
2. Navigate to Users
3. **Expected**: See all users with business keys
4. **Expected**: See agent-broker relationships
5. **Expected**: See role statistics

### Test 4: Business Keys Display
1. Login with any account
2. Navigate to Customers table
3. **Expected**: Business keys displayed in dedicated column
4. **Expected**: Agent and Broker columns show names + business keys

---

## 🔄 Mock Data

The frontend includes comprehensive mock data with business keys:

**Users:**
- BRK-001: John Broker
- AGT-001: Sarah Agent (under BRK-001)
- AGT-002: Mike Agent (under BRK-001)
- EMP-001: Employee User
- ADM-001: Admin User

**Customers:**
- CUST-12345: John Doe → AGT-001 → BRK-001
- CUST-12346: ACME Corporation → AGT-001 → BRK-001
- CUST-12347: Jane Smith → AGT-002 → BRK-001

**Proposals:**
- PROP-54321: PR-2024-0001 → CUST-12345 → AGT-001 → BRK-001
- PROP-54322: PR-2024-0002 → CUST-12346 → AGT-001 → BRK-001
- PROP-54323: PR-2024-0003 → CUST-12347 → AGT-002 → BRK-001

---

## 🎨 UI Highlights

### Color-Coded Business Keys
- Users: Gray (generic)
- Customers: Blue
- Proposals: Purple

### Role Badges
- Admin: Red
- Employee: Blue
- Broker: Orange
- Agent: Green

### Authorization Indicators
- Top bar shows current user's data scope
- Filters automatically applied based on role

---

## 🚀 Backend Integration

When ready to connect to your ASP.NET Core backend:

1. Update `src/api/mockApi.js` to use real endpoints
2. Replace mock data with actual API calls
3. Business keys are already integrated in all UI components
4. Authorization headers automatically added by auth store

Example API update:
```javascript
// Replace:
export const customersApi = {
  getCustomers: async (params) => {
    // ... mock implementation
  }
}

// With:
export const customersApi = {
  getCustomers: async (params) => {
    const response = await fetch('/api/v1/customers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return response.json()
  }
}
```

---

## 📊 What's Included

✅ Complete React application  
✅ Business keys in all tables  
✅ Broker-agent hierarchy display  
✅ Role-based authorization UI  
✅ User management (Admin only)  
✅ Mock API with business keys  
✅ Responsive design  
✅ Framer Motion animations  
✅ Tailwind CSS styling  
✅ React Query for data management  

---

## 🔜 Next Steps

1. ✅ Frontend complete with business keys
2. ⏳ Backend implementation (ASP.NET Core 8)
3. ⏳ Database schema with business keys
4. ⏳ Core Insurance System integration
5. ⏳ Production deployment

---

## 📝 Version History

**v1.2.0** (Current)
- ✅ Business keys integrated throughout UI
- ✅ Broker role fully supported
- ✅ Enhanced user management
- ✅ Agent/Broker columns in tables
- ✅ Role-based authorization display

**v1.0.2**
- Initial frontend implementation
- Basic CRUD operations
- Mock API

---

## 💡 Tips

- Business keys are read-only in the UI
- All authorization is visual only (backend will enforce)
- Mock data resets on page refresh
- OTP is always 123456 for testing

---

## 📞 Support

For backend integration guide, see:
- IMPLEMENTATION-GUIDE-v1.2.md
- jenussign-enhanced-schema.md
- jenussign-api-spec-v1.2.md

---

**Ready for backend integration!** 🚀

Version: 1.2.0  
Date: November 17, 2024  
Status: Production Ready Frontend

---

## ✨ Complete CRUD Operations

### Customer Management
- **List View**: `/portal/customers` - Browse all customers with filtering
- **Detail View**: `/portal/customers/:id` - View/edit customer details
- **Create**: `/portal/customers/new` - Add new customer with business key

### Proposal Management  
- **List View**: `/portal/proposals` - Browse all proposals with filtering
- **Detail View**: `/portal/proposals/:id` - View proposal details
- **Create**: `/portal/proposals/new` - Create new proposal linked to customer

### User Management (Admin Only)
- **List View**: `/portal/users` - Manage all system users
- **Detail View**: `/portal/users/:id` - View user details
- **Create**: `/portal/users/new` - Add new user (Broker/Agent/Employee/Admin)

### Forms Include:
- ✅ Business key auto-generation
- ✅ Agent/Broker assignment
- ✅ Validation and error handling
- ✅ Role-based access control
- ✅ Real-time updates with React Query

---

## 🎨 UI Features

- **Click any row** to view details
- **Edit button** on detail pages (Admin/Employee only)
- **Create buttons** on list pages
- **Back navigation** on all pages
- **Toast notifications** for all actions
- **Loading states** throughout
- **Responsive design** for all screen sizes


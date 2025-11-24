#!/bin/bash
set -e

echo "Adding navigation to list pages..."

# Update CustomersListPage - add navigate import and onClick
sed -i "1a import { useNavigate } from 'react-router-dom'" src/modules/noncustomer-portal/pages/CustomersListPage.jsx
sed -i 's/const CustomersListPage = () => {/const CustomersListPage = () => {\n  const navigate = useNavigate()/' src/modules/noncustomer-portal/pages/CustomersListPage.jsx
sed -i 's/onClick={() => navigate("\/portal\/customers\/new")}/onClick={() => navigate("\/portal\/customers\/new")}/' src/modules/noncustomer-portal/pages/CustomersListPage.jsx
sed -i 's/className="hover:bg-gray-50 cursor-pointer"/onClick={() => navigate(`\/portal\/customers\/${customer.id}`)}\n                    className="hover:bg-gray-50 cursor-pointer"/' src/modules/noncustomer-portal/pages/CustomersListPage.jsx

# Update ProposalsListPage - add onClick
sed -i 's/className="hover:bg-gray-50 cursor-pointer"/onClick={() => navigate(`\/portal\/proposals\/${proposal.id}`)}\n                    className="hover:bg-gray-50 cursor-pointer"/' src/modules/noncustomer-portal/pages/ProposalsListPage.jsx
sed -i 's/onClick={() => navigate("\/portal\/proposals\/new")}/onClick={() => navigate("\/portal\/proposals\/new")}/' src/modules/noncustomer-portal/pages/ProposalsListPage.jsx

# Update UserManagementPage - add onClick
sed -i 's/className="hover:bg-gray-50 cursor-pointer"/onClick={() => navigate(`\/portal\/users\/${user.id}`)}\n                      className="hover:bg-gray-50 cursor-pointer"/' src/modules/noncustomer-portal/pages/UserManagementPage.jsx
sed -i 's/<Plus size={20} \/>/<Plus size={20} \/>/g' src/modules/noncustomer-portal/pages/UserManagementPage.jsx
sed -i 's/className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"/onClick={() => navigate("\/portal\/users\/new")}\n            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"/' src/modules/noncustomer-portal/pages/UserManagementPage.jsx

echo "✅ Navigation added to all list pages"

# Update README with form information
cat >> README.md << 'EOF'

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

EOF

echo "✅ README updated"
echo ""
echo "🎉 Frontend v1.2.0 with Forms COMPLETE!"

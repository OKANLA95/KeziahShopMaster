// src/pages/dashboards/AdminDashboard.js
import React, { useState, useEffect } from "react";
import { db, auth, storage, secondaryAuth } from "../../firebase"; // ✅ include secondaryAuth
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  setDoc, // ✅ add this
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth"; // ✅ create auth users
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Sidebar from "../../components/AdminSidebar";

// ---- Shop Types & Roles ----
const shopTypes = [
  "Medical",
  "Boutique",
  "Provisions",
  "Pharmacy",
  "Supermarket",
  "Vehicles & Spare Parts",
  "Cosmetics",
  "Building & Construction",
  "Cold Store",
  "Baby Care",
  "Others",
];

const rolesList = ["Manager", "Finance", "Sales"];

// ---- Utility: Generate human-readable Shop ID ----
const generateShopId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "SHOP-";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
};

const AdminDashboard = () => {
  const [shops, setShops] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeSection, setActiveSection] = useState(""); // shops | users
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [shopForm, setShopForm] = useState({
    name: "",
    location: "",
    phone: "",
    type: shopTypes[0],
    logoFile: null,
    businessCertificateNumber: "",
  });

  const [userForm, setUserForm] = useState({
    fullName: "",
    age: "",
    sex: "",
    contact: "",
    email: "",
    username: "",
    password: "12345678",
    role: rolesList[2],
    shopId: "",
    active: true,
    mustResetPassword: true,
  });

  const adminUid = auth.currentUser?.uid;

  // ---- Fetch Shops & Users in real-time ----
  useEffect(() => {
    if (!adminUid) return;

    // Real-time listener for shops
    const shopsQuery = query(
      collection(db, "shops"),
      where("createdBy", "==", adminUid)
    );
    const unsubscribeShops = onSnapshot(shopsQuery, (snapshot) => {
      setShops(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Real-time listener for users
    const usersQuery = query(
      collection(db, "users"),
      where("createdBy", "==", adminUid)
    );
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    // Clean up listeners on unmount
    return () => {
      unsubscribeShops();
      unsubscribeUsers();
    };
  }, [adminUid]);

  // --------- SHOP FUNCTIONS ---------
  const handleShopInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setShopForm({ ...shopForm, logoFile: files[0] });
    } else {
      setShopForm({ ...shopForm, [name]: value });
    }
  };

  const handleCreateShop = async () => {
    if (shops.length >= 5) return alert("⚠️ You can only create 5 shops.");
    const { name, location, phone, type, logoFile, businessCertificateNumber } =
      shopForm;
    if (!name || !location || !phone)
      return alert("⚠️ Name, location & phone are required.");

    let logoURL = "";
    if (logoFile) {
      const logoRef = ref(storage, `shop-logos/${Date.now()}-${logoFile.name}`);
      await uploadBytes(logoRef, logoFile);
      logoURL = await getDownloadURL(logoRef);
    }

    const shopId = generateShopId();

    await addDoc(collection(db, "shops"), {
      shopId,
      name,
      location,
      phone,
      type,
      logoURL,
      businessCertificateNumber,
      createdBy: adminUid,
      createdAt: serverTimestamp(),
    });

    setShopForm({
      name: "",
      location: "",
      phone: "",
      type: shopTypes[0],
      logoFile: null,
      businessCertificateNumber: "",
    });

    alert("✅ Shop created successfully!");
  };

  const handleUpdateShop = async () => {
    if (!selectedShop) return alert("No shop selected.");
    const shopRef = doc(db, "shops", selectedShop.id);
    await updateDoc(shopRef, {
      name: shopForm.name,
      location: shopForm.location,
      phone: shopForm.phone,
      type: shopForm.type,
      businessCertificateNumber: shopForm.businessCertificateNumber,
    });
    alert("✅ Shop updated!");
    setSelectedShop(null);
  };

  // --------- USER FUNCTIONS ---------
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  const handleCreateUser = async () => {
  const { fullName, email, username, password, role, shopId } = userForm;
  if (!fullName || !(email || username) || !password || !role || !shopId)
    return alert("⚠️ All required fields must be filled.");

  if (
    (role === "Manager" &&
      users.find((u) => u.shopId === shopId && u.role === "Manager")) ||
    (role === "Finance" &&
      users.find((u) => u.shopId === shopId && u.role === "Finance"))
  )
    return alert(`⚠️ This shop already has a ${role}.`);

  try {
    const authEmail = email || `${username}@noemail.local`;
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      authEmail,
      password
    );
    const uid = cred.user.uid;

    // ✅ Save user using UID as document ID
    await setDoc(doc(db, "users", uid), {
      uid,
      ...userForm,
      email: authEmail,
      createdBy: adminUid,
      createdByAdmin: true,
      active: true,
      mustResetPassword: true,
      createdAt: serverTimestamp(),
    });

    alert(
      `📧 Email sent to ${email || username}: Default password is ${password}. User must reset at first login.`
    );

    setUserForm({
      fullName: "",
      age: "",
      sex: "",
      contact: "",
      email: "",
      username: "",
      password: "12345678",
      role: rolesList[2],
      shopId: "",
      active: true,
      mustResetPassword: true,
    });

    alert("✅ User created successfully!");
  } catch (error) {
    console.error("Error creating user:", error);
    alert("❌ " + (error?.message || "Failed to create user"));
  }
};

  const handleResetPassword = async (user) => {
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, { password: "12345678", mustResetPassword: true });
    alert(
      `🔑 Password reset for ${user.fullName} to default: 12345678. User must reset on next login.`
    );
  };

  const handleToggleUserStatus = async (user) => {
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, { active: !user.active });
    alert(`${user.fullName} is now ${!user.active ? "disabled" : "enabled"}`);
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.fullName}?`))
      return;
    await deleteDoc(doc(db, "users", user.id));
    setUsers(users.filter((u) => u.id !== user.id));
    alert(`${user.fullName} deleted successfully!`);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h2>Admin Dashboard</h2>
        </header>

        {/* Dashboard Home */}
        {!activeSection && (
          <div className="menu-cards">
            <div className="menu-card" onClick={() => setActiveSection("shops")}>
              🏬 Manage Shops
            </div>
            <div className="menu-card" onClick={() => setActiveSection("users")}>
              👥 Manage Users
            </div>
          </div>
        )}

        {/* Shops Section */}
        {activeSection === "shops" && (
          <section className="card-section">
            <h3>Shops Management</h3>
            <button onClick={() => setActiveSection("createShop")}>
              ➕ Create Shop
            </button>
            <button onClick={() => setActiveSection("viewShops")}>
              📋 View Shops
            </button>
            <button onClick={() => setActiveSection("")} className="back-btn">
              ⬅ Back
            </button>
          </section>
        )}

        {activeSection === "createShop" && (
          <section className="card-section">
            <h3>Create New Shop</h3>
            <input
              placeholder="Shop Name"
              name="name"
              value={shopForm.name}
              onChange={handleShopInputChange}
            />
            <input
              placeholder="Location"
              name="location"
              value={shopForm.location}
              onChange={handleShopInputChange}
            />
            <input
              placeholder="Phone"
              name="phone"
              value={shopForm.phone}
              onChange={handleShopInputChange}
            />
            <select
              name="type"
              value={shopForm.type}
              onChange={handleShopInputChange}
            >
              {shopTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <input type="file" name="logoFile" onChange={handleShopInputChange} />
            <input
              placeholder="Business Certificate"
              name="businessCertificateNumber"
              value={shopForm.businessCertificateNumber}
              onChange={handleShopInputChange}
            />
            <button onClick={handleCreateShop}>Create Shop</button>
            <button
              onClick={() => setActiveSection("shops")}
              className="back-btn"
            >
              ⬅ Back
            </button>
          </section>
        )}

        {activeSection === "viewShops" && (
          <section className="card-section">
            <h3>All Shops</h3>
            {shops.map((shop) => (
              <div key={shop.id} className="list-item">
                <strong>{shop.name}</strong> ({shop.shopId}) - {shop.type} -{" "}
                {shop.phone}
                <button
                  onClick={() => {
                    setSelectedShop(shop);
                    setShopForm(shop);
                    setActiveSection("updateShop");
                  }}
                >
                  ✏️ Edit
                </button>
              </div>
            ))}
            <button onClick={() => setActiveSection("shops")} className="back-btn">
              ⬅ Back
            </button>
          </section>
        )}

        {activeSection === "updateShop" && selectedShop && (
          <section className="card-section">
            <h3>Update Shop</h3>
            <input
              placeholder="Shop Name"
              name="name"
              value={shopForm.name}
              onChange={handleShopInputChange}
            />
            <input
              placeholder="Location"
              name="location"
              value={shopForm.location}
              onChange={handleShopInputChange}
            />
            <input
              placeholder="Phone"
              name="phone"
              value={shopForm.phone}
              onChange={handleShopInputChange}
            />
            <select
              name="type"
              value={shopForm.type}
              onChange={handleShopInputChange}
            >
              {shopTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <input
              placeholder="Business Certificate"
              name="businessCertificateNumber"
              value={shopForm.businessCertificateNumber}
              onChange={handleShopInputChange}
            />
            <button onClick={handleUpdateShop}>Update Shop</button>
            <button
              onClick={() => setActiveSection("viewShops")}
              className="back-btn"
            >
              ⬅ Back
            </button>
          </section>
        )}

        {/* Users Section */}
        {activeSection === "users" && (
          <section className="card-section">
            <h3>Users Management</h3>
            <button onClick={() => setActiveSection("createUser")}>
              ➕ Create User
            </button>
            <button onClick={() => setActiveSection("viewUsers")}>
              📋 View Users
            </button>
            <button onClick={() => setActiveSection("")} className="back-btn">
              ⬅ Back
            </button>
          </section>
        )}

        {activeSection === "createUser" && (
          <section className="card-section">
            <h3>Create New User</h3>
            <input
              placeholder="Full Name"
              name="fullName"
              value={userForm.fullName}
              onChange={handleUserInputChange}
            />
            <input
              placeholder="Age"
              name="age"
              value={userForm.age}
              onChange={handleUserInputChange}
            />
            <input
              placeholder="Sex"
              name="sex"
              value={userForm.sex}
              onChange={handleUserInputChange}
            />
            <input
              placeholder="Contact"
              name="contact"
              value={userForm.contact}
              onChange={handleUserInputChange}
            />
            <input
              placeholder="Email"
              name="email"
              value={userForm.email}
              onChange={handleUserInputChange}
            />
            <input
              placeholder="Username (optional)"
              name="username"
              value={userForm.username}
              onChange={handleUserInputChange}
            />
            <select
              name="shopId"
              value={userForm.shopId}
              onChange={handleUserInputChange}
            >
              <option value="">Select Shop</option>
              {shops.map((s) => (
                <option key={s.id} value={s.shopId || s.id}>
                  {s.name} ({s.shopId})
                </option>
              ))}
            </select>
            <select
              name="role"
              value={userForm.role}
              onChange={handleUserInputChange}
            >
              {rolesList.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
            <button onClick={handleCreateUser}>Create User</button>
            <button onClick={() => setActiveSection("users")} className="back-btn">
              ⬅ Back
            </button>
          </section>
        )}

        {activeSection === "viewUsers" && (
          <section className="card-section">
            <h3>All Users</h3>
            {users.map((user) => (
              <div key={user.id} className="list-item">
                <strong>{user.fullName}</strong> - {user.role} -{" "}
                {user.email || user.username} -{" "}
                {user.active ? "Active" : "Disabled"}
                <div>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setUserForm(user);
                      setActiveSection("updateUser");
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleResetPassword(user)}>
                    🔑 Reset Password
                  </button>
                  <button onClick={() => handleToggleUserStatus(user)}>
                    {user.active ? "Disable" : "Enable"}
                  </button>
                  <button onClick={() => handleDeleteUser(user)}>🗑 Delete</button>
                </div>
              </div>
            ))}
            <button onClick={() => setActiveSection("users")} className="back-btn">
              ⬅ Back
            </button>
          </section>
        )}

        {activeSection === "updateUser" && selectedUser && (
          <section className="card-section">
            <h3>Update User</h3>
            <input
              placeholder="Full Name"
              name="fullName"
              value={userForm.fullName}
              onChange={handleUserInputChange}
            />
            <select
              name="shopId"
              value={userForm.shopId}
              onChange={handleUserInputChange}
            >
              {shops.map((s) => (
                <option key={s.id} value={s.shopId || s.id}>
                  {s.name} ({s.shopId})
                </option>
              ))}
            </select>
            <select
              name="role"
              value={userForm.role}
              onChange={handleUserInputChange}
            >
              {rolesList.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
            <button onClick={handleUpdateUser}>Update User</button>
            <button
              onClick={() => setActiveSection("viewUsers")}
              className="back-btn"
            >
              ⬅ Back
            </button>
          </section>
        )}
      </main>

      {/* STYLES */}
      <style>{`
        .dashboard-container { display: flex; font-family: 'Segoe UI', sans-serif; }
        .dashboard-main { margin-left: 240px; padding: 20px; width: 100%; background: #f9fafc; min-height: 100vh; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .menu-cards { display: flex; gap: 20px; }
        .menu-card { background: #fff; padding: 20px; cursor: pointer; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .card-section { background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); margin-bottom: 20px; }
        input, select { display: block; margin-bottom: 10px; padding: 8px; width: 100%; border: 1px solid #ddd; border-radius: 4px; }
        button { margin-right: 10px; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; background: #007bff; color: #fff; }
        button.back-btn { background: #6c757d; }
        .list-item { background: #f1f3f5; margin-bottom: 10px; padding: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
        .list-item div button { margin-left: 5px; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;

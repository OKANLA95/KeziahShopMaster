import React from "react";

export default function ProductList({
  products,
  userRole,
  showActions = false,
  onEdit,
  onDelete,
  loading,
}) {
  if (loading) return <p>Loading product list...</p>;

  if (!products || products.length === 0) return <p>No products available.</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Products</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Stock</th>
            {userRole === "Manager" || userRole === "Finance" ? (
              <th style={styles.th}>Cost Price</th>
            ) : null}
            <th style={styles.th}>Discount</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>Unit</th>
            {showActions && <th style={styles.th}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} style={styles.tr}>
              <td style={styles.td}>{product.name}</td>
              <td style={styles.td}>{product.price}</td>
              <td style={styles.td}>{product.stock}</td>
              {(userRole === "Manager" || userRole === "Finance") && (
                <td style={styles.td}>{product.costPrice || "-"}</td>
              )}
              <td style={styles.td}>{product.discount || 0}%</td>
              <td style={styles.td}>{product.category}</td>
              <td style={styles.td}>{product.unit}</td>
              {showActions && (
                <td style={styles.td}>
                  <button
                    onClick={() => onEdit(product)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    overflowX: "auto",
    borderRadius: 15,
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    backgroundColor: "#fff",
    padding: 20,
  },
  heading: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: "1.5rem",
    color: "#362bd9",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "'Segoe UI', sans-serif",
  },
  th: {
    padding: 12,
    borderBottom: "2px solid #eee",
    textAlign: "left",
    color: "#444",
    backgroundColor: "#f9f9ff",
  },
  tr: {
    transition: "all 0.2s ease",
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #eee",
  },
  editButton: {
    padding: "6px 12px",
    marginRight: 8,
    borderRadius: 6,
    border: "none",
    backgroundColor: "#4a3aff",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
  deleteButton: {
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#ff4a4a",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

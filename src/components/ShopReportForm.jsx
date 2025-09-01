import React, { useState } from "react";
import { motion } from "framer-motion";
import { db, auth, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  Upload,
  FileText,
  DollarSign,
  Calendar,
  ClipboardList,
  AlertTriangle,
  PackageX,
  UserMinus,
  Eye,
} from "lucide-react";

const ReportForm = () => {
  const [subject, setSubject] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState(null);
  const [viewers, setViewers] = useState([]); // Finance & Sales only

  const handleCheckboxChange = (value) => {
    setViewers((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let fileUrl = null;
      if (file) {
        const fileRef = ref(storage, `reports/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "reports"), {
        subject,
        amount: amount ? parseFloat(amount) : null,
        reason,
        date: date || new Date().toISOString().split("T")[0],
        fileUrl,
        viewers: ["Manager", ...viewers], // ✅ Manager always included
        createdBy: auth.currentUser?.uid || "unknown",
        createdAt: serverTimestamp(),
      });

      alert("Report submitted successfully!");
      setSubject("");
      setAmount("");
      setReason("");
      setDate("");
      setFile(null);
      setViewers([]);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Error submitting report.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6"
    >
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-200"
        whileHover={{ scale: 1.01 }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" /> Submit Report
        </h2>

        {/* Subject */}
        <div className="mb-5">
          <label className="block text-gray-700 font-medium mb-2">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Subject</option>
            <option value="Expenses">Expenses</option>
            <option value="Expired Products">Expired Products</option>
            <option value="Losses">Losses</option>
            <option value="Off Duty Request">Off Duty Request</option>
            <option value="Others">Others</option>
          </select>
        </div>

        {/* Expenses */}
        {subject === "Expenses" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-5">
              <label className="flex items-center gap-2 font-medium mb-2">
                <DollarSign className="w-4 h-4 text-green-600" /> Amount (GHS)
              </label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border p-3 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div className="mb-5">
              <label className="flex items-center gap-2 font-medium mb-2">
                <Calendar className="w-4 h-4 text-purple-600" /> Date
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border p-3 focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="mb-5">
              <label className="flex items-center gap-2 font-medium mb-2">
                <FileText className="w-4 h-4 text-red-600" /> Reason
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border p-3 min-h-[100px] focus:ring-2 focus:ring-red-500 outline-none" />
            </div>
            {(!amount || parseFloat(amount) >= 50) && (
              <div className="mb-5">
                <label className="flex items-center gap-2 font-medium mb-2">
                  <Upload className="w-4 h-4 text-blue-600" /> Upload Receipt (optional)
                </label>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full text-gray-600 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
              </div>
            )}
          </motion.div>
        )}

        {/* Expired Products */}
        {subject === "Expired Products" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-5">
              <label className="flex items-center gap-2 font-medium mb-2">
                <PackageX className="w-4 h-4 text-orange-600" /> Product Details
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="List expired products and quantities" className="w-full rounded-xl border p-3 min-h-[100px] focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </motion.div>
        )}

        {/* Losses */}
        {subject === "Losses" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-5">
              <label className="flex items-center gap-2 font-medium mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" /> Loss Description
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain the loss situation" className="w-full rounded-xl border p-3 min-h-[100px] focus:ring-2 focus:ring-yellow-500 outline-none" />
            </div>
          </motion.div>
        )}

        {/* Off Duty Request */}
        {subject === "Off Duty Request" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-5">
              <label className="flex items-center gap-2 font-medium mb-2">
                <UserMinus className="w-4 h-4 text-indigo-600" /> Reason for Request
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why do you need time off?" className="w-full rounded-xl border p-3 min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="mb-5">
              <label className="flex items-center gap-2 font-medium mb-2">
                <Calendar className="w-4 h-4 text-indigo-600" /> Requested Date
              </label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </motion.div>
        )}

        {/* Others */}
        {subject === "Others" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="mb-5">
              <label className="flex items-center gap-2 font-medium mb-2">
                <FileText className="w-4 h-4 text-gray-600" /> Description
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Provide details for your report" className="w-full rounded-xl border p-3 min-h-[100px] focus:ring-2 focus:ring-gray-500 outline-none" />
            </div>
          </motion.div>
        )}

        {/* Viewers Section */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" /> Who can view this report?
          </label>
          <div className="flex flex-col gap-2">
            {/* Manager - always included */}
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" checked={true} disabled className="accent-blue-600" /> Manager (default)
            </label>
            {/* Finance */}
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" checked={viewers.includes("Finance")} onChange={() => handleCheckboxChange("Finance")} className="accent-blue-600" /> Finance
            </label>
            {/* Sales */}
            <label className="flex items-center gap-2 text-gray-700">
              <input type="checkbox" checked={viewers.includes("Sales")} onChange={() => handleCheckboxChange("Sales")} className="accent-blue-600" /> Sales
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg transition">
            Submit Report
          </motion.button>
          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="/reports" className="flex-1 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-800 text-white font-semibold shadow-md hover:shadow-lg transition text-center">
            View Reports
          </motion.a>
        </div>
      </motion.form>
    </motion.div>
  );
};

export default ReportForm;

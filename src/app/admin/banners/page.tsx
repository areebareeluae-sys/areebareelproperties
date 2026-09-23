"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Icon } from "@iconify/react";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Fetch Banners on Load
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/banners");
      if (!res.ok) throw new Error("Failed to fetch banners");
      const data = await res.json();
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle File Selection & Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle Upload to API (Cloudinary & Database)
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage({ text: "Please select an image file first.", type: "error" });
      return;
    }

    try {
      setUploading(true);
      setMessage({ text: "", type: "" });

      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/banners", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setMessage({ text: "Banner uploaded successfully!", type: "success" });
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchBanners(); // Refresh list
    } catch (error) {
      console.error("Upload error:", error);
      setMessage({ text: "Error uploading banner. Try again.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  // Handle Delete Banner
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const res = await fetch(`/api/banners?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");
      
      setBanners(banners.filter((b) => b.id !== id));
      setMessage({ text: "Banner deleted successfully.", type: "success" });
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({ text: "Failed to delete banner.", type: "error" });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto mt-[100px]">
      <h1 className="text-2xl text-center font-bold text-gray-800 dark:text-white mb-6">
        Manage Advertisement Banners
      </h1>

      {/* Upload Form Card */}
      <div className="bg-white dark:bg-semidark p-6 rounded-xl shadow-md border border-border dark:border-dark_border mb-8">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Upload New Banner 1200px width aur 400px height
        </h2>

        {message.text && (
          <div
            className={`p-3 mb-4 rounded-lg text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpload} className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full flex-1">
            <label className="block w-full border-2 border-dashed border-gray-300 dark:border-dark_border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {previewUrl ? (
                <div className="relative h-20 w-full">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                  <Icon icon="solar:cloud-upload-linear" width="28" height="28" className="mb-1" />
                  <span className="text-xs">Click to select banner image</span>
                </div>
              )}
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload Banner"}
          </button>
        </form>
      </div>

      {/* Banners List Table */}
      <div className="bg-white dark:bg-semidark rounded-xl shadow-md border border-border dark:border-dark_border overflow-hidden">
        <div className="p-4 border-b border-border dark:border-dark_border">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Existing Banners ({banners.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No banners found. Upload one above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark_border/30 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Banner Preview</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-dark_border text-sm">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50/50 dark:hover:bg-dark_border/10">
                    <td className="py-3 px-4 font-bold text-gray-600 dark:text-gray-300">
                      #{banner.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative w-36 h-14 rounded-md overflow-hidden border border-border">
                        <Image
                          src={banner.image}
                          alt={`Banner ${banner.id}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded">
                        {banner.status || "Active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
                        title="Delete Banner"
                      >
                        <Icon icon="solar:trash-bin-trash-linear" width="18" height="18" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
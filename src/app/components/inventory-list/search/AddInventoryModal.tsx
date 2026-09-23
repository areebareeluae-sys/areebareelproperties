'use client';

import React, { useState, useEffect } from 'react';

interface InventoryItem {
  id?: string;
  property_title: string;
  price: number | string;
  location: string;
  country: string;
  currency: string;
  category: string;
  status: string;
  tag: string;
  beds: number;
  baths: number;
  sqrft: number;
  garages: number;
  image?: string | null;
  images?: string[]; // Multiple images ke liye array
}

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  inventoryData?: InventoryItem | null;
  categories?: string[];
  bedsOptions?: (number | string)[];
  bathsOptions?: (number | string)[];
  garagesOptions?: (number | string)[];
}

export default function AddInventoryModal({
  isOpen,
  onClose,
  onSuccess,
  inventoryData = null,
  categories = ['Studio Apartment', 'Apartment', 'Villa', 'Commercial', 'House', 'Office', 'Shop', 'Warehouse'],
  bedsOptions = [0, 1, 2, 3, 4, 5, 6],
  bathsOptions = [0, 1, 2, 3, 4, 5, 6],
  garagesOptions = [0, 1, 2, 3],
}: AddInventoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    property_title: '',
    price: '',
    location: '',
    country: 'Pakistan',
    currency: 'PKR',
    category: categories[0] || 'Apartment',
    status: 'Active',
    tag: 'For Sale',
    beds: Number(bedsOptions[0]) || 1,
    baths: Number(bathsOptions[0]) || 1,
    sqrft: '',
    garages: Number(garagesOptions[0]) || 0,
  });

  useEffect(() => {
    if (inventoryData) {
      const itemCountry = inventoryData.country || 'Pakistan';
      setFormData({
        property_title: inventoryData.property_title || '',
        price: inventoryData.price ? Number(inventoryData.price).toLocaleString() : '',
        location: inventoryData.location || '',
        country: itemCountry,
        currency: inventoryData.currency || (itemCountry === 'United Arab Emirates' ? 'AED' : 'PKR'),
        category: inventoryData.category || categories[0],
        status: inventoryData.status || 'Active',
        tag: inventoryData.tag || 'For Sale',
        beds: Number(inventoryData.beds) || 1,
        baths: Number(inventoryData.baths) || 1,
        sqrft: inventoryData.sqrft ? String(inventoryData.sqrft) : '',
        garages: Number(inventoryData.garages) || 0,
      });
      // Agar purani images hain toh unhein preview mein dikhayein
      const existingImgs = inventoryData.images || (inventoryData.image ? [inventoryData.image] : []);
      setPreviewUrls(existingImgs);
    } else {
      setFormData({
        property_title: '',
        price: '',
        location: '',
        country: 'Pakistan',
        currency: 'PKR',
        category: categories[0] || 'Apartment',
        status: 'Active',
        tag: 'For Sale',
        beds: Number(bedsOptions[0]) || 1,
        baths: Number(bathsOptions[0]) || 1,
        sqrft: '',
        garages: Number(garagesOptions[0]) || 0,
      });
      setPreviewUrls([]);
      setSelectedFiles([]);
    }
  }, [inventoryData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'price') {
      const rawValue = value.replace(/,/g, '');
      if (!isNaN(Number(rawValue)) || rawValue === '') {
        const formattedValue = rawValue === '' ? '' : Number(rawValue).toLocaleString();
        setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      }
      return;
    }

    if (name === 'country') {
      const newCurrency = value === 'Pakistan' ? 'PKR' : 'AED';
      setFormData((prev) => ({
        ...prev,
        country: value,
        currency: newCurrency,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'beds' || name === 'baths' || name === 'garages' || name === 'sqrft'
          ? value === '' ? '' : Number(value)
          : value,
    }));
  };

  // Multiple Image Selection & Preview Handler
  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);

      // Temporary browser preview URLs generate karein
      const newPreviews = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(newPreviews);
    }
  };

  // Helper function to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const cloudName = "y556pcib"; 
      const uploadPreset = "real_estate_albums"; // Cloudinary unsigned preset
      const uploadedImageUrls: string[] = [];

      // STEP 1: Agar nayi images select ki hain, toh unhein Cloudinary par upload karein
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgress(`Uploading image ${i + 1} of ${selectedFiles.length}...`);
          const file = selectedFiles[i];
          const cloudFormData = new FormData();
          cloudFormData.append('file', file);
          cloudFormData.append('upload_preset', uploadPreset);

          const cloudRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: 'POST',
              body: cloudFormData,
            }
          );

          const cloudData = await cloudRes.json();
          if (cloudData.secure_url) {
            uploadedImageUrls.push(cloudData.secure_url);
          } else {
            console.error('Cloudinary error for file:', file.name, cloudData);
          }
        }
      } else {
        // Agar nayi select nahi ki aur purani mojood hain toh wohi use karein
        uploadedImageUrls.push(...previewUrls);
      }

      setUploadProgress('Saving inventory details...');

      // Generate a unique slug for the property title
      const generatedSlug = `${generateSlug(formData.property_title || 'property')}-${Date.now().toString().slice(-4)}`;

      // STEP 2: Final payload inventory API par bhejna
      const finalPayload = {
        userId: '1',
        property_title: formData.property_title,
        slug: generatedSlug, // Added slug here to fix validation error
        price: String(formData.price).replace(/,/g, ''),
        location: formData.location,
        country: formData.country,
        currency: formData.currency,
        category: formData.category,
        status: formData.status,
        tag: formData.tag,
        beds: formData.beds,
        baths: formData.baths,
        sqrft: formData.sqrft ? Number(formData.sqrft) : 0,
        garages: formData.garages,
        image: uploadedImageUrls[0] || '', // Pehli image thumbnail ke tor par
        images: uploadedImageUrls,         // Poora album array
      };

      const url = inventoryData?.id ? `/api/inventory/${inventoryData.id}` : '/api/inventory';
      const method = inventoryData?.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        let errMessage = 'Failed to save inventory';
        try {
          const errData = await res.json();
          errMessage = errData.message || JSON.stringify(errData);
        } catch {
          errMessage = (await res.text()) || 'Unknown server error';
        }
        console.error('Server error:', errMessage);
        alert(`Server Error: ${errMessage}`);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('An unexpected error occurred while saving.');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-semidark rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-dark_border">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-dark_border">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              {inventoryData?.id ? 'Edit Inventory Item' : 'Add Inventory & Album'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload multiple photos and fill inventory details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-darkmode text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Multiple Image Album Upload Area */}
          <div>
            <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
              Inventory Album Images (Multiple)
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 dark:border-dark_border rounded-xl p-4 text-center hover:border-primary transition-colors bg-gray-50/50 dark:bg-darkmode/50">
                <span className="text-sm text-primary font-medium block">
                  Choose Photo Album
                </span>
                <span className="text-xs text-gray-400 mt-1 block">
                  Select multiple PNG, JPG, WEBP files
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Album Previews */}
            {previewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-gray-200 dark:border-dark_border rounded-xl">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="h-20 relative rounded-lg overflow-hidden border shadow-sm">
                    <img
                      src={url}
                      alt={`Album Preview ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
              Inventory Title
            </label>
            <input
              required
              type="text"
              name="property_title"
              placeholder="e.g. Modern Luxury Villa in DHA"
              value={formData.property_title}
              onChange={handleChange}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Country & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Pakistan">Pakistan</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Location Address
              </label>
              <input
                required
                type="text"
                name="location"
                placeholder="e.g. Lahore, Gulberg III"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Price ({formData.currency})
              </label>
              <input
                required
                type="text"
                name="price"
                placeholder={formData.country === 'Pakistan' ? 'e.g. 15,000,000' : 'e.g. 500,000'}
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Sold">Sold</option>
            </select>
          </div>

          {/* Tag, Beds, Baths, Sqrft & Garages Specs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Tag
              </label>
              <select
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="w-full p-2 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
                <option value="For Investment">For Investment</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Beds
              </label>
              <select
                name="beds"
                value={formData.beds}
                onChange={handleChange}
                className="w-full p-2 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {bedsOptions.map((bed) => (
                  <option key={bed} value={bed}>
                    {bed}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Baths
              </label>
              <select
                name="baths"
                value={formData.baths}
                onChange={handleChange}
                className="w-full p-2 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {bathsOptions.map((bath) => (
                  <option key={bath} value={bath}>
                    {bath}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Sq Ft
              </label>
              <input
                type="number"
                name="sqrft"
                placeholder="e.g. 1200"
                value={formData.sqrft}
                onChange={handleChange}
                className="w-full p-2 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Garages
              </label>
              <select
                name="garages"
                value={formData.garages}
                onChange={handleChange}
                className="w-full p-2 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {garagesOptions.map((garage) => (
                  <option key={garage} value={garage}>
                    {garage}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload Progress Status Text */}
          {uploadProgress && (
            <p className="text-xs text-primary font-semibold text-center mt-1 animate-pulse">
              {uploadProgress}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-dark_border flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-lg border border-gray-300 dark:border-dark_border text-sm font-medium hover:bg-gray-50 dark:hover:bg-darkmode transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white py-2.5 px-6 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-lg shadow-primary/20"
            >
              {loading ? 'Processing...' : inventoryData?.id ? 'Update Inventory' : 'Save Inventory'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';

interface Property {
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
  garages: number;
  image?: string | null;
  images?: string[]; // Multiple images ke liye array
}

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  propertyData?: Property | null;
  categories?: string[];
  bedsOptions?: (number | string)[];
  bathsOptions?: (number | string)[];
  garagesOptions?: (number | string)[];
}

export default function AddPropertyModal({
  isOpen,
  onClose,
  onSuccess,
  propertyData = null,
  categories = ['Apartment', 'Villa', 'Commercial', 'House', 'Office', 'Shop', 'Warehouse'],
  bedsOptions = [1, 2, 3, 4, 5, 6],
  bathsOptions = [1, 2, 3, 4, 5, 6],
  garagesOptions = [0, 1, 2, 3],
}: AddPropertyModalProps) {
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
    garages: Number(garagesOptions[0]) || 0,
  });

  useEffect(() => {
    if (propertyData) {
      const propCountry = propertyData.country || 'Pakistan';
      setFormData({
        property_title: propertyData.property_title || '',
        price: propertyData.price ? Number(propertyData.price).toLocaleString() : '',
        location: propertyData.location || '',
        country: propCountry,
        currency: propertyData.currency || (propCountry === 'United Arab Emirates' ? 'AED' : 'PKR'),
        category: propertyData.category || categories[0],
        status: propertyData.status || 'Active',
        tag: propertyData.tag || 'For Sale',
        beds: Number(propertyData.beds) || 1,
        baths: Number(propertyData.baths) || 1,
        garages: Number(propertyData.garages) || 0,
      });
      // Agar purani images hain toh unhein preview mein dikhayein
      const existingImgs = propertyData.images || (propertyData.image ? [propertyData.image] : []);
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
        garages: Number(garagesOptions[0]) || 0,
      });
      setPreviewUrls([]);
      setSelectedFiles([]);
    }
  }, [propertyData, isOpen]);

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
        name === 'beds' || name === 'baths' || name === 'garages'
          ? Number(value)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const cloudName = "y556pcib"; 
      const uploadPreset = "real_estate_albums"; // Cloudinary par yeh unsigned preset lazmi banayein
      const uploadedImageUrls: string[] = [];

      // STEP 1: Agar nayi images select ki hain, toh unhein direct Cloudinary par upload karein
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

      setUploadProgress('Saving property details...');

      // STEP 2: Ab final data aur image URLs (album) ko apne backend API par bhein
      const finalPayload = {
        userId: '1',
        property_title: formData.property_title,
        price: formData.price.replace(/,/g, ''),
        location: formData.location,
        country: formData.country,
        currency: formData.currency,
        category: formData.category,
        status: formData.status,
        tag: formData.tag,
        beds: formData.beds,
        baths: formData.baths,
        garages: formData.garages,
        image: uploadedImageUrls[0] || '', // Pehli image main thumbnail ke tor par
        images: uploadedImageUrls,         // Poora album array
      };

      const url = propertyData?.id ? `/api/properties/${propertyData.id}` : '/api/propertydata';
      const method = propertyData?.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        let errData;
        try {
          errData = await res.json();
        } catch {
          errData = { message: await res.text() || 'Unknown server error' };
        }
        console.error('Server error:', errData);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
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
              {propertyData?.id ? 'Edit Property Album' : 'Add Property & Album'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload multiple photos and fill specifications
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
              Property Album Images (Multiple)
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
              Property Title
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

          {/* Tag & Specs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-1">
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
              {loading ? 'Processing...' : propertyData?.id ? 'Update Property' : 'Save Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
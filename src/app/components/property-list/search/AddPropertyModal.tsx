'use client';

import React, { useState, useEffect } from 'react';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  categories?: string[];
  bedsOptions?: (number | string)[];
  bathsOptions?: (number | string)[];
  garagesOptions?: (number | string)[];
}

export default function AddPropertyModal({
  isOpen,
  onClose,
  onSuccess,
  categories = ['Apartment', 'Villa', 'Commercial', 'House' , 'Office','Shop', 'Warehouse' ],
  bedsOptions = [1, 2, 3, 4, 5, 6],
  bathsOptions = [1, 2, 3, 4, 5,6],
  garagesOptions = [0, 1, 2, 3],
}: AddPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const [formData, setFormData] = useState({
    property_title: '',
    price: '',
    location: '',
    category: categories[0] || 'Apartment',
    status: 'Active',
    tag: 'For Sale',
    beds: Number(bedsOptions[0]) || 1,
    baths: Number(bathsOptions[0]) || 1,
    garages: Number(garagesOptions[0]) || 0,
  });

  // Memory cleanup for image blob URLs
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'beds' || name === 'baths' || name === 'garages'
          ? Number(value)
          : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('userId', '1'); // <--- Yahan userId add kar di hai
      data.append('property_title', formData.property_title);
      data.append('price', formData.price);
      data.append('location', formData.location);
      data.append('category', formData.category);
      data.append('status', formData.status);
      data.append('tag', formData.tag);
      data.append('beds', String(formData.beds));
      data.append('baths', String(formData.baths));
      data.append('garages', String(formData.garages));

      if (selectedFile) {
        data.append('image', selectedFile);
      }

      const res = await fetch('/api/propertydata', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        setFormData({
          property_title: '',
          price: '',
          location: '',
          category: categories[0] || 'Apartment',
          status: 'Active',
          tag: 'For Sale',
          beds: Number(bedsOptions[0]) || 1,
          baths: Number(bathsOptions[0]) || 1,
          garages: Number(garagesOptions[0]) || 0,
        });
        setSelectedFile(null);
        setPreviewUrl('');

        if (onSuccess) onSuccess();
        onClose();
      } else {
        const errData = await res.json();
        console.error('Server error:', errData);
      }
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-semidark rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-dark_border">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-dark_border">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              Add New Property
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Fill in the property specifications below
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
          {/* Image Upload Area */}
          <div>
            <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
              Property Image
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 dark:border-dark_border rounded-xl p-4 text-center hover:border-primary transition-colors bg-gray-50/50 dark:bg-darkmode/50">
                <span className="text-sm text-primary font-medium block">
                  Choose Image File
                </span>
                <span className="text-xs text-gray-400 mt-1 block">
                  PNG, JPG, WEBP up to 10MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            {previewUrl && (
              <div className="mt-3 h-32 w-full relative rounded-xl overflow-hidden border border-gray-200 dark:border-dark_border shadow-inner">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
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

          {/* Price & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Price RS
              </label>
              <input
                required
                type="text"
                name="price"
                placeholder="e.g. 123,113"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                Location
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

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </select>
            </div>
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
              {loading ? 'Adding Property...' : 'Save Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
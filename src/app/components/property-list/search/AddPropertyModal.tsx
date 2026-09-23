'use client';

import React, { useState, useEffect } from 'react';

interface Property {
  id?: string;
  property_title: string;
  description?: string;
  mini_description?: string;
  price: number | string;
  area_size?: string;
  property_type?: string;
  country: string;
  city?: string;
  area?: string;
  location: string;
  pin_location?: string;
  agent_name?: string;
  agent_number?: string;
  currency: string;
  category: string;
  status: string;
  tag: string;
  beds: number;
  baths: number;
  garages: number;
  image?: string | null;
  images?: string[];
}

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  propertyData?: Property | null;
  bedsOptions?: (number | string)[];
  bathsOptions?: (number | string)[];
  garagesOptions?: (number | string)[];
}

const locationData: Record<string, { cities: string[]; areas: Record<string, string[]> }> = {
  "Pakistan": {
    cities: ["Lahore", "Islamabad", "Karachi"],
    areas: {
      "Lahore": ["Gulberg III", "DHA Phase 6", "Bahria Town", "Johar Town", "Cavalry Ground" , "Thokar Niaz Baig"],
      "Islamabad": ["F-7/2", "E-11", "Bahria Town Islamabad", "DHA Phase 2", "Blue Area"],
      "Karachi": ["Clifton", "Defence Phase 5", "Gulshan-e-Iqbal", "PECHS", "North Nazimabad"]
    }
  },
  "United Arab Emirates": {
    cities: ["Dubai", "Abu Dhabi", "Sharjah"],
    areas: {
      "Dubai": ["Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "Business Bay", "JVC"],
      "Abu Dhabi": ["Al Reem Island", "Saadiyat Island", "Corniche Road", "Khalifa City"],
      "Sharjah": ["Al Majaz", "Al Khan", "Muwaileh", "Al Nahda Sharjah"]
    }
  }
};

const categoryMap: Record<string, string[]> = {
  "Residential": ["Apartment", "Villa", "House", "Studio Apartment"],
  "Commercial": ["Commercial Plot", "Office", "Shop", "Warehouse", "Building"]
};

export default function AddPropertyModal({
  isOpen,
  onClose,
  onSuccess,
  propertyData = null,
  bedsOptions = [0, 1, 2, 3, 4, 5, 6],
  bathsOptions = [0, 1, 2, 3, 4, 5, 6],
  garagesOptions = [0, 1, 2, 3],
}: AddPropertyModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    property_title: '',
    description: '',
    mini_description: '',
    price: '',
    area_size: '',
    property_type: 'Residential',
    country: 'Pakistan',
    city: 'Lahore',
    area: 'Gulberg III',
    location: '',
    pin_location: '',
    agent_name: '',
    agent_number: '',
    currency: 'PKR',
    category: 'Apartment',
    status: 'Active',
    tag: 'For Sale',
    beds: 2,
    baths: 2,
    garages: 1,
  });

  useEffect(() => {
    if (propertyData) {
      const propCountry = propertyData.country || 'Pakistan';
      const propType = propertyData.property_type || 'Residential';
      const propCity = propertyData.city || locationData[propCountry]?.cities[0] || '';
      const propArea = propertyData.area || locationData[propCountry]?.areas[propCity]?.[0] || '';

      setFormData({
        property_title: propertyData.property_title || '',
        description: propertyData.description || '',
        mini_description: propertyData.mini_description || '',
        price: propertyData.price ? Number(propertyData.price).toLocaleString() : '',
        area_size: propertyData.area_size || '',
        property_type: propType,
        country: propCountry,
        city: propCity,
        area: propArea,
        location: propertyData.location || '',
        pin_location: propertyData.pin_location || '',
        agent_name: propertyData.agent_name || '',
        agent_number: propertyData.agent_number || '',
        currency: propertyData.currency || (propCountry === 'United Arab Emirates' ? 'AED' : 'PKR'),
        category: propertyData.category || categoryMap[propType][0],
        status: propertyData.status || 'Active',
        tag: propertyData.tag || 'For Sale',
        beds: Number(propertyData.beds) || 1,
        baths: Number(propertyData.baths) || 1,
        garages: Number(propertyData.garages) || 0,
      });

      const existingImgs = propertyData.images || (propertyData.image ? [propertyData.image] : []);
      setPreviewUrls(existingImgs);
    } else {
      setFormData({
        property_title: '',
        description: '',
        mini_description: '',
        price: '',
        area_size: '',
        property_type: 'Residential',
        country: 'Pakistan',
        city: 'Lahore',
        area: 'Gulberg III',
        location: '',
        pin_location: '',
        agent_name: '',
        agent_number: '',
        currency: 'PKR',
        category: 'Apartment',
        status: 'Active',
        tag: 'For Sale',
        beds: 2,
        baths: 2,
        garages: 1,
      });
      setPreviewUrls([]);
      setSelectedFiles([]);
    }
  }, [propertyData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
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
      const firstCity = locationData[value]?.cities[0] || '';
      const firstArea = locationData[value]?.areas[firstCity]?.[0] || '';
      setFormData((prev) => ({
        ...prev,
        country: value,
        currency: newCurrency,
        city: firstCity,
        area: firstArea,
      }));
      return;
    }

    if (name === 'city') {
      const firstArea = locationData[formData.country]?.areas[value]?.[0] || '';
      setFormData((prev) => ({
        ...prev,
        city: value,
        area: firstArea,
      }));
      return;
    }

    if (name === 'property_type') {
      const firstCategory = categoryMap[value][0];
      setFormData((prev) => ({
        ...prev,
        property_type: value,
        category: firstCategory,
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

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setSelectedFiles(fileArray);
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
      const uploadPreset = "real_estate_albums"; 
      const uploadedImageUrls: string[] = [];

      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadProgress(`Uploading image ${i + 1} of ${selectedFiles.length}...`);
          const file = selectedFiles[i];
          const cloudFormData = new FormData();
          cloudFormData.append('file', file);
          cloudFormData.append('upload_preset', uploadPreset);

          const cloudRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: cloudFormData }
          );

          const cloudData = await cloudRes.json();
          if (cloudData.secure_url) {
            uploadedImageUrls.push(cloudData.secure_url);
          }
        }
      } else {
        uploadedImageUrls.push(...previewUrls);
      }

      setUploadProgress('Saving property details...');

      const finalPayload = {
        userId: '1',
        property_title: formData.property_title,
        description: formData.description,
        mini_description: formData.mini_description,
        price: formData.price.replace(/,/g, ''),
        area_size: formData.area_size,
        property_type: formData.property_type,
        country: formData.country,
        city: formData.city,
        area: formData.area,
        location: `${formData.area}, ${formData.city}, ${formData.country}`,
        pin_location: formData.pin_location,
        agent_name: formData.agent_name,
        agent_number: formData.agent_number,
        currency: formData.currency,
        category: formData.category,
        status: formData.status,
        tag: formData.tag,
        beds: formData.property_type === 'Commercial' ? 0 : formData.beds,
        baths: formData.property_type === 'Commercial' ? 0 : formData.baths,
        garages: formData.property_type === 'Commercial' ? 0 : formData.garages,
        image: uploadedImageUrls[0] || '',
        images: uploadedImageUrls,
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
        console.error('Server error during save');
      }
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const availableCities = locationData[formData.country]?.cities || [];
  const availableAreas = locationData[formData.country]?.areas[formData.city] || [];
  const availableCategories = categoryMap[formData.property_type] || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-semidark rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-dark_border">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-dark_border">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              {propertyData?.id ? 'Edit Property Album' : 'Add Property & Album'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Specify complete details, descriptions, agent info, and media album
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
          
          {/* Multiple Image Album Upload */}
          <div>
            <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
              Property Album Images (DLD Image Upload / Gallery)
            </label>
            <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 dark:border-dark_border rounded-xl p-4 text-center hover:border-primary transition-colors bg-gray-50/50 dark:bg-darkmode/50 block">
              <span className="text-sm text-primary font-medium block">Choose Photo Album</span>
              <span className="text-xs text-gray-400 mt-1 block">Select multiple PNG, JPG, WEBP files</span>
              <input type="file" multiple accept="image/*" onChange={handleImagesChange} className="hidden" />
            </label>

            {previewUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-gray-200 dark:border-dark_border rounded-xl">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="h-20 relative rounded-lg overflow-hidden border shadow-sm">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Property Title</label>
            <input
              required
              type="text"
              name="property_title"
              placeholder="e.g. Modern Luxury Villa in Gulberg"
              value={formData.property_title}
              onChange={handleChange}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Mini Description (~25 words) */}
          <div>
            <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
              Mini Description <span className="text-xs font-normal text-gray-400">(Short overview, approx. 25 words)</span>
            </label>
            <input
              type="text"
              name="mini_description"
              placeholder="e.g. Experience luxury living in this brand new 3-bedroom apartment featuring modern amenities and panoramic city views."
              value={formData.mini_description}
              onChange={handleChange}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Detailed Description (500+ words) */}
          <div>
            <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
              Detailed Description <span className="text-xs font-normal text-gray-400">(Comprehensive details, up to 500+ words)</span>
            </label>
            <textarea
              rows={5}
              name="description"
              placeholder="Provide full details about features, amenities, nearby locations, and specifications..."
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Property Type & Tag */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Property Type</label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Listing Purpose (Tag)</label>
              <select
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
                 <option value="Sold Out">Sold Out</option>
                <option value="Off Plan">Off Plan</option>
              </select>
            </div>
          </div>

          {/* Country, City & Area Hierarchy */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Country</label>
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
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">City</label>
              <select
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {availableCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Area</label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {availableAreas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pin Location URL / Google Maps Link */}
          <div>
            <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Pin Location (Google Maps Link / Coordinates)</label>
            <input
              type="text"
              name="pin_location"
              placeholder="e.g. https://maps.google.com/?q=31.5204,74.3587"
              value={formData.pin_location}
              onChange={handleChange}
              className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Agent Name & Agent Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Agent Name</label>
              <input
                type="text"
                name="agent_name"
                placeholder="e.g. Muhammad Ali"
                value={formData.agent_name}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Agent Number</label>
              <input
                type="text"
                name="agent_number"
                placeholder="e.g. +92 300 1234567"
                value={formData.agent_number}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {/* Price, Sq Ft & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Price ({formData.currency})</label>
              <input
                required
                type="text"
                name="price"
                placeholder="e.g. 15,000,000"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Area Size (Sq Ft)</label>
              <input
                type="number"
                name="area_size"
                placeholder="e.g. 1200"
                value={formData.area_size}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2.5 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Specs (Hidden for Commercial Properties) */}
          <div className={`grid grid-cols-1 gap-3 ${formData.property_type === 'Commercial' ? 'md:grid-cols-1' : 'md:grid-cols-4'}`}>
            <div>
              <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                 <option value="Sold Out">Sold Out</option>
              </select>
            </div>

            {formData.property_type !== 'Commercial' && (
              <>
                <div>
                  <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Beds</label>
                  <select
                    name="beds"
                    value={formData.beds}
                    onChange={handleChange}
                    className="w-full p-2 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {bedsOptions.map((bed) => (
                      <option key={bed} value={bed}>{bed}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Baths</label>
                  <select
                    name="baths"
                    value={formData.baths}
                    onChange={handleChange}
                    className="w-full p-2 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {bathsOptions.map((bath) => (
                      <option key={bath} value={bath}>{bath}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">Garages</label>
                  <select
                    name="garages"
                    value={formData.garages}
                    onChange={handleChange}
                    className="w-full p-2 text-sm border rounded-lg dark:bg-darkmode dark:border-dark_border focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    {garagesOptions.map((garage) => (
                      <option key={garage} value={garage}>{garage}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

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
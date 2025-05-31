import { useState } from 'react';

export default function ModelBasicInfo({ modelData, updateModelData, onNext, onCancel }) {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateModelData({ [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    
    if (!modelData.name.trim()) {
      newErrors.name = 'Model name is required';
    } else if (modelData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    
    if (!modelData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Model Name</label>
          <input
            type="text"
            name="name"
            value={modelData.name}
            onChange={handleChange}
            className={`w-full p-2 bg-gray-700 rounded border ${errors.name ? 'border-red-500' : 'border-gray-600'}`}
            placeholder="e.g. ImageClassifier-V1"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        <div className="mb-6">
          <label className="block mb-2">Description</label>
          <textarea
            name="description"
            value={modelData.description}
            onChange={handleChange}
            className={`w-full p-2 bg-gray-700 rounded border ${errors.description ? 'border-red-500' : 'border-gray-600'}`}
            rows="4"
            placeholder="Describe your model's purpose and capabilities"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
} 
"use client";
import { useState, useRef } from 'react';
import { uploadToCloudinary } from '@/app/utils/cloudinary';
import { FaCloudUploadAlt, FaSpinner, FaCheck, FaTimes, FaFile, FaFileImage, FaFilePdf, FaFileWord, FaFileExcel, FaFileUpload } from 'react-icons/fa';

const FileUpload = ({ department, onUploadComplete, disabled = false }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadError('');
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError('');
      
      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file, `clearance_docs/${department}`);
      
      // Call the callback with the result
      if (onUploadComplete) {
        onUploadComplete(department, uploadResult);
      }
      
      setUploadSuccess(true);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <FaFile className="text-gray-400" />;
    
    const fileType = file.type;
    if (fileType.includes('image')) {
      return <FaFileImage className="text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FaFilePdf className="text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FaFileWord className="text-blue-700" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FaFileExcel className="text-green-600" />;
    }
    
    return <FaFile className="text-gray-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-200">
      <div className="flex flex-col space-y-2">
        {uploadSuccess && (
          <div className="flex items-center text-green-600 text-xs bg-green-50 p-1 rounded">
            <FaCheck className="mr-1 text-xs" />
            <span>Uploaded</span>
          </div>
        )}
        
        <div className="relative border border-dashed border-gray-300 rounded-md p-3 flex flex-col items-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading || disabled}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
          
          <div className="flex flex-col items-center text-center">
            {file ? (
              <div className="flex items-center">
                {getFileIcon()}
                <span className="ml-2 text-xs font-medium text-gray-700 truncate max-w-[120px]">
                  {file.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <FaCloudUploadAlt className="text-blue-500 text-lg" />
                <span className="ml-1 text-xs text-gray-600 font-medium">
                  Upload {department.replace(/_/g, ' ')} Document
                </span>
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              {file ? 'Ready to upload' : 'PDF, Word, Excel, Images'}
            </p>
          </div>
        </div>
        
        {uploadError && (
          <div className="flex items-center text-red-500 text-xs bg-red-50 p-1 rounded">
            <FaTimes className="mr-1 text-xs" />
            <span>{uploadError}</span>
          </div>
        )}
        
        {file && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading || disabled}
            className={`w-full py-1.5 px-3 rounded-md flex items-center justify-center text-xs font-medium ${
              disabled
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUploading ? (
              <>
                <FaSpinner className="animate-spin mr-1 text-xs" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <FaFileUpload className="mr-1 text-xs" />
                <span>Upload</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FileUpload;

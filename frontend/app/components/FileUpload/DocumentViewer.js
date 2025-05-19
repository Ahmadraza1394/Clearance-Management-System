"use client";
import { useState } from 'react';
import { FaFile, FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaEye, FaDownload, FaTrash, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import Image from 'next/image';

const DocumentViewer = ({ documents = [], department = '', onDelete, readOnly = false }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getFileIcon = (fileType) => {
    if (!fileType) return <FaFile className="text-gray-500 text-xs" />;
    
    if (fileType.includes('pdf')) {
      return <FaFilePdf className="text-red-500 text-xs" />;
    } else if (fileType.includes('image')) {
      return <FaFileImage className="text-blue-500 text-xs" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FaFileWord className="text-blue-700 text-xs" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('xls')) {
      return <FaFileExcel className="text-green-700 text-xs" />;
    } else {
      return <FaFile className="text-gray-500 text-xs" />;
    }
  };

  const handleView = (url) => {
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewUrl(null);
  };

  const handleDelete = async (document) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setIsDeleting(true);
      try {
        // Use the publicId directly if available in the document object
        let publicId;
        
        if (document.publicId) {
          // If document has a publicId property, use it directly
          publicId = document.publicId;
        } else {
          // Extract the public ID from the Cloudinary URL
          // Format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
          const urlParts = document.url.split('/');
          // Get the filename with extension
          const filenameWithExt = urlParts[urlParts.length - 1];
          // Remove the extension
          const filename = filenameWithExt.split('.')[0];
          
          // Determine the folder path if any
          const uploadIndex = urlParts.indexOf('upload');
          let folderPath = '';
          
          if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length - 1) {
            // Collect all path segments between 'upload' and the filename
            const folderSegments = urlParts.slice(uploadIndex + 2, urlParts.length - 1);
            folderPath = folderSegments.join('/') + '/';
          }
          
          // Combine folder path and filename to get the complete public ID
          publicId = folderPath + filename;
        }
        
        console.log('Deleting Cloudinary file with public ID:', publicId);
        
        // Call the delete API
        const response = await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ publicId }),
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          console.log('Successfully deleted file from Cloudinary');
          // Call the onDelete callback with the document ID
          onDelete(department, document.id);
        } else {
          console.error('Failed to delete file from Cloudinary:', result.error || 'Unknown error');
          // Still remove from local storage even if Cloudinary deletion fails
          // This ensures the UI is updated even if there's an issue with Cloudinary
          onDelete(department, document.id);
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        // Still remove from local storage even if there's an exception
        onDelete(department, document.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleDownload = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'document';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getFileType = (url) => {
    if (/\.(jpe?g|png|gif|bmp|webp)/i.test(url)) {
      return 'image';
    } else if (/\.pdf/i.test(url)) {
      return 'pdf';
    } else if (/\.(doc|docx)/i.test(url)) {
      return 'word';
    } else if (/\.(xls|xlsx)/i.test(url)) {
      return 'excel';
    } else {
      return 'other';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-2">
      {documents.length === 0 ? (
        <div className="text-center py-2 bg-gray-50 rounded-md border border-gray-200">
          <FaFile className="mx-auto text-gray-400 text-sm mb-1" />
          <p className="text-xs text-gray-500">No documents uploaded</p>
        </div>
      ) : (
        <div className="space-y-1">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-2">
                {getFileIcon(doc.fileType)}
                <div>
                  <h4 className="text-xs font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[150px] md:max-w-[200px]">
                    {doc.name || 'Document'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {formatDate(doc.uploaded_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-1">
                <button
                  onClick={() => handleView(doc.url)}
                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                  title="View Document"
                >
                  <FaEye className="text-xs" />
                </button>
                
                <button
                  onClick={() => handleDownload(doc.url, doc.name)}
                  className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                  title="Download Document"
                >
                  <FaDownload className="text-xs" />
                </button>
                
                {onDelete && (
                  <button
                    onClick={() => handleDelete(doc)}
                    disabled={isDeleting}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Document"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-75 flex items-center justify-center p-2 sm:p-4">
          {/* Close button positioned absolutely in the top-right corner */}
          <button
            onClick={handleClosePreview}
            className="absolute top-4 right-4 p-3 rounded-full bg-white text-gray-800 hover:bg-gray-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-[60] transition-all duration-200 transform hover:scale-110"
            aria-label="Close preview"
          >
            <FaTimes className="text-xl" />
          </button>
          
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col relative">
            <div className="flex items-center justify-between p-2 sm:p-4 border-b">
              <h3 className="text-sm sm:text-lg font-medium">Document Preview</h3>
            </div>
            
            <div className="flex-1 overflow-auto p-2 sm:p-4">
              {previewUrl && (() => {
                const fileType = getFileType(previewUrl);
                
                switch (fileType) {
                  case 'image':
                    return (
                      <div className="flex justify-center">
                        <Image 
                          src={previewUrl} 
                          alt="Document Preview" 
                          width={600} 
                          height={800} 
                          className="max-h-[70vh] object-contain"
                          unoptimized={true} /* For external URLs like Cloudinary */
                        />
                      </div>
                    );
                    
                  case 'pdf':
                    // Use Google Docs Viewer for PDFs for better compatibility
                    const pdfViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`;
                    return (
                      <div className="h-[70vh] w-full">
                        <iframe 
                          src={pdfViewerUrl}
                          title="PDF Document" 
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin allow-popups"
                        />
                        <div className="mt-2 text-center">
                          <p className="text-xs text-gray-500 mb-2">If the PDF doesn't load properly:</p>
                          <a 
                            href={previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <FaDownload className="mr-1" />
                            Download PDF
                          </a>
                        </div>
                      </div>
                    );
                    
                  case 'word':
                  case 'excel':
                    // Use Google Docs Viewer for Office documents
                    const docViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`;
                    return (
                      <div className="h-[70vh] w-full">
                        <iframe 
                          src={docViewerUrl}
                          title="Office Document" 
                          className="w-full h-full border-0"
                          sandbox="allow-scripts allow-same-origin allow-popups"
                        />
                        <div className="mt-2 text-center">
                          <p className="text-xs text-gray-500 mb-2">If the document doesn't load properly:</p>
                          <a 
                            href={previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <FaDownload className="mr-1" />
                            Download Document
                          </a>
                        </div>
                      </div>
                    );
                    
                  default:
                    return (
                      <div className="text-center py-4 sm:py-8">
                        <FaFile className="mx-auto text-gray-400 text-3xl sm:text-5xl mb-2 sm:mb-4" />
                        <p className="text-gray-700 mb-2 text-sm sm:text-base">This document type cannot be previewed in the browser</p>
                        <div className="flex justify-center space-x-3">
                          <a 
                            href={previewUrl} 
                            download
                            className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <FaDownload className="mr-1 sm:mr-2" />
                            Download
                          </a>
                          <a 
                            href={previewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <FaExternalLinkAlt className="mr-1 sm:mr-2" />
                            Open in New Tab
                          </a>
                        </div>
                      </div>
                    );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;

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
        // Skip Cloudinary deletion if we're in a deployed environment without Cloudinary config
        // or if the document doesn't have a valid URL
        const isCloudinaryUrl = document.url && document.url.includes('cloudinary.com');
        
        if (isCloudinaryUrl) {
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
            
            console.log('Attempting to delete Cloudinary file with public ID:', publicId);
            
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
            } else {
              console.log('Cloudinary deletion skipped or failed, continuing with local deletion');
            }
          } catch (cloudinaryError) {
            console.log('Cloudinary deletion error, continuing with local deletion:', cloudinaryError);
          }
        } else {
          console.log('Not a Cloudinary URL or missing URL, skipping Cloudinary deletion');
        }
        
        // Always remove from local storage regardless of Cloudinary deletion result
        // This ensures the UI is updated even if there's an issue with Cloudinary
        onDelete(department, document.id);
      } catch (error) {
        console.error('Error in delete process:', error);
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

  const safeDocuments = documents.map((document, index) => {
    return {
      id: document.id || `doc-${index}`,
      url: document.url || '',
      name: document.name || `Document ${index + 1}`,
      uploaded_at: document.uploaded_at || new Date().toISOString(),
      ...document
    };
  });

  return (
    <div>
      {safeDocuments.length > 0 ? (
        <div className="space-y-2">
          {safeDocuments.map((document, index) => (
            <div
              key={document.id || index}
              className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between p-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  {getFileIcon(getFileType(document.url))}
                  <div>
                    <p className="text-xs font-medium text-gray-700 truncate">
                      {document.name}
                    </p>
                    {document.uploaded_at && (
                      <p className="text-xs text-gray-500">
                        {formatDate(document.uploaded_at)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex space-x-1">
                  {/* Always show view button */}
                  <button
                    type="button"
                    onClick={() => document.url ? handleView(document.url) : alert('Document URL not available')}
                    className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="View Document"
                  >
                    <FaEye className="text-xs" />
                  </button>

                  {/* Always show download button */}
                  <button
                    type="button"
                    onClick={() => document.url ? handleDownload(document.url, document.name) : alert('Document URL not available')}
                    className="p-1 text-green-600 hover:text-green-800 transition-colors"
                    title="Download Document"
                  >
                    <FaDownload className="text-xs" />
                  </button>

                  {/* Always show delete button if not in read-only mode */}
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => handleDelete(document)}
                      disabled={isDeleting}
                      className={`p-1 ${isDeleting ? 'text-gray-400' : 'text-red-600 hover:text-red-800'} transition-colors`}
                      title="Delete Document"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 bg-gray-50 border border-dashed border-gray-300 rounded-md">
          <p className="text-xs text-gray-500">No documents uploaded yet</p>
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

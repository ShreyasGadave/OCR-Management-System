          
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, XCircle, Loader, FileJson, AlertTriangle } from 'lucide-react';

// Helper function to convert a file to a base64 string
const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

const Drop = () => {
    const [file, setFile] = useState(null);
    const [extractedText, setExtractedText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles[0]) {
            setFile(acceptedFiles[0]);
            setExtractedText("");
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpeg', '.jpg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
        },
        multiple: false,
    });
    
    const handleRemoveFile = () => {
        setFile(null);
        setExtractedText("");
        setError(null);
    };

    const handleExtractText = async () => {
        if (!file) {
            setError("Please upload a file first!");
            return;
        }

        setLoading(true);
        setExtractedText("");
        setError(null);

        try {
            const base64Data = await fileToBase64(file);
            const apiKey = ""; // API key is handled by the environment, leave it empty.
             const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=AIzaSyDC6eN-YsBvJBci74CHUkpDoO9k8GjTNDU`;       
            const prompt = `Extract all text from the document. If it is a certificate, extract the key information into a structured JSON object with keys such as "document_type", "certificate_title", "issuing_organization", "recipient_name", "achievement", "certification_date", and "certificate_id". If there's a signer, include a "signer" object with "name" and "title". For other document types like invoices or business cards, create a relevant JSON structure. For all other images or general documents, return the raw extracted text. Do not wrap the JSON output in markdown backticks.`;

            const payload = {
                contents: [ { parts: [ { text: prompt }, { inlineData: { mimeType: file.type, data: base64Data } } ] } ],
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`API Error: ${errorBody.error?.message || response.statusText}`);
            }

            const result = await response.json();
            
            if (result.candidates?.[0]?.finishReason === 'SAFETY') {
                 throw new Error("Content was blocked due to safety concerns. Please try a different file.");
            }
            
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                const cleanedText = text.replace(/^```json\s*|```\s*$/g, '').trim();
                 try {
                    // Try to parse and re-stringify for pretty printing
                    const jsonObject = JSON.parse(cleanedText);
                    setExtractedText(JSON.stringify(jsonObject, null, 2));
                } catch (e) {
                    // If it's not JSON, just set the cleaned text
                    setExtractedText(cleanedText);
                }
            } else {
                throw new Error("No text could be extracted from the file. The API response might be empty.");
            }

        } catch (err) {
            console.error("Extraction error:", err);
            setError(err.message || "An unexpected error occurred during extraction.");
        } finally {
            setLoading(false);
        }
    };

    const isJsonString = (str) => {
        if (!str || str.trim() === '') return false;
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };

    const isJson = isJsonString(extractedText);

    return (
        <div className="min-h-screen bg-black font-sans text-gray-300">
            <main className="flex flex-col items-center p-4 sm:p-6 md:p-10">
                <div className="w-full max-w-3xl rounded-2xl shadow-2xl p-6 md:p-8 transform transition-all duration-500">
                  <div className="text-center mb-8">
  <h2 className="text-3xl font-bold text-gray-100 sm:text-4xl">
    Unlock Insights from Your Documents
  </h2>
  <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
    Upload PDFs, images, or scanned files and let our AI-powered OCR system 
    instantly extract text with high accuracy. Transform unstructured data 
    into searchable, editable, and organized information — all in seconds.
  </p>
</div>


                    {!file && (
                        <div
                            {...getRootProps()}
                            className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl p-12 cursor-pointer transition-all duration-300 ease-in-out ${
                                isDragActive ? "border-indigo-500 bg-gray-800 scale-105" : "border-gray-600 bg-gray-800/50 hover:border-indigo-500"
                            }`}
                        >
                            <input {...getInputProps()} />
                            <div className="text-center">
                          
                                <Upload strokeWidth={1} className="mx-auto h-12 w-12 text-gray-500" />
                                <p className="mt-2 font-medium text-indigo-400">
                                    {isDragActive ? "Drop it like it's hot!" : "Click to upload or drag & drop"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, or WEBP</p>
                            </div>
                        </div>
                    )}

                    {file && (
                        <div className="animate-fade-in-up mt-4 flex items-center justify-between gap-3 p-4 border border-gray-700 rounded-xl bg-gray-800 shadow-sm">
                            <div className="flex items-center gap-3 overflow-hidden">
                               <FileText className="w-6 h-6 text-gray-400 flex-shrink-0" />
                               <span className="text-gray-200 font-medium truncate" title={file.name}>{file.name}</span>
                            </div>
                            <button onClick={handleRemoveFile} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-900/30 rounded-full transition-colors duration-200">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleExtractText}
                        disabled={loading || !file}
                        className="mt-6 w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {loading ? ( <><Loader className="animate-spin w-5 h-5" /> Analyzing Document...</> ) : "🚀 Extract Text"}
                    </button>

                    {error && (
                        <div className="animate-fade-in-up mt-6 flex items-start space-x-3 p-4 border-l-4 border-red-500 bg-red-900/30 text-red-300 rounded-lg shadow-md">
                            <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0"/>
                            <div>
                                <p className="font-bold">An Error Occurred</p>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {extractedText && (
                        <div className="animate-fade-in-up mt-8">
                             <h3 className="flex items-center gap-2 font-medium text-xl text-gray-200 mb-4">
                                Extracted Content
                            </h3>
                            <div className="bg-[#1e1e1e] rounded-lg shadow-2xl overflow-hidden border border-gray-700/10">
                                <div className="bg-gray-700 flex items-center p-2.5">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <p className="text-center text-sm font-medium text-gray-300 flex-grow -ml-10">Edit your Data</p>
                                </div>
                                
                                <textarea
                                    value={extractedText}
                                    onChange={(e) => setExtractedText(e.target.value)}
                                    className="w-full h-96 bg-[#1e1e1e]   focus:outline-none focus:ring-0 text-green-50 p-4 font-sans text-sm border-none resize-none selection:bg-yellow-200/20"
                                    spellCheck="false"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        
        </div>
    );
};

export default Drop;


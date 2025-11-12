"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { VISA_CONFIG } from "@/lib/config"
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react"

interface EvaluationFormProps {
    onSubmit: (formData: any) => void
    isLoading: boolean
}

export function EvaluationForm({ onSubmit, isLoading }: EvaluationFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        country: "",
        visaType: "",
    })

    const [uploadedDocuments, setUploadedDocuments] = useState<
        { id: string; name: string; fileName: string; type: "required" | "optional" }[]
    >([])
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [dragActive, setDragActive] = useState(false)

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}
        if (!formData.name.trim()) newErrors.name = "Name is required"
        if (!formData.email.trim()) newErrors.email = "Email is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
        if (!formData.country) newErrors.country = "Country is required"
        if (!formData.visaType) newErrors.visaType = "Visa type is required"

        // Check required documents
        const visaConfig = VISA_CONFIG[formData.country as keyof typeof VISA_CONFIG]
        const selectedVisa = (visaConfig?.visas as any)?.[formData.visaType]
        const requiredCount = selectedVisa?.requiredDocuments?.length || 0
        const uploadedRequired = uploadedDocuments.filter((d) => d.type === "required").length

        if (uploadedRequired === 0 && requiredCount > 0) {
            newErrors.documents = "Upload at least one required document"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleCountryChange = (country: string) => {
        setFormData({ ...formData, country, visaType: "" })
    }

    const handleFileUpload = (files: FileList | null, docType: "required" | "optional", docName?: string) => {
        if (!files) return

        const newDocs = Array.from(files).map((file) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: docName || file.name.split(".")[0],
            fileName: file.name,
            type: docType,
        }))

        setUploadedDocuments([...uploadedDocuments, ...newDocs])
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent, docType: "required" | "optional") => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        handleFileUpload(e.dataTransfer.files, docType)
    }

    const removeDocument = (id: string) => {
        setUploadedDocuments(uploadedDocuments.filter((doc) => doc.id !== id))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            onSubmit({
                ...formData,
                uploadedDocuments,
            })
        }
    }

    const selectedCountryConfig = formData.country ? VISA_CONFIG[formData.country as keyof typeof VISA_CONFIG] : null
    const selectedVisa = formData.visaType ? (selectedCountryConfig?.visas as any)?.[formData.visaType] : null

    const requiredDocs = selectedVisa?.requiredDocuments || []
    const optionalDocs = selectedVisa?.optionalDocuments || []
    const uploadedRequired = uploadedDocuments.filter((d) => d.type === "required")
    const uploadedOptional = uploadedDocuments.filter((d) => d.type === "optional")

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card className="p-6 border-0 shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-primary">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground">Full Name</label>
                        <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className={`border-2 ${errors.name ? "border-destructive" : "border-gray-200"}`}
                        />
                        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground">Email Address</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john@example.com"
                            className={`border-2 ${errors.email ? "border-destructive" : "border-gray-200"}`}
                        />
                        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
                    </div>
                </div>
            </Card>

            {/* Visa Selection */}
            <Card className="p-6 border-0 shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-primary">Visa Selection</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-2 text-foreground">Country</label>
                        <select
                            value={formData.country}
                            onChange={(e) => handleCountryChange(e.target.value)}
                            className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${errors.country ? "border-destructive" : "border-gray-200 focus:border-primary"
                                }`}
                        >
                            <option value="">Select a country</option>
                            {Object.entries(VISA_CONFIG).map(([key, value]) => (
                                <option key={key} value={key}>
                                    {value.name}
                                </option>
                            ))}
                        </select>
                        {errors.country && <p className="text-destructive text-sm mt-1">{errors.country}</p>}
                    </div>

                    {selectedCountryConfig && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold mb-2 text-foreground">Visa Type</label>
                                <select
                                    value={formData.visaType}
                                    onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                                    className={`w-full px-4 py-2 border-2 rounded-lg transition-colors ${errors.visaType ? "border-destructive" : "border-gray-200 focus:border-primary"
                                        }`}
                                >
                                    <option value="">Select visa type</option>
                                    {Object.entries(selectedCountryConfig.visas).map(([key, visa]: [string, any]) => (
                                        <option key={key} value={key}>
                                            {visa.displayName}
                                        </option>
                                    ))}
                                </select>
                                {errors.visaType && <p className="text-destructive text-sm mt-1">{errors.visaType}</p>}
                            </div>

                            {selectedVisa && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Processing Time</p>
                                            <p className="text-sm font-bold text-primary">{selectedVisa.processingTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Success Rate</p>
                                            <p className="text-sm font-bold text-primary">{selectedVisa.successRate}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Required Docs</p>
                                            <p className="text-sm font-bold text-primary">{requiredDocs.length}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold">Optional Docs</p>
                                            <p className="text-sm font-bold text-primary">{optionalDocs.length}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Card>

            {/* Document Upload */}
            {selectedVisa && (
                <Card className="p-6 border-0 shadow-md">
                    <h2 className="text-2xl font-bold mb-6 text-primary">Document Upload</h2>

                    {/* Required Documents */}
                    {requiredDocs.length > 0 && (
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <h3 className="text-lg font-bold text-foreground">Required Documents</h3>
                                <span className="text-sm text-muted-foreground">
                                    ({uploadedRequired.length}/{requiredDocs.length})
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                {requiredDocs.map((doc: string) => (
                                    <div
                                        key={doc}
                                        onDragEnter={handleDrag as (e: React.DragEvent<HTMLDivElement>) => void}
                                        onDragLeave={handleDrag as (e: React.DragEvent<HTMLDivElement>) => void}
                                        onDragOver={handleDrag as (e: React.DragEvent<HTMLDivElement>) => void}
                                        onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e, "required")}
                                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
                                            }`}
                                    >
                                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm font-semibold text-foreground">{doc}</p>
                                        <p className="text-xs text-muted-foreground">Drag and drop or click to upload</p>
                                        <input
                                            type="file"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e.target.files, "required", doc)}
                                            className="hidden"
                                            id={`required-${doc}`}
                                        />
                                        <label htmlFor={`required-${doc}`} className="absolute inset-0 cursor-pointer" />
                                    </div>
                                ))}
                            </div>

                            {/* Uploaded Required Documents */}
                            {uploadedRequired.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-semibold text-green-700 mb-2">Uploaded:</p>
                                    <div className="space-y-2">
                                        {uploadedRequired.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm text-foreground">{doc.fileName}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(doc.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Optional Documents */}
                    {optionalDocs.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-blue-500" />
                                <h3 className="text-lg font-bold text-foreground">Optional Documents</h3>
                                <span className="text-sm text-muted-foreground">
                                    ({uploadedOptional.length}/{optionalDocs.length})
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                {optionalDocs.map((doc: string) => (
                                    <div
                                        key={doc}
                                        onDragEnter={handleDrag as (e: React.DragEvent<HTMLDivElement>) => void}
                                        onDragLeave={handleDrag as (e: React.DragEvent<HTMLDivElement>) => void}
                                        onDragOver={handleDrag as (e: React.DragEvent<HTMLDivElement>) => void}
                                        onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e, "optional")}
                                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary"
                                            }`}
                                    >
                                        <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                        <p className="text-sm font-semibold text-foreground">{doc}</p>
                                        <p className="text-xs text-muted-foreground">Optional - Strengthens application</p>
                                        <input
                                            type="file"
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e.target.files, "optional", doc)}
                                            className="hidden"
                                            id={`optional-${doc}`}
                                        />
                                        <label htmlFor={`optional-${doc}`} className="absolute inset-0 cursor-pointer" />
                                    </div>
                                ))}
                            </div>

                            {/* Uploaded Optional Documents */}
                            {uploadedOptional.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-blue-700 mb-2">Uploaded:</p>
                                    <div className="space-y-2">
                                        {uploadedOptional.map((doc) => (
                                            <div key={doc.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm text-foreground">{doc.fileName}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(doc.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {errors.documents && <p className="text-destructive text-sm mt-4">{errors.documents}</p>}
                </Card>
            )}

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 text-base"
            >
                {isLoading ? "Evaluating..." : "Get Visa Evaluation"}
            </Button>
        </form>
    )
}

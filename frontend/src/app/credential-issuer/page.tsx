'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { NetworkStatus } from '@/components/NetworkStatus';
import { useAnonIdContract } from '@/hooks/useAnonIdContract';
import { isContractConfigured } from '@/lib/wagmi';
import { generateCommitment, generateSalt } from '@/lib/commitmentUtils';
import { getAllCredentialTypes, renderCredentialIcon } from '@/lib/credentialTypes';

// Define credential type interfaces
interface BaseCredentialData {
  type: string;
  holderName: string;
  holderEmail?: string;
  issuerName: string;
  description?: string;
  validUntil?: string;
  issuedAt: string;
  issuerAddress: string;
}

interface EducationCredentialData extends BaseCredentialData {
  institutionName: string;
  degree: string;
  fieldOfStudy: string;
  graduationDate: string;
  gpa?: string;
  honors?: string;
}

interface GovernmentCredentialData extends BaseCredentialData {
  documentType: string;
  documentNumber: string;
  issuingAuthority: string;
  nationality?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
}

interface ProfessionalCredentialData extends BaseCredentialData {
  companyName: string;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  endDate?: string;
  skills?: string[];
  certificationBody?: string;
}

interface HealthcareCredentialData extends BaseCredentialData {
  medicalLicenseNumber?: string;
  specialization?: string;
  issuingMedicalBoard?: string;
  practiceLocation?: string;
  certificationDate: string;
  renewalDate?: string;
}

interface FinancialCredentialData extends BaseCredentialData {
  accountType: string;
  bankName: string;
  accountStatus: string;
  creditScore?: string;
  verificationDate: string;
  kycLevel?: string;
}

interface AgeCredentialData extends BaseCredentialData {
  dateOfBirth: string;
  ageVerified: number;
  verificationMethod: string;
  documentType: string;
  documentNumber?: string;
}

type CredentialData = 
  | EducationCredentialData 
  | GovernmentCredentialData 
  | ProfessionalCredentialData 
  | HealthcareCredentialData 
  | FinancialCredentialData 
  | AgeCredentialData 
  | BaseCredentialData;

export default function CredentialIssuerPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { issueCredential, isPending, isConfirmed, error } = useAnonIdContract();

  const [selectedType, setSelectedType] = useState('education');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const credentialTypes = getAllCredentialTypes();

  // Handle transaction completion
  useEffect(() => {
    if (isConfirmed) {
      alert('Credential issued successfully!');
      setFormData({});
      setIsSubmitting(false);
    }
    if (error) {
      console.error('Transaction error:', error);
      alert('Failed to issue credential: ' + error.message);
      setIsSubmitting(false);
    }
  }, [isConfirmed, error]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (newType: string) => {
    setSelectedType(newType);
    setFormData({}); // Reset form data when type changes
  };

  const validateForm = (): boolean => {
    const requiredFields = getRequiredFields(selectedType);
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        alert(`Please fill in the required field: ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const getRequiredFields = (type: string): string[] => {
    const baseFields = ['holderName', 'issuerName'];
    
    switch (type) {
      case 'education':
        return [...baseFields, 'institutionName', 'degree', 'fieldOfStudy', 'graduationDate'];
      case 'government':
        return [...baseFields, 'documentType', 'documentNumber', 'issuingAuthority'];
      case 'professional':
        return [...baseFields, 'companyName', 'jobTitle', 'employmentType', 'startDate'];
      case 'healthcare':
        return [...baseFields, 'specialization', 'certificationDate'];
      case 'financial':
        return [...baseFields, 'accountType', 'bankName', 'accountStatus', 'verificationDate'];
      case 'age':
        return [...baseFields, 'dateOfBirth', 'verificationMethod', 'documentType'];
      default:
        return baseFields;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isContractConfigured()) {
      alert('Contract address not configured. Please deploy the AnonID contract and update the NEXT_PUBLIC_ANON_ID_CONTRACT_ADDRESS environment variable.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create credential data based on type
      const baseData = {
        type: selectedType,
        issuedAt: new Date().toISOString(),
        issuerAddress: address,
        ...formData
      };

      const credentialData = JSON.stringify(baseData);

      // Generate salt and commitment
      const salt = generateSalt();
      const commitment = generateCommitment(credentialData, salt);
      
      console.log('Issuing credential:', {
        commitment,
        credentialData: JSON.parse(credentialData)
      });
      
      // Issue credential on blockchain
      issueCredential(commitment);
      
    } catch (err) {
      console.error('Failed to issue credential:', err);
      setIsSubmitting(false);
      alert('Failed to generate credential commitment: ' + (err as Error).message);
    }
  };

  // Render form fields based on credential type
  const renderTypeSpecificFields = () => {
    const currentType = credentialTypes.find(t => t.type === selectedType);
    
    switch (selectedType) {
      case 'education':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Institution Name *
                </label>
                <input
                  type="text"
                  value={formData.institutionName || ''}
                  onChange={(e) => handleInputChange('institutionName', e.target.value)}
                  placeholder="University/School name"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Degree/Certificate *
                </label>
                <input
                  type="text"
                  value={formData.degree || ''}
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  placeholder="Bachelor's, Master's, PhD, etc."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Field of Study *
                </label>
                <input
                  type="text"
                  value={formData.fieldOfStudy || ''}
                  onChange={(e) => handleInputChange('fieldOfStudy', e.target.value)}
                  placeholder="Computer Science, Medicine, etc."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Graduation Date *
                </label>
                <input
                  type="date"
                  value={formData.graduationDate || ''}
                  onChange={(e) => handleInputChange('graduationDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  GPA (Optional)
                </label>
                <input
                  type="text"
                  value={formData.gpa || ''}
                  onChange={(e) => handleInputChange('gpa', e.target.value)}
                  placeholder="3.8/4.0"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Honors (Optional)
                </label>
                <input
                  type="text"
                  value={formData.honors || ''}
                  onChange={(e) => handleInputChange('honors', e.target.value)}
                  placeholder="Magna Cum Laude, Dean's List, etc."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );

      case 'government':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Document Type *
                </label>
                <select
                  value={formData.documentType || ''}
                  onChange={(e) => handleInputChange('documentType', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  required
                >
                  <option value="">Select document type</option>
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="social_security">Social Security</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Document Number *
                </label>
                <input
                  type="text"
                  value={formData.documentNumber || ''}
                  onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                  placeholder="Document identification number"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Issuing Authority *
                </label>
                <input
                  type="text"
                  value={formData.issuingAuthority || ''}
                  onChange={(e) => handleInputChange('issuingAuthority', e.target.value)}
                  placeholder="Government department/agency"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nationality (Optional)
                </label>
                <input
                  type="text"
                  value={formData.nationality || ''}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="Country of citizenship"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Place of Birth (Optional)
                </label>
                <input
                  type="text"
                  value={formData.placeOfBirth || ''}
                  onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );

      case 'professional':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Organization/Company name"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.jobTitle || ''}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  placeholder="Position/Role title"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Employment Type *
                </label>
                <select
                  value={formData.employmentType || ''}
                  onChange={(e) => handleInputChange('employmentType', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                >
                  <option value="">Select employment type</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                  <option value="volunteer">Volunteer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate || ''}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.endDate || ''}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Certification Body (Optional)
                </label>
                <input
                  type="text"
                  value={formData.certificationBody || ''}
                  onChange={(e) => handleInputChange('certificationBody', e.target.value)}
                  placeholder="Professional certification authority"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Skills (Optional)
              </label>
              <input
                type="text"
                value={formData.skills || ''}
                onChange={(e) => handleInputChange('skills', e.target.value.split(',').map(s => s.trim()))}
                placeholder="JavaScript, React, Node.js (comma-separated)"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
              />
            </div>
          </>
        );

      case 'healthcare':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Medical License Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.medicalLicenseNumber || ''}
                  onChange={(e) => handleInputChange('medicalLicenseNumber', e.target.value)}
                  placeholder="Professional license number"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Specialization *
                </label>
                <input
                  type="text"
                  value={formData.specialization || ''}
                  onChange={(e) => handleInputChange('specialization', e.target.value)}
                  placeholder="Cardiology, Pediatrics, etc."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Issuing Medical Board (Optional)
                </label>
                <input
                  type="text"
                  value={formData.issuingMedicalBoard || ''}
                  onChange={(e) => handleInputChange('issuingMedicalBoard', e.target.value)}
                  placeholder="State Medical Board"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Practice Location (Optional)
                </label>
                <input
                  type="text"
                  value={formData.practiceLocation || ''}
                  onChange={(e) => handleInputChange('practiceLocation', e.target.value)}
                  placeholder="Hospital/Clinic name"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Certification Date *
                </label>
                <input
                  type="date"
                  value={formData.certificationDate || ''}
                  onChange={(e) => handleInputChange('certificationDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Renewal Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.renewalDate || ''}
                  onChange={(e) => handleInputChange('renewalDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );

      case 'financial':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Account Type *
                </label>
                <select
                  value={formData.accountType || ''}
                  onChange={(e) => handleInputChange('accountType', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                >
                  <option value="">Select account type</option>
                  <option value="checking">Checking Account</option>
                  <option value="savings">Savings Account</option>
                  <option value="credit">Credit Account</option>
                  <option value="investment">Investment Account</option>
                  <option value="business">Business Account</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.bankName || ''}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder="Financial institution name"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Account Status *
                </label>
                <select
                  value={formData.accountStatus || ''}
                  onChange={(e) => handleInputChange('accountStatus', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                >
                  <option value="">Select status</option>
                  <option value="active">Active</option>
                  <option value="verified">Verified</option>
                  <option value="good_standing">Good Standing</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Credit Score (Optional)
                </label>
                <input
                  type="text"
                  value={formData.creditScore || ''}
                  onChange={(e) => handleInputChange('creditScore', e.target.value)}
                  placeholder="750"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Verification Date *
                </label>
                <input
                  type="date"
                  value={formData.verificationDate || ''}
                  onChange={(e) => handleInputChange('verificationDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  KYC Level (Optional)
                </label>
                <select
                  value={formData.kycLevel || ''}
                  onChange={(e) => handleInputChange('kycLevel', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                >
                  <option value="">Select KYC level</option>
                  <option value="basic">Basic</option>
                  <option value="enhanced">Enhanced</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'age':
        return (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => {
                    handleInputChange('dateOfBirth', e.target.value);
                    // Auto-calculate age
                    if (e.target.value) {
                      const birthDate = new Date(e.target.value);
                      const today = new Date();
                      const age = today.getFullYear() - birthDate.getFullYear();
                      const monthDiff = today.getMonth() - birthDate.getMonth();
                      const finalAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) ? age - 1 : age;
                      handleInputChange('ageVerified', finalAge.toString());
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Age Verified
                </label>
                <input
                  type="number"
                  value={formData.ageVerified || ''}
                  onChange={(e) => handleInputChange('ageVerified', e.target.value)}
                  placeholder="21"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Verification Method *
                </label>
                <select
                  value={formData.verificationMethod || ''}
                  onChange={(e) => handleInputChange('verificationMethod', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  required
                >
                  <option value="">Select verification method</option>
                  <option value="government_id">Government ID</option>
                  <option value="passport">Passport</option>
                  <option value="birth_certificate">Birth Certificate</option>
                  <option value="biometric">Biometric Verification</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Document Type *
                </label>
                <select
                  value={formData.documentType || ''}
                  onChange={(e) => handleInputChange('documentType', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  required
                >
                  <option value="">Select document type</option>
                  <option value="drivers_license">Driver's License</option>
                  <option value="passport">Passport</option>
                  <option value="national_id">National ID</option>
                  <option value="birth_certificate">Birth Certificate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Document Number (Optional)
                </label>
                <input
                  type="text"
                  value={formData.documentNumber || ''}
                  onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                  placeholder="Document identification number"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Credential Details
              </label>
              <textarea
                value={formData.details || ''}
                onChange={(e) => handleInputChange('details', e.target.value)}
                placeholder="Enter credential details..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
              />
            </div>
          </div>
        );
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  AnonID Issuer
                </h1>
                <p className="text-slate-300 text-sm">Issue Verifiable Credentials</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NetworkStatus />
              <DarkModeToggle />
              <WalletConnectButton />
            </div>
          </header>
          
          <main className="max-w-2xl mx-auto text-center">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-slate-300 mb-6">Connect your MetaMask wallet to access the credential issuer portal.</p>
              <WalletConnectButton />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AnonID Issuer
              </h1>
              <p className="text-slate-300 text-sm">Issue Verifiable Credentials</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NetworkStatus />
            <div className="text-sm text-slate-300">
              Issuer: {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
            <DarkModeToggle />
            <WalletConnectButton />
          </div>
        </header>

        <main className="max-w-4xl mx-auto">
          {!isContractConfigured() && (
            <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                </div>
                <div className="text-amber-200">
                  <p className="font-semibold">Smart Contract Not Deployed</p>
                  <p className="text-sm opacity-90">Deploy the AnonID contract to activate credential issuance.</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Issue New Credential</h2>
                <p className="text-slate-400">Create a verifiable credential on the blockchain</p>
              </div>
            </div>

            {/* Credential Type Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Select Credential Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {credentialTypes.map((type) => (
                  <button
                    key={type.type}
                    type="button"
                    onClick={() => handleTypeChange(type.type)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedType === type.type
                        ? `border-transparent bg-gradient-to-br ${type.color} text-white shadow-lg`
                        : 'border-slate-700/50 bg-slate-900/30 text-slate-300 hover:border-slate-600/50 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        selectedType === type.type ? 'bg-white/20' : 'bg-slate-700/50'
                      }`}>
                        {renderCredentialIcon(type.iconName)}
                      </div>
                      <span className="text-sm font-medium">{type.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Common Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Holder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.holderName || ''}
                    onChange={(e) => handleInputChange('holderName', e.target.value)}
                    placeholder="Enter credential holder's name"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Holder Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.holderEmail || ''}
                    onChange={(e) => handleInputChange('holderEmail', e.target.value)}
                    placeholder="holder@example.com"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Issuer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.issuerName || ''}
                    onChange={(e) => handleInputChange('issuerName', e.target.value)}
                    placeholder="Your organization name"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Valid Until (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil || ''}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Type-specific Fields */}
              <div className="border-t border-slate-700/30 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {credentialTypes.find(t => t.type === selectedType)?.title} Details
                </h3>
                {renderTypeSpecificFields()}
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Additional Description (Optional)
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Additional details about this credential..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 transition-colors"
                >
                  ← Back to Dashboard
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isPending || !isContractConfigured()}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isSubmitting || isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {isPending ? 'Confirming Transaction...' : 'Generating Credential...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Issue {credentialTypes.find(t => t.type === selectedType)?.title}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Credentials are stored on-chain and can be verified using Zero Knowledge Proofs
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
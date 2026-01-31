/**
 * Credential Type Detection and Styling
 * 
 * This module provides utilities for detecting credential types based on issuer addresses
 * and other characteristics, and returns appropriate styling and metadata.
 */

import React from 'react'
import { Address } from 'viem'

export interface CredentialTypeInfo {
  type: string
  title: string
  description: string
  iconName: string
  color: string
  category: 'identity' | 'education' | 'professional' | 'government' | 'healthcare' | 'financial' | 'other'
}

/**
 * Known issuer registry - in a production system, this would be fetched from a registry contract
 * or external API. For now, we use pattern matching and known addresses.
 */
const KNOWN_ISSUERS: Record<string, Partial<CredentialTypeInfo>> = {
  // Example known issuers (replace with real addresses)
  '0x1234567890123456789012345678901234567890': {
    type: 'university',
    title: 'University Degree',
    description: 'Academic degree from accredited institution',
    category: 'education'
  },
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd': {
    type: 'government',
    title: 'Government ID',
    description: 'Official government identification',
    category: 'government'
  }
}

/**
 * Detect credential type based on issuer address and other characteristics
 */
export function detectCredentialType(issuer: Address, commitment?: string): CredentialTypeInfo {
  const issuerLower = issuer.toLowerCase()
  
  // Check known issuers first
  if (KNOWN_ISSUERS[issuerLower]) {
    const knownIssuer = KNOWN_ISSUERS[issuerLower]
    return {
      ...getDefaultTypeInfo(knownIssuer.type || 'generic'),
      ...knownIssuer
    } as CredentialTypeInfo
  }
  
  // Pattern-based detection for demo purposes
  // In production, this would use a more sophisticated registry system
  
  // Educational institutions
  if (issuerLower.includes('edu') || 
      issuerLower.endsWith('1234') || 
      issuerLower.endsWith('5678') ||
      issuerLower.includes('university') ||
      issuerLower.includes('college')) {
    return getDefaultTypeInfo('education')
  }
  
  // Government/Official
  if (issuerLower.includes('gov') || 
      issuerLower.endsWith('9abc') || 
      issuerLower.endsWith('def0') ||
      issuerLower.includes('official')) {
    return getDefaultTypeInfo('government')
  }
  
  // Professional/Employment
  if (issuerLower.includes('corp') || 
      issuerLower.endsWith('1111') || 
      issuerLower.endsWith('2222') ||
      issuerLower.includes('company') ||
      issuerLower.includes('professional')) {
    return getDefaultTypeInfo('professional')
  }
  
  // Healthcare
  if (issuerLower.includes('health') || 
      issuerLower.endsWith('3333') || 
      issuerLower.endsWith('4444') ||
      issuerLower.includes('medical') ||
      issuerLower.includes('hospital')) {
    return getDefaultTypeInfo('healthcare')
  }
  
  // Financial
  if (issuerLower.includes('bank') || 
      issuerLower.includes('fin') || 
      issuerLower.endsWith('5555') ||
      issuerLower.includes('credit') ||
      issuerLower.includes('payment')) {
    return getDefaultTypeInfo('financial')
  }
  
  // Age verification
  if (issuerLower.includes('age') || 
      issuerLower.endsWith('6666') || 
      issuerLower.endsWith('7777') ||
      issuerLower.includes('identity') ||
      issuerLower.includes('kyc')) {
    return getDefaultTypeInfo('age')
  }
  
  // Default/Generic credential
  return getDefaultTypeInfo('generic')
}

/**
 * Get default type information for a credential type
 */
function getDefaultTypeInfo(type: string): CredentialTypeInfo {
  const typeConfigs: Record<string, CredentialTypeInfo> = {
    education: {
      type: 'education',
      title: 'Educational Credential',
      description: 'Academic achievement certificate',
      iconName: 'academic-cap',
      color: 'from-blue-500 to-indigo-600',
      category: 'education'
    },
    government: {
      type: 'government',
      title: 'Government ID',
      description: 'Official government credential',
      iconName: 'shield-check',
      color: 'from-green-500 to-emerald-600',
      category: 'government'
    },
    professional: {
      type: 'professional',
      title: 'Professional License',
      description: 'Employment or certification credential',
      iconName: 'briefcase',
      color: 'from-purple-500 to-pink-600',
      category: 'professional'
    },
    healthcare: {
      type: 'healthcare',
      title: 'Health Credential',
      description: 'Medical or health-related certificate',
      iconName: 'heart',
      color: 'from-red-500 to-rose-600',
      category: 'healthcare'
    },
    financial: {
      type: 'financial',
      title: 'Financial Credential',
      description: 'Banking or financial verification',
      iconName: 'currency-dollar',
      color: 'from-yellow-500 to-orange-600',
      category: 'financial'
    },
    age: {
      type: 'age',
      title: 'Age Verification',
      description: 'Age or identity verification credential',
      iconName: 'identification',
      color: 'from-teal-500 to-cyan-600',
      category: 'identity'
    },
    generic: {
      type: 'generic',
      title: 'Verifiable Credential',
      description: 'Digital identity credential',
      iconName: 'document-text',
      color: 'from-cyan-500 to-purple-500',
      category: 'other'
    }
  }
  
  return typeConfigs[type] || typeConfigs.generic
}

/**
 * Get all available credential types for filtering/categorization
 */
export function getAllCredentialTypes(): CredentialTypeInfo[] {
  return [
    'education',
    'government', 
    'professional',
    'healthcare',
    'financial',
    'age',
    'generic'
  ].map(type => getDefaultTypeInfo(type))
}

/**
 * Format credential type for display
 */
export function formatCredentialType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

/**
 * Render icon based on icon name
 */
export function renderCredentialIcon(iconName: string): React.JSX.Element {
  const iconProps = {
    className: "w-5 h-5 text-white",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }

  switch (iconName) {
    case 'academic-cap':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      )
    case 'shield-check':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    case 'briefcase':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
        </svg>
      )
    case 'heart':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'currency-dollar':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    case 'identification':
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
        </svg>
      )
    case 'document-text':
    default:
      return (
        <svg {...iconProps}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
  }
}
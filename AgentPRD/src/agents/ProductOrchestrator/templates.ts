/**
 * PRD Templates for AgentPRD
 * 
 * Professional product requirements document templates for different use cases
 */

export interface PRDTemplate {
  name: string;
  description: string;
  sections: readonly string[];
  variables?: readonly string[];
}

export const PRD_TEMPLATES = {
  'feature': {
    name: 'Feature PRD Template',
    description: 'Standard template for new feature requirements',
    sections: [
      '# Product Requirements Document: {feature_name}',
      '',
      '## Executive Summary',
      '**Problem Statement:** {problem}',
      '**Solution Overview:** {solution}',
      '**Success Metrics:** {metrics}',
      '',
      '## Problem Definition',
      '### Current State',
      '{current_state}',
      '',
      '### Pain Points',
      '- {pain_point_1}',
      '- {pain_point_2}',
      '- {pain_point_3}',
      '',
      '## Solution Requirements',
      '### User Stories',
      '- As a {user_type}, I want {functionality} so that {benefit}',
      '',
      '### Functional Requirements',
      '1. {requirement_1}',
      '2. {requirement_2}',
      '3. {requirement_3}',
      '',
      '### Non-Functional Requirements',
      '- **Performance:** {performance_req}',
      '- **Security:** {security_req}',
      '- **Scalability:** {scalability_req}',
      '',
      '## Technical Specifications',
      '### Architecture Overview',
      '{architecture_overview}',
      '',
      '### API Requirements',
      '{api_requirements}',
      '',
      '## Success Metrics & KPIs',
      '- **Primary Metric:** {primary_metric}',
      '- **Secondary Metrics:** {secondary_metrics}',
      '',
      '## Implementation Plan',
      '### Phase 1: {phase_1}',
      '### Phase 2: {phase_2}',
      '### Phase 3: {phase_3}',
      '',
      '## Risk Assessment',
      '### Technical Risks',
      '- {technical_risk_1}',
      '',
      '### Business Risks',
      '- {business_risk_1}',
      '',
      '## Timeline',
      '- **Planning:** {planning_timeline}',
      '- **Development:** {dev_timeline}',
      '- **Testing:** {testing_timeline}',
      '- **Launch:** {launch_timeline}',
    ],
    variables: [
      'feature_name', 'problem', 'solution', 'metrics', 'current_state',
      'pain_point_1', 'pain_point_2', 'pain_point_3', 'user_type', 
      'functionality', 'benefit', 'requirement_1', 'requirement_2', 
      'requirement_3', 'performance_req', 'security_req', 'scalability_req',
      'architecture_overview', 'api_requirements', 'primary_metric',
      'secondary_metrics', 'phase_1', 'phase_2', 'phase_3',
      'technical_risk_1', 'business_risk_1', 'planning_timeline',
      'dev_timeline', 'testing_timeline', 'launch_timeline'
    ]
  },
  
  'saas': {
    name: 'SaaS Product PRD Template',
    description: 'Comprehensive template for SaaS product development',
    sections: [
      '# SaaS Product Requirements: {product_name}',
      '',
      '## Market Opportunity',
      '**Market Size:** {market_size}',
      '**Target Audience:** {target_audience}',
      '**Competitive Landscape:** {competitors}',
      '',
      '## Product Vision',
      '**Vision Statement:** {vision}',
      '**Mission:** {mission}',
      '**Value Proposition:** {value_prop}',
      '',
      '## User Personas',
      '### Primary Persona: {primary_persona}',
      '- **Role:** {role}',
      '- **Goals:** {goals}',
      '- **Pain Points:** {pain_points}',
      '',
      '## Feature Requirements',
      '### Core Features (MVP)',
      '1. {core_feature_1}',
      '2. {core_feature_2}',
      '3. {core_feature_3}',
      '',
      '### Advanced Features (Post-MVP)',
      '1. {advanced_feature_1}',
      '2. {advanced_feature_2}',
      '',
      '## Technical Architecture',
      '### System Architecture',
      '{architecture}',
      '',
      '### Integration Requirements',
      '- {integration_1}',
      '- {integration_2}',
      '',
      '## Business Model',
      '**Pricing Strategy:** {pricing}',
      '**Revenue Streams:** {revenue}',
      '**Customer Acquisition:** {acquisition}',
      '',
      '## Go-to-Market Strategy',
      '### Launch Plan',
      '{launch_plan}',
      '',
      '### Marketing Channels',
      '- {channel_1}',
      '- {channel_2}',
      '',
      '## Success Metrics',
      '- **ARR Target:** {arr_target}',
      '- **User Growth:** {user_growth}',
      '- **Churn Rate:** {churn_target}',
      '- **CAC/LTV Ratio:** {cac_ltv}',
    ],
    variables: [
      'product_name', 'market_size', 'target_audience', 'competitors',
      'vision', 'mission', 'value_prop', 'primary_persona', 'role',
      'goals', 'pain_points', 'core_feature_1', 'core_feature_2',
      'core_feature_3', 'advanced_feature_1', 'advanced_feature_2',
      'architecture', 'integration_1', 'integration_2', 'pricing',
      'revenue', 'acquisition', 'launch_plan', 'channel_1', 'channel_2',
      'arr_target', 'user_growth', 'churn_target', 'cac_ltv'
    ]
  },

  'mobile': {
    name: 'Mobile App PRD Template',
    description: 'Specialized template for mobile application development',
    sections: [
      '# Mobile App PRD: {app_name}',
      '',
      '## App Overview',
      '**App Type:** {app_type}',
      '**Target Platforms:** {platforms}',
      '**Target OS Versions:** {os_versions}',
      '',
      '## User Experience',
      '### User Flow',
      '{user_flow}',
      '',
      '### Key Screens',
      '1. {screen_1}',
      '2. {screen_2}',
      '3. {screen_3}',
      '',
      '## Features & Functionality',
      '### Core Features',
      '- {core_feature_1}',
      '- {core_feature_2}',
      '- {core_feature_3}',
      '',
      '### Platform-Specific Features',
      '**iOS:** {ios_features}',
      '**Android:** {android_features}',
      '',
      '## Technical Requirements',
      '### Performance Requirements',
      '- **App Size:** {app_size}',
      '- **Load Time:** {load_time}',
      '- **Battery Usage:** {battery_usage}',
      '',
      '### Device Support',
      '- **Minimum RAM:** {min_ram}',
      '- **Storage:** {storage_req}',
      '- **Network:** {network_req}',
      '',
      '## Analytics & Tracking',
      '### Key Metrics',
      '- **DAU/MAU:** {dau_mau}',
      '- **Session Length:** {session_length}',
      '- **Retention Rate:** {retention}',
      '',
      '## Launch Strategy',
      '### App Store Optimization',
      '{aso_strategy}',
      '',
      '### Marketing Plan',
      '{marketing_plan}',
    ],
    variables: [
      'app_name', 'app_type', 'platforms', 'os_versions', 'user_flow',
      'screen_1', 'screen_2', 'screen_3', 'core_feature_1', 'core_feature_2',
      'core_feature_3', 'ios_features', 'android_features', 'app_size',
      'load_time', 'battery_usage', 'min_ram', 'storage_req', 'network_req',
      'dau_mau', 'session_length', 'retention', 'aso_strategy', 'marketing_plan'
    ]
  }
} as const;

export type TemplateType = keyof typeof PRD_TEMPLATES;

export function getTemplate(templateType: TemplateType): PRDTemplate {
  return PRD_TEMPLATES[templateType];
}

export function listTemplates(): PRDTemplate[] {
  return Object.values(PRD_TEMPLATES);
}

export function findBestTemplate(description: string): TemplateType {
  const desc = description.toLowerCase();
  
  if (desc.includes('mobile') || desc.includes('app') || desc.includes('ios') || desc.includes('android')) {
    return 'mobile';
  }
  
  if (desc.includes('saas') || desc.includes('platform') || desc.includes('software') || desc.includes('service')) {
    return 'saas';
  }
  
  return 'feature';
}

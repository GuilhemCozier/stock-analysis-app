/**
 * Mock data for development and testing
 */

export const mockSectorAnalysis = {
  id: 'demo-123',
  sectorName: 'Cybersecurity',
  status: 'completed',
  fullReport: `The cybersecurity sector continues to show robust growth driven by increasing digital transformation and sophisticated threat landscapes. Enterprise spending on security solutions has accelerated, with cloud security and zero-trust architectures becoming essential infrastructure.

Key market drivers include regulatory compliance requirements (GDPR, CCPA, SOC2), rising ransomware attacks, and the shift to remote work environments. The sector is experiencing consolidation as larger players acquire specialized security vendors to build comprehensive security platforms.

Investment opportunities are strongest in companies providing AI-powered threat detection, identity and access management, and cloud-native security solutions. The sector demonstrates resilience with recurring revenue models and high customer retention rates.`,
  subSectors: [
    {
      id: 'sub-1',
      name: 'AI-Powered Cybersecurity',
      summary: 'AI-driven threat detection and automated response at enterprise scale.',
      longDescription:
        `Machine learning is reshaping how security teams detect and respond to threats, especially for high-volume telemetry (endpoints, identity, network, and cloud). The most compelling platforms combine behavioral analytics, anomaly detection, and automated playbooks to shorten time-to-detect and time-to-remediate.\n\nKey themes: (1) durable data moats via broad sensor coverage, (2) workflows that reduce analyst toil rather than create more alerts, and (3) measurable outcomes (reduced dwell time, lower breach impact). Risks include model drift, false positives in noisy environments, and competitive pressure from bundled platform vendors.`,
      status: 'completed',
      stocks: [
        {
          id: 'stock-1',
          companyName: 'CrowdStrike Holdings',
          ticker: 'CRWD',
          rank: 1,
        },
        {
          id: 'stock-2',
          companyName: 'Darktrace',
          ticker: 'DARK',
          rank: 2,
        },
        {
          id: 'stock-3',
          companyName: 'SentinelOne',
          ticker: 'S',
          rank: 3,
        },
      ],
      createdAt: '2026-01-23T10:00:00Z',
    },
    {
      id: 'sub-2',
      name: 'Cloud Security',
      summary: 'Securing multi-cloud infrastructure and cloud-native applications.',
      longDescription:
        `As workloads migrate to AWS, Azure, and GCP, security shifts from perimeter tools to continuous posture management and runtime protection. Winning products unify visibility across identity, configuration, and workloads, and integrate with DevOps so issues are prevented earlier in the pipeline.\n\nKey themes: (1) identity as the new control plane, (2) policy-as-code and guardrails, (3) consolidation of point solutions into platforms (CNAPP), and (4) increased demand for compliance automation. Risks include vendor sprawl fatigue, pricing pressure, and fast-moving platform primitives from hyperscalers.`,
      status: 'analyzing',
      stocks: [
        {
          id: 'stock-4',
          companyName: 'Palo Alto Networks',
          ticker: 'PANW',
          rank: 1,
        },
        {
          id: 'stock-5',
          companyName: 'Zscaler',
          ticker: 'ZS',
          rank: 2,
        },
      ],
      createdAt: '2026-01-23T10:15:00Z',
    },
    {
      id: 'sub-3',
      name: 'Identity & Access Management',
      summary: 'Zero-trust access, strong authentication, and privileged controls.',
      longDescription:
        `Identity is increasingly the primary security boundary. Modern IAM stacks emphasize phishing-resistant authentication, fine-grained authorization, and privileged access management (PAM) for both humans and machines. Consolidating identity signals (device, behavior, network context) enables adaptive access policies.\n\nKey themes: (1) passwordless adoption, (2) least-privilege enforcement, (3) strong governance for SaaS sprawl, and (4) machine identity lifecycle management. Risks include integration complexity, outages with centralized identity providers, and buyer scrutiny after high-profile breaches.`,
      status: 'writing',
      stocks: [
        {
          id: 'stock-6',
          companyName: 'Okta',
          ticker: 'OKTA',
          rank: 1,
        },
      ],
      createdAt: '2026-01-23T10:30:00Z',
    },
    {
      id: 'sub-4',
      name: 'Endpoint Security',
      summary: 'Protecting endpoints across laptops, servers, mobile, and IoT.',
      longDescription:
        `Attack surfaces keep expanding as organizations add remote devices, unmanaged endpoints, and IoT hardware. Endpoint platforms compete on lightweight agents, high-fidelity telemetry, prevention + detection efficacy, and integrated incident response.\n\nKey themes: (1) ransomware resilience (rollback, isolation), (2) unified endpoint + identity signals, and (3) coverage for heterogeneous device fleets. Risks include performance overhead, signature fatigue, and commoditization when EDR becomes bundled into broader suites.`,
      status: 'initiated',
      stocks: [],
      createdAt: '2026-01-23T10:45:00Z',
    },
  ],
  jobs: [
    {
      id: 'job-1',
      jobType: 'sector_research',
      status: 'completed',
      progress: 100,
      errorMessage: null,
      relatedId: 'demo-123',
      createdAt: '2026-01-23T10:00:00Z',
      updatedAt: '2026-01-23T10:50:00Z',
    },
  ],
  createdAt: '2026-01-23T10:00:00Z',
  updatedAt: '2026-01-23T10:50:00Z',
};

export const mockRecentAnalyses = [
  {
    id: 'demo-123',
    title: 'Cybersecurity',
    description: 'Sector analysis',
    timestamp: '2 hours ago',
    status: 'completed' as const,
  },
  {
    id: 'demo-456',
    title: 'Healthcare Technology',
    description: 'Sector analysis',
    timestamp: '1 day ago',
    status: 'completed' as const,
  },
  {
    id: 'demo-789',
    title: 'Renewable Energy',
    description: 'Sector analysis',
    timestamp: '3 days ago',
    status: 'in_progress' as const,
  },
];

/**
 * Mock company analyses for the Database page (`DatabaseTable`)
 */
export const mockCompanyAnalyses = [
  {
    id: 'co-1',
    companyName: 'CrowdStrike Holdings',
    isHolding: true,
    conservative5yTarget: 520,
    priceAtAnalysis: 320,
    convictionScore: 8.6,
    sector: 'Cybersecurity',
    currency: 'USD',
    strongBuyThreshold: 260,
    accumulateThreshold: 300,
    reduceThreshold: 410,
    strongSellThreshold: 470,
    dateOfAnalysis: new Date('2026-01-20T10:00:00Z'),
  },
  {
    id: 'co-2',
    companyName: 'Palo Alto Networks',
    isHolding: false,
    conservative5yTarget: 520,
    priceAtAnalysis: 365,
    convictionScore: 7.7,
    sector: 'Cybersecurity',
    currency: 'USD',
    strongBuyThreshold: 300,
    accumulateThreshold: 340,
    reduceThreshold: 430,
    strongSellThreshold: 480,
    dateOfAnalysis: new Date('2026-01-18T14:30:00Z'),
  },
  {
    id: 'co-3',
    companyName: 'ASML Holding',
    isHolding: true,
    conservative5yTarget: 1320,
    priceAtAnalysis: 860,
    convictionScore: 9.1,
    sector: 'Technology',
    currency: 'EUR',
    strongBuyThreshold: 760,
    accumulateThreshold: 820,
    reduceThreshold: 1030,
    strongSellThreshold: 1160,
    dateOfAnalysis: new Date('2026-01-12T09:15:00Z'),
  },
  {
    id: 'co-4',
    companyName: 'Visa',
    isHolding: false,
    conservative5yTarget: 440,
    priceAtAnalysis: 295,
    convictionScore: 7.9,
    sector: 'Financial',
    currency: 'USD',
    strongBuyThreshold: 250,
    accumulateThreshold: 275,
    reduceThreshold: 340,
    strongSellThreshold: 380,
    dateOfAnalysis: new Date('2026-01-08T16:45:00Z'),
  },
] as const;

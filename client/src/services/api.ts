import {
  DashboardMetrics,
  AuditEvent,
  CredentialItem,
  GatewayInteropResult,
  CertInspectionResult,
  PgpKeyInspectionResult,
} from '../types/index';

// Configurable API base URL: defaults to same-origin '/api' for unified Vercel deployment,
// or reads VITE_API_BASE_URL if configured for decoupled hosting.
const API_BASE = ((import.meta as any).env?.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '/api';

export class ApiService {
  /**
   * Returns the resolved API base URL (useful for downloads, exports, and diagnostics)
   */
  static getBaseUrl(): string {
    return API_BASE;
  }

  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE}${cleanEndpoint}`;

    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      });

      if (!res.ok) {
        let errorMessage = `HTTP error ${res.status}: ${res.statusText}`;
        try {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await res.json();
            if (typeof errorData?.error === 'string') {
              errorMessage = errorData.error;
            } else if (errorData?.error?.message) {
              errorMessage = errorData.error.message;
            } else if (typeof errorData?.message === 'string') {
              errorMessage = errorData.message;
            }
          } else {
            const rawText = await res.text();
            if (rawText && rawText.length < 200 && !rawText.includes('<!DOCTYPE') && !rawText.includes('<html')) {
              errorMessage = rawText;
            } else if (res.status === 404) {
              errorMessage = `Gateway endpoint '${cleanEndpoint}' returned 404 Not Found. Ensure backend routing is active.`;
            }
          }
        } catch {
          // fallback
        }
        throw new Error(errorMessage);
      }

      return await res.json();
    } catch (err: any) {
      console.warn(`[API] Failed request to ${url}:`, err.message);
      throw err;
    }
  }

  // Health
  static async getHealth() {
    return this.request<{ status: string; creator: string; domain: string; version: string; capabilities: any }>('/health');
  }

  // Dashboard
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    return this.request<DashboardMetrics>('/dashboard');
  }

  static async resetDemoData(): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/demo/reset', {
      method: 'POST',
    });
  }

  static async runSecuritySelfCheck(): Promise<any> {
    return this.request<any>('/demo/run-check', {
      method: 'POST',
    });
  }

  // S/MIME
  static async inspectSmimeCertificate(certificatePem: string): Promise<{ success: boolean; data: CertInspectionResult }> {
    return this.request<{ success: boolean; data: CertInspectionResult }>('/smime/inspect-certificate', {
      method: 'POST',
      body: JSON.stringify({ certificatePem }),
    });
  }

  static async signSmime(content: string, privateKeyPem?: string, certificatePem?: string, useSampleKey: boolean = false) {
    return this.request<any>('/smime/sign', {
      method: 'POST',
      body: JSON.stringify({ content, privateKeyPem, certificatePem, useSampleKey }),
    });
  }

  static async verifySmimeSignature(signedPem: string, rawContent?: string) {
    return this.request<any>('/smime/verify-signature', {
      method: 'POST',
      body: JSON.stringify({ signedPem, rawContent }),
    });
  }

  static async encryptSmime(content: string, recipientCertPem?: string, useSampleCert: boolean = false) {
    return this.request<any>('/smime/encrypt', {
      method: 'POST',
      body: JSON.stringify({ content, recipientCertPem, useSampleCert }),
    });
  }

  static async decryptSmime(encryptedPem: string, recipientPrivateKeyPem?: string, useSampleKey: boolean = false) {
    return this.request<any>('/smime/decrypt', {
      method: 'POST',
      body: JSON.stringify({ encryptedPem, recipientPrivateKeyPem, useSampleKey }),
    });
  }

  static async getSmimeSampleCredentials() {
    return this.request<any>('/smime/sample-credentials');
  }

  // OpenPGP
  static async generateOpenPGPKey(name: string, email: string, passphrase?: string, type?: 'ecc' | 'rsa') {
    return this.request<{ success: boolean; data: any }>('/openpgp/generate-key', {
      method: 'POST',
      body: JSON.stringify({ name, email, passphrase, type }),
    });
  }

  static async inspectOpenPGPKey(armoredKey: string): Promise<{ success: boolean; data: PgpKeyInspectionResult }> {
    return this.request<{ success: boolean; data: PgpKeyInspectionResult }>('/openpgp/inspect-key', {
      method: 'POST',
      body: JSON.stringify({ armoredKey }),
    });
  }

  static async encryptOpenPGP(content: string, recipientPublicKey?: string, signingPrivateKey?: string, passphrase?: string, useSampleKey: boolean = false) {
    return this.request<{ success: boolean; data: any }>('/openpgp/encrypt', {
      method: 'POST',
      body: JSON.stringify({ content, recipientPublicKey, signingPrivateKey, passphrase, useSampleKey }),
    });
  }

  static async decryptOpenPGP(ciphertext: string, privateKey?: string, passphrase?: string, senderPublicKey?: string, useSampleKey: boolean = false) {
    return this.request<{ success: boolean; data: any }>('/openpgp/decrypt', {
      method: 'POST',
      body: JSON.stringify({ ciphertext, privateKey, passphrase, senderPublicKey, useSampleKey }),
    });
  }

  static async signOpenPGP(content: string, privateKey?: string, passphrase?: string, detached: boolean = false, useSampleKey: boolean = false) {
    return this.request<{ success: boolean; data: any }>('/openpgp/sign', {
      method: 'POST',
      body: JSON.stringify({ content, privateKey, passphrase, detached, useSampleKey }),
    });
  }

  static async verifyOpenPGP(contentOrCleartext: string, publicKey?: string, detachedSignature?: string, useSampleKey: boolean = false) {
    return this.request<{ success: boolean; data: any }>('/openpgp/verify', {
      method: 'POST',
      body: JSON.stringify({ contentOrCleartext, publicKey, detachedSignature, useSampleKey }),
    });
  }

  static async getOpenPGPSampleCredentials() {
    return this.request<any>('/openpgp/sample-credentials');
  }

  // Gateway Interop Lab
  static async simulateGatewayScenario(scenarioId: string, customMessage?: string): Promise<{ success: boolean; data: GatewayInteropResult }> {
    return this.request<{ success: boolean; data: GatewayInteropResult }>('/gateway/simulate-interoperability', {
      method: 'POST',
      body: JSON.stringify({ scenarioId, customMessage }),
    });
  }

  // Email Composer
  static async processComposerMessage(payload: {
    sender: string;
    recipient: string;
    subject: string;
    body: string;
    protocol: 'SMIME' | 'OPENPGP' | 'AUTO';
    encrypt: boolean;
    sign: boolean;
    attachmentName?: string;
  }) {
    return this.request<any>('/demo/process-message', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Audit Logs
  static async getAuditLogs(filters?: { protocol?: string; category?: string; status?: string; search?: string }): Promise<{ success: boolean; total: number; data: AuditEvent[] }> {
    const params = new URLSearchParams();
    if (filters?.protocol) params.set('protocol', filters.protocol);
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ success: boolean; total: number; data: AuditEvent[] }>(`/audit-logs${queryStr}`);
  }

  // Credentials
  static async getCredentials(): Promise<{ success: boolean; data: CredentialItem[] }> {
    return this.request<{ success: boolean; data: CredentialItem[] }>('/credentials');
  }

  static async importCredential(data: { rawText: string; ownerName?: string; email?: string; type?: 'SMIME' | 'OPENPGP' }) {
    return this.request<{ success: boolean; data: CredentialItem }>('/credentials/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async deleteCredential(id: string) {
    return this.request<{ success: boolean; message: string }>(`/credentials/${id}`, {
      method: 'DELETE',
    });
  }
}

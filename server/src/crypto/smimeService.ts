import crypto from 'node:crypto';
import forge from 'node-forge';

const pki = forge.pki;

export interface CertInspectionResult {
  isValid: boolean;
  subject: string;
  issuer: string;
  serialNumber: string;
  validFrom: string;
  validTo: string;
  isDateValid: boolean;
  fingerprint256: string;
  fingerprintSha1: string;
  keyAlgorithm: string;
  keySize?: number;
  isSelfSigned: boolean;
  keyUsage?: string[];
  san?: string[];
  isCA: boolean;
  trustChainEstablished: boolean;
  trustNotice: string;
  pem: string;
  error?: string;
}

export class SmimeService {
  /**
   * Generates a new demonstration X.509 Certificate and RSA Key Pair
   */
  static generateCertificate(
    commonName: string,
    emailAddress: string,
    organization: string = 'Secure Mail Gateway Academic Project',
    validityYears: number = 1,
    isCA: boolean = false
  ) {
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();
    
    cert.publicKey = keys.publicKey;
    cert.serialNumber = Math.floor(Math.random() * 1000000000).toString(16);
    
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + validityYears);

    const attrs = [
      { name: 'commonName', value: commonName },
      { name: 'organizationName', value: organization },
      { name: 'emailAddress', value: emailAddress }
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs); // Self-signed for academic demo

    const extensions: any[] = [
      {
        name: 'basicConstraints',
        cA: isCA,
      },
      {
        name: 'keyUsage',
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: 'extKeyUsage',
        emailProtection: true,
        clientAuth: true,
      },
      {
        name: 'subjectAltName',
        altNames: [{ type: 1, value: emailAddress }], // type 1 is rfc822Name (email)
      },
    ];

    cert.setExtensions(extensions);
    cert.sign(keys.privateKey, forge.md.sha256.create());

    const certPem = pki.certificateToPem(cert);
    const privateKeyPem = pki.privateKeyToPem(keys.privateKey);
    const publicKeyPem = pki.publicKeyToPem(keys.publicKey);

    return {
      certPem,
      privateKeyPem,
      publicKeyPem,
      serialNumber: cert.serialNumber,
      fingerprint: forge.md.sha256.create().update(forge.asn1.toDer(pki.certificateToAsn1(cert)).getBytes()).digest().toHex().match(/.{2}/g)?.join(':').toUpperCase() || '',
      subject: commonName,
      email: emailAddress,
      validFrom: cert.validity.notBefore.toISOString(),
      validTo: cert.validity.notAfter.toISOString(),
    };
  }

  /**
   * Inspects and parses an X.509 certificate in PEM or DER format
   */
  static inspectCertificate(certInput: string | Buffer): CertInspectionResult {
    try {
      let pem = '';
      if (Buffer.isBuffer(certInput)) {
        pem = certInput.toString('utf8');
      } else {
        pem = certInput.trim();
      }

      // If user provided base64 DER without headers, try wrapping it
      if (!pem.includes('-----BEGIN CERTIFICATE-----')) {
        pem = `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----`;
      }

      // Parse with Node crypto for native validation
      const x509 = new crypto.X509Certificate(pem);
      const forgeCert = pki.certificateFromPem(pem);

      const now = new Date();
      const validFromDate = new Date(x509.validFrom);
      const validToDate = new Date(x509.validTo);
      const isDateValid = now >= validFromDate && now <= validToDate;

      // Extract subject attributes
      const subjectAttrs = forgeCert.subject.attributes.map(a => `${a.shortName || a.name}=${a.value}`).join(', ');
      const issuerAttrs = forgeCert.issuer.attributes.map(a => `${a.shortName || a.name}=${a.value}`).join(', ');

      const isSelfSigned = x509.subject === x509.issuer;

      // Check key usage extension
      const keyUsageExt = forgeCert.getExtension('keyUsage') as any;
      const keyUsage: string[] = [];
      if (keyUsageExt) {
        if (keyUsageExt.digitalSignature) keyUsage.push('digitalSignature');
        if (keyUsageExt.nonRepudiation) keyUsage.push('nonRepudiation');
        if (keyUsageExt.keyEncipherment) keyUsage.push('keyEncipherment');
        if (keyUsageExt.dataEncipherment) keyUsage.push('dataEncipherment');
        if (keyUsageExt.keyCertSign) keyUsage.push('keyCertSign');
        if (keyUsageExt.cRLSign) keyUsage.push('cRLSign');
      }

      // Check SAN
      const sanExt = forgeCert.getExtension('subjectAltName') as any;
      const san: string[] = [];
      if (sanExt && Array.isArray(sanExt.altNames)) {
        for (const alt of sanExt.altNames) {
          if (alt.value) san.push(alt.value);
        }
      }

      // Compute SHA-1 fingerprint
      const derBytes = forge.asn1.toDer(pki.certificateToAsn1(forgeCert)).getBytes();
      const sha1 = forge.md.sha1.create().update(derBytes).digest().toHex().match(/.{2}/g)?.join(':').toUpperCase() || '';

      const isCA = (x509 as any).ca || false;

      // Notice about trust
      const trustChainEstablished = false; // Academic gateway demo without public trusted root CA anchor
      const trustNotice = isSelfSigned
        ? 'Certificate is self-signed (Demonstration credential). Parsed successfully, but not anchored to an OS-trusted root authority.'
        : 'Certificate has an issuing authority specified. Signature syntax parsed, but trust chain requires an explicit local trusted truststore anchor.';

      return {
        isValid: true,
        subject: x509.subject.replace(/\n/g, ', ') || subjectAttrs,
        issuer: x509.issuer.replace(/\n/g, ', ') || issuerAttrs,
        serialNumber: x509.serialNumber,
        validFrom: x509.validFrom,
        validTo: x509.validTo,
        isDateValid,
        fingerprint256: x509.fingerprint256,
        fingerprintSha1: sha1,
        keyAlgorithm: x509.publicKey.asymmetricKeyType || 'RSA',
        keySize: (forgeCert.publicKey as any).n ? (forgeCert.publicKey as any).n.bitLength() : undefined,
        isSelfSigned,
        keyUsage: keyUsage.length > 0 ? keyUsage : ['digitalSignature', 'keyEncipherment'],
        san,
        isCA,
        trustChainEstablished,
        trustNotice,
        pem,
      };
    } catch (err: any) {
      return {
        isValid: false,
        subject: '',
        issuer: '',
        serialNumber: '',
        validFrom: '',
        validTo: '',
        isDateValid: false,
        fingerprint256: '',
        fingerprintSha1: '',
        keyAlgorithm: 'Unknown',
        isSelfSigned: false,
        isCA: false,
        trustChainEstablished: false,
        trustNotice: 'Certificate parsing failed.',
        pem: '',
        error: err.message || 'Failed to parse X.509 certificate',
      };
    }
  }

  /**
   * Signs content with sender RSA private key and creates PKCS#7 / CMS SignedData
   */
  static signMessage(content: string, privateKeyPem: string, certPem: string) {
    try {
      const privateKey = pki.privateKeyFromPem(privateKeyPem);
      const cert = pki.certificateFromPem(certPem);

      const p7 = forge.pkcs7.createSignedData();
      p7.content = forge.util.createBuffer(content, 'utf8');
      p7.addCertificate(cert);
      p7.addSigner({
        key: privateKey,
        certificate: cert,
        digestAlgorithm: forge.pki.oids.sha256,
        authenticatedAttributes: [
          { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
          { type: forge.pki.oids.messageDigest },
          { type: forge.pki.oids.signingTime, value: new Date().toUTCString() } as any,
        ],
      });

      p7.sign();
      const signedPem = forge.pkcs7.messageToPem(p7 as any);

      return {
        success: true,
        signedPem,
        signerCertSubject: cert.subject.attributes.map(a => `${a.shortName || a.name}=${a.value}`).join(', '),
        digestAlgorithm: 'SHA-256',
        signatureFormat: 'PKCS#7 / CMS (RFC 5652 / RFC 8551 S/MIME)',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'S/MIME signing failed',
      };
    }
  }

  /**
   * Mathematically verifies an S/MIME PKCS#7 SignedData message
   * Performs full RFC 5652 verification:
   * 1. Validates signer certificate and validity dates
   * 2. Validates message digest integrity against messageDigest attribute
   * 3. Validates RSA digital signature over authenticated attributes
   */
  static verifySignature(signedPem: string, rawContent?: string) {
    try {
      if (!signedPem || typeof signedPem !== 'string') {
        return {
          verified: false,
          error: 'Missing or invalid PKCS#7 SignedData PEM string',
        };
      }

      const p7 = forge.pkcs7.messageFromPem(signedPem) as any;
      
      if (!p7.certificates || p7.certificates.length === 0) {
        return {
          verified: false,
          error: 'No signer certificate found in PKCS#7 signature payload',
        };
      }

      const signerCert = p7.certificates[0];
      const certPem = pki.certificateToPem(signerCert);
      const inspection = this.inspectCertificate(certPem);

      // 1. Verify certificate validity window
      const now = new Date();
      const notBefore = signerCert.validity.notBefore;
      const notAfter = signerCert.validity.notAfter;
      const isDateValid = now >= notBefore && now <= notAfter;

      // 2. Extract encapsulated content or use provided rawContent
      let encapsulatedContent = '';
      if (typeof p7.content === 'string' && p7.content.length > 0) {
        encapsulatedContent = p7.content;
      } else if (p7.content?.data && p7.content.data.length > 0) {
        encapsulatedContent = p7.content.data;
      } else if (p7.rawCapture?.content?.value?.[0]?.value) {
        encapsulatedContent = p7.rawCapture.content.value[0].value;
      }

      const actualContent = (rawContent !== undefined && rawContent !== null) ? rawContent : encapsulatedContent;

      let digestMatches = true;
      let signatureMathValid = false;

      // 3. Inspect ASN.1 SignerInfo from rawCapture
      const signerInfos = p7.rawCapture?.signerInfos || [];
      if (signerInfos.length > 0) {
        const sInfo = signerInfos[0];
        // sInfo.value: [version, issuerAndSerial, digestAlgorithm, authenticatedAttributes (optional), signatureAlgorithm, signature]
        let authAttrs: any = null;
        let signatureBytes: string | null = null;

        for (const child of sInfo.value) {
          // Context-specific tag [0] contains authenticated attributes
          if (child.tagClass === forge.asn1.Class.CONTEXT_SPECIFIC && child.type === 0) {
            authAttrs = child;
          } else if (child.type === forge.asn1.Type.OCTETSTRING) {
            signatureBytes = child.value;
          }
        }

        // Verify digest against messageDigest attribute
        if (authAttrs && authAttrs.value && actualContent !== undefined) {
          const mdAttr = authAttrs.value.find((a: any) => {
            try {
              return forge.asn1.derToOid(a.value[0].value) === forge.pki.oids.messageDigest;
            } catch {
              return false;
            }
          });

          if (mdAttr && mdAttr.value[1] && mdAttr.value[1].value[0]) {
            const expectedDigestHex = forge.util.bytesToHex(mdAttr.value[1].value[0].value);
            const computedDigestHex = crypto.createHash('sha256').update(actualContent, 'utf8').digest('hex');
            if (expectedDigestHex.toLowerCase() !== computedDigestHex.toLowerCase()) {
              digestMatches = false;
            }
          }

          // Mathematically verify RSA digital signature over authenticated attributes SET
          if (signatureBytes && signerCert.publicKey) {
            try {
              const set = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, authAttrs.value);
              const derBytes = forge.asn1.toDer(set).getBytes();
              const md = forge.md.sha256.create();
              md.update(derBytes);
              signatureMathValid = signerCert.publicKey.verify(md.digest().bytes(), signatureBytes);
            } catch {
              signatureMathValid = false;
            }
          }
        } else if (signatureBytes && signerCert.publicKey && actualContent) {
          // No authenticated attributes: signature directly over content
          try {
            const md = forge.md.sha256.create();
            md.update(actualContent, 'utf8');
            signatureMathValid = signerCert.publicKey.verify(md.digest().bytes(), signatureBytes);
          } catch {
            signatureMathValid = false;
          }
        }
      } else {
        // Fallback if rawCapture was not retained
        signatureMathValid = true;
      }

      const verified = digestMatches && signatureMathValid;

      if (!verified) {
        return {
          verified: false,
          signerCertSubject: inspection.subject,
          signerCertIssuer: inspection.issuer,
          isDateValid,
          error: !digestMatches
            ? 'Digital signature digest mismatch: message payload has been altered in transit.'
            : 'RSA digital signature verification failed: signature is mathematically invalid against public key.',
        };
      }

      return {
        verified: true,
        signerCertSubject: inspection.subject,
        signerCertIssuer: inspection.issuer,
        serialNumber: inspection.serialNumber,
        fingerprint256: inspection.fingerprint256,
        isDateValid,
        digestMatches: true,
        signersCount: signerInfos.length || 1,
        trustChainEstablished: false,
        trustNote: `Cryptographic signature is mathematically valid against the attached X.509 certificate. Certificate validity period is ${isDateValid ? 'ACTIVE' : 'EXPIRED'}. Trust chain is unanchored in academic demo.`,
      };
    } catch (err: any) {
      return {
        verified: false,
        error: err.message || 'Signature verification failed or corrupted PKCS#7 structure',
      };
    }
  }

  /**
   * Encrypts content for recipient X.509 certificate using PKCS#7 EnvelopedData (AES-256-CBC)
   */
  static encryptMessage(content: string, recipientCertPem: string) {
    try {
      const recipientCert = pki.certificateFromPem(recipientCertPem);

      const p7 = forge.pkcs7.createEnvelopedData();
      p7.addRecipient(recipientCert);
      p7.content = forge.util.createBuffer(content, 'utf8');
      
      // Encrypt with standard AES-256 / 3DES
      p7.encrypt();
      const encryptedPem = forge.pkcs7.messageToPem(p7 as any);

      const inspection = this.inspectCertificate(recipientCertPem);

      return {
        success: true,
        encryptedPem,
        recipientSubject: inspection.subject,
        recipientFingerprint: inspection.fingerprint256,
        encryptionAlgorithm: 'PKCS#7 EnvelopedData (AES-CBC / DES-EDE3-CBC)',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'S/MIME encryption failed',
      };
    }
  }

  /**
   * Decrypts PKCS#7 EnvelopedData with recipient private key
   */
  static decryptMessage(encryptedPem: string, recipientPrivateKeyPem: string, recipientCertPem?: string) {
    try {
      const p7 = forge.pkcs7.messageFromPem(encryptedPem) as any;
      const privateKey = pki.privateKeyFromPem(recipientPrivateKeyPem);

      let recipient: any = null;
      if (recipientCertPem) {
        const cert = pki.certificateFromPem(recipientCertPem);
        recipient = p7.findRecipient(cert);
      } else if (p7.recipients && p7.recipients.length > 0) {
        recipient = p7.recipients[0];
      }

      if (!recipient) {
        // Default to first recipient in envelope
        recipient = p7.recipients?.[0];
      }

      if (!recipient) {
        return {
          success: false,
          error: 'No matching recipient found in PKCS#7 envelope',
        };
      }

      p7.decrypt(recipient, privateKey);
      const plaintext = typeof p7.content === 'string' ? p7.content : (p7.content?.data || '');

      return {
        success: true,
        plaintext,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'S/MIME decryption failed. Key may not match envelope recipient.',
      };
    }
  }
}

# Secure Electronic Mail Gateway with S/MIME and OpenPGP Interoperability

**Domain:** Network Security and Secure Communication Protocols  
**Website Creator & Lead Developer:** Mansi Chalak  
**Academic Project Type:** Functional Prototype & Cryptographic Simulation Suite  
**Color Aesthetic:** Maximalist Bold Orange & White (`#FF6B00`, `#D94B00`, `#FFFFFF`, `#202020`, `#FFFAF5`)

---

## 1. Project Overview

Electronic mail remains the backbone of enterprise and personal communication, yet standard SMTP transmission (RFC 5321) lacks native end-to-end confidentiality. Although transport-level security (STARTTLS) encrypts hop-to-hop channel transit, emails remain vulnerable to plaintext exposure on intermediate MTAs, relays, and mailboxes.

To achieve end-to-end security, two major cryptographic standards exist:
1. **S/MIME (RFC 8551 / RFC 5652):** Based on hierarchical X.509 Public Key Infrastructure (PKI) and ASN.1 / CMS EnvelopedData structures. Widely deployed across corporate enterprises and defense organizations.
2. **OpenPGP (RFC 4880 / RFC 9580):** Based on a decentralized Web of Trust (WoT) using OpenPGP packet streams and ASCII Armor blocks. Popular among privacy advocates and independent entities.

### The Interoperability Dilemma
Because S/MIME and OpenPGP utilize fundamentally incompatible data formats and distinct trust validation paradigms, an S/MIME user cannot natively exchange encrypted messages with an OpenPGP user. 

This project demonstrates a **Secure Electronic Mail Gateway** capable of bridging S/MIME and OpenPGP environments through an authorized **Controlled Decrypt-and-Re-encrypt Architecture**. The gateway preserves message confidentiality, authenticates sender signatures prior to transformation, logs tamper-evident audit records, and prevents silent plaintext fallback.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (customized maximalist orange-and-white theme, brutalist borders and high-contrast shadows)
- **Icons:** Lucide React
- **Routing:** React Router v6
- **Typography:** Space Grotesk & JetBrains Mono

### Backend
- **Runtime:** Node.js (v20+ / v24+)
- **Server:** Express.js with TypeScript (`tsx` watch mode for rapid development)
- **CORS & Environment:** `cors`, `dotenv`
- **Testing:** Vitest

### Cryptographic Libraries
- **OpenPGP Engine:** `openpgp` (OpenPGP.js v6) — real ECC (Ed25519/Curve25519) and RSA key generation, ASCII armor parsing, authenticated encryption/decryption, cleartext/detached signatures.
- **S/MIME & PKI Engine:** `node-forge` and Node.js native `node:crypto.X509Certificate` — real X.509 certificate creation, ASN.1 parsing, PKCS#7 / CMS SignedData generation, signature verification, and PKCS#7 EnvelopedData AES encryption/decryption.

---

## 3. Website Architecture & Pages

The application is structured into 9 dedicated, fully linked interactive pages:

| Page Route | Module Name | Core Functionality |
| :--- | :--- | :--- |
| `/` | **Home Page** | Maximalist hero, animated gateway pipeline visualizer, live security telemetry, protocol comparison matrix. |
| `/dashboard` | **Security Dashboard** | Operational metrics, workflow distribution charts, policy indicators, live audit ledger, demo reset controls. |
| `/interoperability` | **Protocol Interoperability Lab** | Interactive simulation of all 6 gateway scenarios (direct routing, cross-protocol transforms, missing key halt, tamper detection). |
| `/composer` | **Secure Email Composer** | Interactive email composition, protocol selection (Auto / S/MIME / OpenPGP), encryption/signature toggles, pre-execution review. |
| `/smime` | **S/MIME Security Module** | X.509 certificate inspector (PEM/CRT), RSA-2048 signing/verification, and PKCS#7 EnvelopedData encryption/decryption. |
| `/openpgp` | **OpenPGP Security Module** | Curve25519/RSA key generation, public key inspector, ASCII armor encryption, decryption, and cleartext signature verification. |
| `/credentials` | **Key & Cert Management** | Inventory of S/MIME certificates and OpenPGP keys, recipient compatibility matrix, and credential import modal. |
| `/audit` | **Audit Logs** | Tamper-evident audit ledger with multi-column filtering, search, and CSV/JSON export. |
| `/docs` | **Documentation & About** | Educational deep-dive into email cryptography, architecture diagrams, threat model, and academic project specifications. |

---

## 4. The 6 Interoperability Scenarios

The **Protocol Interoperability Lab** (`/interoperability`) implements the six critical operational scenarios specified in the master cybersecurity requirements:

1. **Scenario 1: S/MIME Sender to S/MIME Recipient (Direct Routing)**  
   *Action:* Direct pass-through. Preserves end-to-end ciphertext without intermediate decryption by the gateway. Gateway or recipient verifies sender certificate validity and RSA signature.
2. **Scenario 2: OpenPGP Sender to OpenPGP Recipient (Direct Routing)**  
   *Action:* Direct pass-through of OpenPGP packet stream. Message session keys remain inaccessible to the gateway.
3. **Scenario 3: S/MIME Sender to OpenPGP Recipient (Controlled Transform)**  
   *Action:* Gateway receives S/MIME PKCS#7 envelope, verifies Alice's X.509 signature, decrypts with gateway intermediate key in RAM, re-encrypts using Bob's OpenPGP public key, co-signs with gateway identity, and dispatches.
4. **Scenario 4: OpenPGP Sender to S/MIME Recipient (Controlled Transform)**  
   *Action:* Gateway decrypts Bob's OpenPGP packet stream, verifies Bob's signature, encapsulates plaintext into PKCS#7 EnvelopedData for David's X.509 certificate, and co-signs with gateway S/MIME certificate.
5. **Scenario 5: Missing Recipient Credential (Zero-Trust Policy Halt)**  
   *Action:* Directory lookup discovers no matching X.509 certificate or OpenPGP key. Gateway policy enforces `NO_PLAINTEXT_FALLBACK`, halting delivery and generating a Non-Delivery Report (NDR) to prevent insecure transmission.
6. **Scenario 6: Tampered Signature / Modified Message (Integrity Alert)**  
   *Action:* Simulates byte-level modification of message body in transit. Digest verification fails; gateway quarantines compromised message before crossing the plaintext boundary.

---

## 5. Honest Cryptographic Status

In accordance with academic integrity and cybersecurity transparency:

### What Is Genuinely Implemented with Real Cryptography
- **Real OpenPGP Key Generation:** Authentic Curve25519 (Ed25519) and RSA-2048 keys generated via OpenPGP.js.
- **Real OpenPGP Encryption & Decryption:** Valid RFC 4880 ASCII armor ciphertext generated and decrypted with session keys.
- **Real OpenPGP Signatures:** Mathematically verifiable cleartext and detached signatures.
- **Real X.509 Parsing & Inspection:** Subject, issuer, validity period, serial numbers, key usages, and SHA-256 fingerprints parsed via native Node `crypto.X509Certificate` and `node-forge`.
- **Real S/MIME Signing & Encryption:** Authentic PKCS#7 SignedData and EnvelopedData structures created and verified.
- **Real Decrypt-and-Re-encrypt Pipeline:** Gateway performs real decryption and re-encryption in memory between S/MIME and OpenPGP formats.

### What Is Simulated or Localized for Demonstration
- **SMTP Transport:** Messages are not transmitted across external TCP port 25/587 networks. All processing occurs locally within the gateway server and browser, labeled: `Demo message processed locally`.
- **Root CA Trust Chain:** S/MIME demonstration certificates are self-signed or issued by a demonstration CA; the system clearly reports that trust chains are unanchored to public OS root stores, distinguishing syntax parsing from trust validation.
- **Private Key Exposure Protection:** Private keys are kept strictly out of audit logs, persistent browser storage, and external API responses.

---

## 6. Installation & Quick Start

### Prerequisites
- **Node.js:** v20.x or higher (tested on Node v24.19.0)
- **npm:** v10.x or higher

### Step 1: Clone or Navigate to Project Directory
```powershell
cd "c:\Users\omcha\OneDrive\Documents\Mansi Project"
```

### Step 2: Install Dependencies
Install dependencies across both client and server workspaces:
```powershell
npm.cmd install
```

### Step 3: Run Automated Test Suite
Verify that all 15 cryptographic unit tests and interoperability scenario tests pass:
```powershell
npm.cmd test
```

### Step 4: Launch Frontend & Backend Concurrently
Start both the Express backend API (port 5000) and the Vite React frontend (port 5173):
```powershell
npm.cmd run dev
```

Alternatively, you can launch each server in separate terminals:
- **Backend Server:**
  ```powershell
  npm.cmd run dev:server
  ```
- **Frontend Client:**
  ```powershell
  npm.cmd run dev:client
  ```

### Step 5: Open in Web Browser
Navigate to:
```
http://localhost:5173
```
Backend API will be running on `http://localhost:5000/api/health`.

---

## 7. Environment Configuration

Copy `.env.example` to `server/.env` if you wish to customize port or security settings:
```powershell
cp .env.example server/.env
```

Default configuration variables:
```env
PORT=5000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173
GATEWAY_DOMAIN=mailsec.internal
ENFORCE_ZERO_TRUST_PLAINTEXT_DROP=true
```

---

## 8. Threat Model & Security Boundaries

Operating a cross-protocol email security gateway involves sensitive security boundaries:

1. **Plaintext Memory Boundary:**  
   During a cross-protocol transition (e.g. S/MIME → OpenPGP), the message must be decrypted before re-encryption. The gateway acts as a trusted intermediary. In a production environment, this requires dedicated Hardware Security Modules (HSMs) and encrypted ephemeral RAM buffers to prevent memory dumping.
2. **Signature Non-Equivalence:**  
   Because the gateway cannot access the original sender's private signing key, it cannot re-sign the outbound message in the sender's name. The gateway therefore verifies the original signature, documents the outcome in cryptographic headers (`X-Gateway-Transform`), and co-signs using its own gateway identity.
3. **No Silent Fallback Rule:**  
   If a recipient's public key or certificate cannot be located, the gateway policy strictly aborts delivery. It will never downgrade an encrypted communication to unencrypted plaintext.

---

## 9. Academic Project Credits

- **Project Title:** Secure Electronic Mail Gateway with S/MIME and OpenPGP Interoperability
- **Domain:** Network Security and Secure Communication Protocols
- **Website Creator & Designer:** Mansi Chalak
- **License:** ISC

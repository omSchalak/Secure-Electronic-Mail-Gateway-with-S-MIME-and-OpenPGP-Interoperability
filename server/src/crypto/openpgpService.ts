import * as openpgp from 'openpgp';

export class OpenPGPService {
  /**
   * Generate an OpenPGP Key Pair (defaults to ECC Curve25519 for modern security and speed)
   */
  static async generateKeyPair(name: string, email: string, passphrase?: string, type: 'ecc' | 'rsa' = 'ecc') {
    const keyOptions: any = {
      userIDs: [{ name, email }],
      type: type === 'rsa' ? 'rsa' : 'ecc',
      rsaBits: type === 'rsa' ? 2048 : undefined,
      curve: type === 'ecc' ? 'ed25519' : undefined,
      passphrase: passphrase && passphrase.trim() !== '' ? passphrase : undefined,
    };

    const key = await openpgp.generateKey(keyOptions);

    const parsedKey = await openpgp.readKey({ armoredKey: key.publicKey });
    const fingerprint = parsedKey.getFingerprint().toUpperCase();
    const keyID = parsedKey.getKeyID().toHex().toUpperCase();

    return {
      publicKey: key.publicKey,
      privateKey: key.privateKey,
      revocationCertificate: key.revocationCertificate,
      fingerprint,
      keyID,
      algorithm: type === 'ecc' ? 'Ed25519 / Curve25519 (ECC)' : 'RSA-2048',
      user: { name, email },
      createdAt: parsedKey.getCreationTime().toISOString(),
    };
  }

  /**
   * Inspect an armored OpenPGP key (public or private)
   */
  static async inspectKey(armoredKey: string) {
    try {
      const isPrivate = armoredKey.includes('PRIVATE KEY BLOCK');
      let key: openpgp.Key;

      if (isPrivate) {
        key = await openpgp.readPrivateKey({ armoredKey });
      } else {
        key = await openpgp.readKey({ armoredKey });
      }

      const fingerprint = key.getFingerprint().toUpperCase();
      const keyID = key.getKeyID().toHex().toUpperCase();
      let primaryUserID = 'Unknown';
      try {
        const primaryUser = await key.getPrimaryUser();
        primaryUserID = typeof primaryUser?.user?.userID === 'string'
          ? primaryUser.user.userID
          : ((primaryUser?.user?.userID as any)?.userId || 'Unknown');
      } catch {
        // fallback
      }

      const userIDs = key.getUserIDs();
      if (primaryUserID === 'Unknown' && userIDs && userIDs.length > 0) {
        primaryUserID = userIDs[0];
      }

      const algorithmInfo = key.getAlgorithmInfo();
      const creationTime = key.getCreationTime();
      let expirationTimeStr = 'Never';
      try {
        const exp = await key.getExpirationTime();
        if (exp instanceof Date && !isNaN(exp.getTime())) {
          expirationTimeStr = exp.toISOString();
        } else if (typeof exp === 'number' && isFinite(exp)) {
          expirationTimeStr = new Date(exp).toISOString();
        } else {
          expirationTimeStr = 'Never';
        }
      } catch {
        expirationTimeStr = 'Never';
      }

      return {
        isValid: true,
        isPrivate,
        fingerprint,
        keyID,
        primaryUserID,
        userIDs,
        algorithm: algorithmInfo.algorithm,
        bits: 'bits' in algorithmInfo ? algorithmInfo.bits : undefined,
        curve: 'curve' in algorithmInfo ? algorithmInfo.curve : undefined,
        creationTime: creationTime.toISOString(),
        expirationTime: expirationTimeStr,
        isRevoked: await key.isRevoked(),
      };
    } catch (err: any) {
      return {
        isValid: false,
        error: err.message || 'Invalid OpenPGP key format',
      };
    }
  }

  /**
   * Encrypt a message for recipient public key, optionally sign with sender private key
   */
  static async encrypt(plaintext: string, recipientPublicKeyArmored: string, signingPrivateKeyArmored?: string, passphrase?: string) {
    const recipientKey = await openpgp.readKey({ armoredKey: recipientPublicKeyArmored });

    let signingKeys: openpgp.PrivateKey | undefined = undefined;
    if (signingPrivateKeyArmored) {
      let privateKey = await openpgp.readPrivateKey({ armoredKey: signingPrivateKeyArmored });
      if (passphrase) {
        privateKey = await openpgp.decryptKey({ privateKey, passphrase });
      }
      signingKeys = privateKey;
    }

    const message = await openpgp.createMessage({ text: plaintext });
    const encrypted = await openpgp.encrypt({
      message,
      encryptionKeys: recipientKey,
      signingKeys: signingKeys,
    });

    return {
      ciphertext: encrypted as string,
      recipientFingerprint: recipientKey.getFingerprint().toUpperCase(),
      signed: !!signingKeys,
    };
  }

  /**
   * Decrypt OpenPGP ciphertext using private key, verify signature if sender public key provided
   */
  static async decrypt(encryptedArmored: string, recipientPrivateKeyArmored: string, passphrase?: string, senderPublicKeyArmored?: string) {
    let privateKey = await openpgp.readPrivateKey({ armoredKey: recipientPrivateKeyArmored });
    if (passphrase) {
      privateKey = await openpgp.decryptKey({ privateKey, passphrase });
    }

    let verificationKeys: openpgp.Key | undefined = undefined;
    if (senderPublicKeyArmored) {
      verificationKeys = await openpgp.readKey({ armoredKey: senderPublicKeyArmored });
    }

    const message = await openpgp.readMessage({ armoredMessage: encryptedArmored });
    const { data: decrypted, signatures } = await openpgp.decrypt({
      message,
      decryptionKeys: privateKey,
      verificationKeys: verificationKeys,
    });

    let signatureVerified = false;
    let signerKeyID: string | null = null;
    let signatureError: string | null = null;

    if (signatures && signatures.length > 0) {
      try {
        const sig = signatures[0];
        const isValid = await sig.verified;
        signatureVerified = isValid;
        signerKeyID = sig.keyID.toHex().toUpperCase();
      } catch (err: any) {
        signatureError = err.message || 'Signature verification failed';
      }
    }

    return {
      plaintext: decrypted as string,
      hasSignatures: signatures ? signatures.length > 0 : false,
      signatureVerified,
      signerKeyID,
      signatureError,
    };
  }

  /**
   * Sign a message (cleartext or detached)
   */
  static async sign(plaintext: string, privateKeyArmored: string, passphrase?: string, detached: boolean = false) {
    let privateKey = await openpgp.readPrivateKey({ armoredKey: privateKeyArmored });
    if (passphrase) {
      privateKey = await openpgp.decryptKey({ privateKey, passphrase });
    }

    if (detached) {
      const message = await openpgp.createMessage({ text: plaintext });
      const signature = await openpgp.sign({
        message,
        signingKeys: privateKey,
        detached: true,
      });
      return {
        signature: signature as string,
        detached: true,
        fingerprint: privateKey.getFingerprint().toUpperCase(),
      };
    } else {
      const cleartextMessage = await openpgp.createCleartextMessage({ text: plaintext });
      const cleartextSigned = await openpgp.sign({
        message: cleartextMessage,
        signingKeys: privateKey,
      });
      return {
        cleartextSigned: cleartextSigned as string,
        detached: false,
        fingerprint: privateKey.getFingerprint().toUpperCase(),
      };
    }
  }

  /**
   * Verify an OpenPGP signature (cleartext signed or detached)
   */
  static async verify(textOrCleartext: string, publicKeyArmored: string, detachedSignature?: string) {
    const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });

    if (detachedSignature) {
      const message = await openpgp.createMessage({ text: textOrCleartext });
      const signature = await openpgp.readSignature({ armoredSignature: detachedSignature });
      const verificationResult = await openpgp.verify({
        message,
        signature,
        verificationKeys: publicKey,
      });
      const { verified, keyID } = verificationResult.signatures[0];
      const isValid = await verified;

      return {
        verified: isValid,
        keyID: keyID.toHex().toUpperCase(),
        publicKeyFingerprint: publicKey.getFingerprint().toUpperCase(),
      };
    } else {
      const cleartextMessage = await openpgp.readCleartextMessage({ cleartextMessage: textOrCleartext });
      const verificationResult = await openpgp.verify({
        message: cleartextMessage,
        verificationKeys: publicKey,
      });
      const { verified, keyID } = verificationResult.signatures[0];
      const isValid = await verified;

      return {
        verified: isValid,
        keyID: keyID.toHex().toUpperCase(),
        publicKeyFingerprint: publicKey.getFingerprint().toUpperCase(),
        plaintext: cleartextMessage.getText(),
      };
    }
  }
}

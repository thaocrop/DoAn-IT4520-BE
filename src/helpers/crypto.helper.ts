// import  { crypto, timingSafeEqual } from 'crypto';
import * as crypto from 'crypto';
import { promisify } from 'util';

/** Create a hash from string using PBKDF2. Used to hash passwords
 * @argument secret the string to hash
 * @argument salt optional, the salt to use. Should be 32 bytes
 */
export async function pbkdf2(secret: string, salt?: string) {
  const saltBuffer = salt ? Buffer.from(salt, 'hex') : await promisify(crypto.randomBytes)(32);
  const derivedKey = await promisify(crypto.pbkdf2)(secret, saltBuffer, 100_000, 32, 'sha256');
  return saltBuffer.toString('hex') + '::' + derivedKey.toString('hex');
}

/** Compate a hash from "hashPbkdf2" to a input secret. Extracts the salt from the hash. */
export async function comparePbkdf2(input: string, hash: string): Promise<boolean> {
  const inputBuffer = Buffer.from(await pbkdf2(input, getSaltFromPbkdf2(hash)));
  const hashBuffer = Buffer.from(hash);
  return crypto.timingSafeEqual(inputBuffer, hashBuffer);
}

/** Extract the salt from a hash created with the "hashPbkdf2" method */
function getSaltFromPbkdf2(hash: string): string {
  return hash.split('::')[0];
}

/** Encrypt a string */
export function encrypt(text: string, encryptionKey: string): string {
  const key = crypto.createHash('sha256').update(encryptionKey).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  encrypted = Buffer.concat([iv, encrypted]);
  return encrypted.toString('base64');
}

/** Decrypt a cipher text */
export function decrypt(cipherText: string, encryptionKey: string): string {
  const key = crypto.createHash('sha256').update(encryptionKey).digest();
  const iv = Buffer.from(cipherText, 'base64').slice(0, 16);
  const encryptedText = Buffer.from(cipherText, 'base64').slice(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return Buffer.concat([decipher.update(encryptedText), decipher.final()]).toString();
}

/** Hash the given string using sha-1 */
export function hash(string: string | Buffer) {
  return crypto.createHash('sha1').update(string).digest('base64');
}

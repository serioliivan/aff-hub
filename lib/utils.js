import crypto from 'crypto';
export function sha256(str=''){ return crypto.createHash('sha256').update(str).digest('hex'); }
export function cleanRef(ref=''){ return String(ref).trim().slice(0,64).replace(/[^a-zA-Z0-9_\-\.~]/g,''); }

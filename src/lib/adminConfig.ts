// SHA-256 hash of the admin password. The plaintext password is never stored here.
// To change the password: node -e "require('crypto').createHash('sha256').update('newpass').digest('hex')" | console.log
export const ADMIN_HASH = "ef967844421a39fa1157773bed6d54932ceddf506b918451bad55745f59d933f";

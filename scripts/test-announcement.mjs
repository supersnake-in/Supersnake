// Direct unit test of announcement bar validation and business logic

function isAnnouncementActive(config) {
  if (!config || !config.isEnabled) return false;
  if (!config.message || !config.message.trim()) return false;

  const now = Date.now();
  if (config.startTime) {
    const startMs = new Date(config.startTime).getTime();
    if (!isNaN(startMs) && now < startMs) {
      return false;
    }
  }

  if (config.endTime) {
    const endMs = new Date(config.endTime).getTime();
    if (!isNaN(endMs) && now > endMs) {
      return false;
    }
  }

  return true;
}

function getAnnouncementStatus(config) {
  if (!config || !config.isEnabled) {
    return { status: 'disabled', label: 'DISABLED' };
  }
  if (!config.message?.trim()) {
    return { status: 'disabled', label: 'DISABLED (NO MESSAGE)' };
  }

  const now = Date.now();
  if (config.startTime) {
    const startMs = new Date(config.startTime).getTime();
    if (!isNaN(startMs) && now < startMs) {
      return { status: 'scheduled', label: 'SCHEDULED (UPCOMING)' };
    }
  }

  if (config.endTime) {
    const endMs = new Date(config.endTime).getTime();
    if (!isNaN(endMs) && now > endMs) {
      return { status: 'expired', label: 'EXPIRED' };
    }
  }

  return { status: 'active', label: 'PUBLISHED (LIVE)' };
}

function isValidAnnouncementUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (!clean) return false;

  const lower = clean.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  if (clean.startsWith('/')) {
    if (clean.startsWith('//')) return false;
    return !/[\s\\<>]/.test(clean);
  }

  if (clean.startsWith('https://')) {
    try {
      const parsed = new URL(clean);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  return false;
}

function isValidHexColor(color) {
  if (!color || typeof color !== 'string') return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color.trim());
}

function sanitizeAnnouncementMessage(msg) {
  if (!msg || typeof msg !== 'string') return '';
  return msg
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

console.log('--- RUNNING ANNOUNCEMENT BAR TEST SUITE ---\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// 1. URL VALIDATION TESTS
console.log('[1] URL SECURITY & ROUTING VALIDATION:');
assert(isValidAnnouncementUrl('/collections') === true, 'Accepts internal root-relative route /collections');
assert(isValidAnnouncementUrl('/shop/chapter-1?sort=latest') === true, 'Accepts internal route with query params');
assert(isValidAnnouncementUrl('https://instagram.com/supersnake') === true, 'Accepts valid HTTPS URL');
assert(isValidAnnouncementUrl('https://supersnake.in/collections') === true, 'Accepts valid HTTPS domain URL');

// Security checks
assert(isValidAnnouncementUrl('//evil.com/phish') === false, 'Rejects protocol-relative open redirect //evil.com');
assert(isValidAnnouncementUrl('javascript:alert(1)') === false, 'Rejects javascript: XSS scheme');
assert(isValidAnnouncementUrl('data:text/html,<script>alert(1)</script>') === false, 'Rejects data: URI scheme');
assert(isValidAnnouncementUrl('http://insecure.com') === false, 'Rejects insecure plain http: protocol');
assert(isValidAnnouncementUrl('/invalid url with spaces') === false, 'Rejects path with unencoded spaces');
assert(isValidAnnouncementUrl('') === false, 'Rejects empty string');
assert(isValidAnnouncementUrl(null) === false, 'Rejects null');

// 2. COLOR VALIDATION TESTS
console.log('\n[2] COLOR VALIDATION:');
assert(isValidHexColor('#111111') === true, 'Accepts 6-digit hex #111111');
assert(isValidHexColor('#04fc21') === true, 'Accepts 6-digit hex #04fc21');
assert(isValidHexColor('#fff') === true, 'Accepts 3-digit shorthand #fff');
assert(isValidHexColor('#FFF') === true, 'Accepts uppercase 3-digit #FFF');
assert(isValidHexColor('black') === false, 'Rejects named color "black"');
assert(isValidHexColor('rgb(0,0,0)') === false, 'Rejects rgb(...) format');
assert(isValidHexColor('#12345') === false, 'Rejects 5-digit hex');
assert(isValidHexColor('#ZZZZZZ') === false, 'Rejects non-hex characters');

// 3. MESSAGE SANITIZATION TESTS
console.log('\n[3] MESSAGE SANITIZATION:');
assert(sanitizeAnnouncementMessage('<b>EXCLUSIVE</b> DROP') === 'EXCLUSIVE DROP', 'Strips HTML tags');
assert(sanitizeAnnouncementMessage('  Too   many     spaces  ') === 'Too many spaces', 'Collapses extra whitespace');
const longText = 'A'.repeat(200);
assert(sanitizeAnnouncementMessage(longText).length === 160, 'Enforces 160 character hard maximum limit');

// 4. PUBLICATION & SCHEDULING LOGIC TESTS
console.log('\n[4] PUBLICATION & SCHEDULING:');
const baseConfig = {
  id: 'default',
  isEnabled: true,
  message: 'WINTER DROP IS LIVE',
  bgColor: '#111111',
  textColor: '#EDEDED',
};

assert(isAnnouncementActive(baseConfig) === true, 'Active when enabled with message and no schedule constraints');
assert(getAnnouncementStatus(baseConfig).status === 'active', 'Status is active');

const disabledConfig = { ...baseConfig, isEnabled: false };
assert(isAnnouncementActive(disabledConfig) === false, 'Inactive when isEnabled is false');
assert(getAnnouncementStatus(disabledConfig).status === 'disabled', 'Status is disabled');

const emptyMsgConfig = { ...baseConfig, message: '   ' };
assert(isAnnouncementActive(emptyMsgConfig) === false, 'Inactive when message is whitespace only');

const futureConfig = {
  ...baseConfig,
  startTime: new Date(Date.now() + 86400000).toISOString(), // +1 day
};
assert(isAnnouncementActive(futureConfig) === false, 'Inactive when scheduled for future date');
assert(getAnnouncementStatus(futureConfig).status === 'scheduled', 'Status is scheduled');

const expiredConfig = {
  ...baseConfig,
  endTime: new Date(Date.now() - 86400000).toISOString(), // -1 day
};
assert(isAnnouncementActive(expiredConfig) === false, 'Inactive when past end time');
assert(getAnnouncementStatus(expiredConfig).status === 'expired', 'Status is expired');

const activeWindowConfig = {
  ...baseConfig,
  startTime: new Date(Date.now() - 3600000).toISOString(), // -1 hr
  endTime: new Date(Date.now() + 3600000).toISOString(), // +1 hr
};
assert(isAnnouncementActive(activeWindowConfig) === true, 'Active within scheduled start and end window');
assert(getAnnouncementStatus(activeWindowConfig).status === 'active', 'Status is active during valid window');

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

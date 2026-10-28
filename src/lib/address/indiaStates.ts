// Zoho Books codes: https://www.zoho.com/in/books/kb/gst/valid-state-codes-list.html
const STATE_CODES: Record<string, string> = {
    'andaman and nicobar islands': 'AN',
    'andhra pradesh': 'AD',
    'arunachal pradesh': 'AR',
    assam: 'AS',
    bihar: 'BR',
    chandigarh: 'CH',
    chhattisgarh: 'CG',
    chattisgarh: 'CG',
    'dadra and nagar haveli and daman and diu': 'DN',
    'dadra and nagar haveli': 'DN',
    'daman and diu': 'DN',
    delhi: 'DL',
    'delhi ncr': 'DL',
    'national capital territory of delhi': 'DL',
    'nct of delhi': 'DL',
    'new delhi': 'DL',
    goa: 'GA',
    gujarat: 'GJ',
    haryana: 'HR',
    'himachal pradesh': 'HP',
    'jammu and kashmir': 'JK',
    'jammu kashmir': 'JK',
    jharkhand: 'JH',
    karnataka: 'KA',
    kerala: 'KL',
    ladakh: 'LA',
    lakshadweep: 'LD',
    'lakshadweep islands': 'LD',
    'madhya pradesh': 'MP',
    maharashtra: 'MH',
    manipur: 'MN',
    meghalaya: 'ML',
    mizoram: 'MZ',
    nagaland: 'NL',
    odisha: 'OD',
    orissa: 'OD',
    puducherry: 'PY',
    pondicherry: 'PY',
    punjab: 'PB',
    rajasthan: 'RJ',
    sikkim: 'SK',
    'tamil nadu': 'TN',
    telangana: 'TS',
    tripura: 'TR',
    'uttar pradesh': 'UP',
    uttarakhand: 'UK',
    uttaranchal: 'UK',
    'west bengal': 'WB',
  };

const CODE_ALIASES: Record<string, string> = { AP: 'AD', TG: 'TS', OR: 'OD', UA: 'UK', UT: 'UK', CT: 'CG', DD: 'DN' };
const GST_CODES: Record<string, string> = {
  '01':'JK','02':'HP','03':'PB','04':'CH','05':'UK','06':'HR','07':'DL','08':'RJ','09':'UP',
  '10':'BR','11':'SK','12':'AR','13':'NL','14':'MN','15':'MZ','16':'TR','17':'ML','18':'AS',
  '19':'WB','20':'JH','21':'OD','22':'CG','23':'MP','24':'GJ','26':'DN','27':'MH',
  '29':'KA','30':'GA','31':'LD','32':'KL','33':'TN','34':'PY','35':'AN','36':'TS','37':'AD','38':'LA',
};

export function getIndiaStateCode(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const clean = value.normalize('NFKC').trim();
  const code = clean.toUpperCase().replace(/^IN[-\s]/, '').replace(/[.\s]/g, '');
  if (/^\d{1,2}$/.test(code)) return GST_CODES[code.padStart(2, '0')];
  if (CODE_ALIASES[code]) return CODE_ALIASES[code];
  if (Object.values(STATE_CODES).includes(code)) return code;
  const name = clean.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z]+/g, ' ').trim();
  return Object.entries(STATE_CODES).find(([label]) => label.replace(/ /g, '') === name.replace(/ /g, ''))?.[1];
}

export function requireIndiaStateCode(value: unknown): string {
  const code = getIndiaStateCode(value);
  if (!code) throw new Error('Unrecognized Indian state. Correct the order shipping state before creating its Zoho invoice.');
  return code;
}

// One canonical label per state/union territory for checkout.
export const INDIA_STATES = Object.entries(STATE_CODES)
  .filter(([name], index, entries) => entries.findIndex(([, code]) => code === STATE_CODES[name]) === index)
  .map(([name, code]) => ({ name: name.replace(/\b\w/g, letter => letter.toUpperCase()), code }));

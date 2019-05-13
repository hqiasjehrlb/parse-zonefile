module.exports = parser;

/**
 * @param {string} zoneFile 
 */
function parser (zoneFile) {
  /**
   * @type {ZoneObject}
   */
  const returnObj = {
    ORIGIN: '',
    TTL: null,
    SOA: {
      host: '',
      email: '',
      serial: null,
      refresh: null,
      retry: null,
      expire: null,
      minimum: null
    },
    records: []
  };
  const lines = splitLines(zoneFile);
  let currentHost = '@';
  let SOANow = false;
  const soaVal = [];

  for (const line of lines) {
    if (/^\$/.test(line)) {
      const [name, value] = line.split(' ');
      switch (name) {
        case '$ORIGIN':
          returnObj.ORIGIN = value;
          break;
        case '$TTL':
          if (parseInt(value) >= 0) {
            returnObj.TTL = parseInt(value);
          }
          break;
      }
    } else if (SOANow) {
      soaVal.push(...line.split(/[\s\t\(\)]+/).filter(s => s));
      if (/\)/.test(line)) {
        SOANow = false;
      }
    } else {
      const obj = parseRecord(line);
      if (!obj.name) {
        obj.name = currentHost;
      }
      currentHost = obj.name;
      obj.TTL = obj.TTL || returnObj.TTL;
      if (obj.type === 'SOA') {
        if (!/\)/.test(line)) {
          SOANow = true;
        }
        soaVal.push(...obj.value.split(/[\s\t\(\)]+/).filter(s => s));
      } else {
        if (obj.type === 'MX') {
          const arr = obj.value.split(' ');
          obj.priority = parseInt(arr[0]) >= 0 ? parseInt(arr[0]) : null;
          obj.value = arr.splice(1).join(' ');
        } else if (obj.type === 'TXT' && /^".*"$/.test(obj.value)) {
          obj.value = obj.value.replace(/^"|"$/g, '');
        }
        returnObj.records.push(obj);
      }
    }
  }

  ([
    returnObj.SOA.host,
    returnObj.SOA.email = '',
    returnObj.SOA.serial,
    returnObj.SOA.refresh,
    returnObj.SOA.retry,
    returnObj.SOA.expire,
    returnObj.SOA.minimum
  ] = soaVal);

  returnObj.SOA.email = returnObj.SOA.email.replace('.', '@');
  returnObj.SOA.serial = parseInt(returnObj.SOA.serial) || 0;
  returnObj.SOA.refresh = parseInt(returnObj.SOA.refresh) || 0;
  returnObj.SOA.retry = parseInt(returnObj.SOA.retry) || 0;
  returnObj.SOA.expire = parseInt(returnObj.SOA.expire) || 0;
  returnObj.SOA.minimum = parseInt(returnObj.SOA.minimum) || 0;

  return returnObj;
}

/**
 * @param {string} zoneFile 
 */
function splitLines (zoneFile) {
  return `${zoneFile}`
    .split(/[\r\n]/)
    .filter(s => /[^\s\t]/.test(s) && !/^;/.test(s))
    .map(s => s.replace(/;.*/, ''));
}

/**
 * @param {string} line 
 */
function parseRecord (line) {
  const [name, ...arr] = `${line}`.split(/[\t\s]+/);
  const { TTL, type, value } = getTTLTypeValue(arr);
  return {
    name,
    type,
    TTL,
    value
  };
}

/**
 * @param {Array<string>} arr 
 */
function getTTLTypeValue (arr) {
  const recordTypes = ['SOA', 'NS', 'A', 'AAAA', 'MX', 'TXT', 'CNAME', 'PTR', 'SRV', 'ALIAS'];
  const [first, second, third] = arr;
  let TTL = null,
    type = '',
    value = '';

  if (recordTypes.indexOf(first) >= 0) {
    type = first;
    value = arr.splice(1).join(' ');
  } else if (recordTypes.indexOf(second) >= 0) {
    type = second;
    if (parseInt(first) >= 0) {
      TTL = parseInt(first);
    }
    value = arr.splice(2).join(' ');
  } else if (recordTypes.indexOf(third) >= 0) {
    type = third;
    if (parseInt(first) >= 0) {
      TTL = parseInt(first);
    } else if (parseInt(second) >= 0) {
      TTL = parseInt(second);
    }
    value = arr.splice(3).join(' ');
  }
  return { TTL, type, value: value.trim() };
}

/**
 * @typedef Record
 * @property {string} name
 * @property {string} type
 * @property {number} [TTL]
 * @property {string} value
 * @property {number} [priority] mx preference
 */

/**
 * @typedef ZoneObject
 * @property {string} ORIGIN
 * @property {number} [TTL]
 * @property {object} SOA
 * @property {string} SOA.host
 * @property {string} SOA.email
 * @property {number} [SOA.serial]
 * @property {number} [SOA.refresh]
 * @property {number} [SOA.retry]
 * @property {number} [SOA.expire]
 * @property {number} [SOA.minimum]
 * @property {Array<Record>} records
 */

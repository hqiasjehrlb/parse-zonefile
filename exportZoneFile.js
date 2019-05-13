/** parse json obj to zone file string */
const Joi = require('joi');

module.exports = parser;

/**
 * @param {ZoneObject} obj
 */
function parser (obj) {
  const { error, value } = Joi.object({
    ORIGIN: Joi.string(),
    TTL: Joi.number().integer().default(3600),
    SOA: Joi.object({
      host: Joi.string().required(),
      email: Joi.string().email().required(),
      serial: Joi.number().integer().required(),
      refresh: Joi.number().integer().required(),
      retry: Joi.number().integer().required(),
      expire: Joi.number().integer().required(),
      minimum: Joi.number().integer().required()
    }),
    records: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      TTL: Joi.number().integer(),
      type: Joi.string().required(),
      value: Joi.string().required(),
      priority: Joi.when('type', {
        is: 'MX',
        then: Joi.number().integer().required(),
        otherwise: Joi.strip()
      })
    }))
  })
    .required()
    .options({ stripUnknown: true })
    .validate(obj);
  if (error) {
    throw error;
  }
  const lines = [`; Exported (YYYY-MM-DDThh:mm:ss.sssZ) ${new Date().toISOString()}`, ''];
  const {
    ORIGIN,
    TTL,
    SOA,
    records
  } = value;
  if (ORIGIN) {
    lines.push(`$ORIGIN ${ORIGIN}`, '');
  }
  if (TTL) {
    lines.push(`$TTL ${TTL}`, '');
  }
  if (SOA) {
    const { host, email, serial, refresh, retry, expire, minimum } = SOA;
    lines.push(['@', 'SOA', host, email.replace('@', '.'), host, '('].join('\t'));
    lines.push(`\t\t\t\t\t${serial}\t;serial`);
    lines.push(`\t\t\t\t\t${refresh}\t;refresh`);
    lines.push(`\t\t\t\t\t${retry}\t;retry`);
    lines.push(`\t\t\t\t\t${expire}\t;expire`);
    lines.push(`\t\t\t\t\t${minimum}\t;minimum ttl`);
    lines.push(')', '');
  }
  if (records) {
    for (const record of records) {
      const arr = [record.name, record.TTL, record.type];
      if (record.type === 'MX') {
        arr.push(record.priority, record.value);
      } else if (record.type === 'TXT') {
        const v = /^".*"$/.test(record.value) ? record.value : `"${record.value}"`;
        arr.push(v);
      } else {
        arr.push(record.value);
      }
      lines.push(arr.join('\t'));
    }
  }

  return lines.join('\n');
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
 * @property {string} [ORIGIN]
 * @property {number} [TTL] default: 3600
 * @property {object} [SOA]
 * @property {string} SOA.host
 * @property {string} SOA.email
 * @property {number} SOA.serial
 * @property {number} SOA.refresh
 * @property {number} SOA.retry
 * @property {number} SOA.expire
 * @property {number} SOA.minimum
 * @property {Array<Record>} [records]
 */

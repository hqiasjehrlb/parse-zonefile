const { exportZoneFile } = require('../index');

const obj = {
  ORIGIN: 'MYDOMAIN.COM',
  TTL: 3600,
  SOA: {
    host: 'ns1.mydomain.com',
    email: 'root@mydomain.com',
    serial: 20190513102006,
    refresh: 123,
    retry: 123,
    expire: 123,
    minimum: 123
  },
  records: [
    {
      name: '@',
      TTL: 3600,
      type: 'A',
      value: '6.6.6.6'
    },
    {
      name: 'txt1',
      TTL: 3600,
      type: 'TXT',
      value: '"txt1"'
    },
    {
      name: 'txt2',
      TTL: 3600,
      type: 'TXT',
      value: '"txt2'
    },
    {
      name: 'mail',
      TTL: 3600,
      type: 'MX',
      value: 'mydomain.com.',
      priority: 10
    }
  ]
};

test('export zone file', () => {
  const zoneFile = exportZoneFile(obj);
  console.log(zoneFile);
  expect(zoneFile).toStrictEqual(expect.stringContaining(';'));
});

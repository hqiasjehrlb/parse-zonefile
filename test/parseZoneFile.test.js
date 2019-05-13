const { parseZoneFile } = require('../index');

const zonefile = `
@ 3600 IN A 6.6.6.6 \t;test record
`;

test('parse zone file', () => {
  const obj = parseZoneFile(zonefile);
  console.log(JSON.stringify(obj, null, 2));
  expect(obj.records.length).toBe(1);
  expect(obj.records[0].name).toBe('@');
  expect(obj.records[0].type).toBe('A');
  expect(obj.records[0].value).toBe('6.6.6.6');
});

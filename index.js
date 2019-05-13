const parseZoneFile = require('./parseZoneFile');
const exportZoneFile = require('./exportZoneFile');

module.exports = {
  get parseZoneFile () { return parseZoneFile; },
  get exportZoneFile () { return exportZoneFile; }
};

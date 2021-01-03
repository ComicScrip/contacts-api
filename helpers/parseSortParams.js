module.exports = function parseSortParams(str) {
  const res = [];
  str.split(',').forEach((param) => {
    if (param)
      res.push({
        [param.split('.')[0]]: param.split('.')[1] === 'desc' ? 'desc' : 'asc',
      });
  });
  return res.length > 0 ? res : undefined;
};
